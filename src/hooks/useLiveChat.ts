import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
  is_admin: boolean;
}

export interface ChatRoom {
  id: string;
  user_id: string;
  admin_id?: string;
  status: 'waiting' | 'active' | 'closed';
  subject: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  last_message?: string;
  unread_count: number;
}

export const useLiveChat = () => {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [onlineAdmins, setOnlineAdmins] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentRoom) {
      loadMessages();
      setupRealtimeSubscription();
      
      // Mark messages as read
      markMessagesAsRead();
    }

    return () => {
      if (currentRoom) {
        leaveRoom();
      }
    };
  }, [currentRoom]);

  const createChatRoom = async (subject: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          user_id: user.id,
          subject,
          priority,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRoom(data);
      
      // Send initial system message
      await sendSystemMessage('Destek talebiniz oluşturuldu. Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.');
      
      // Notify admins about new support request
      await notifyAdmins(data.id, subject);

      toast({
        title: "Destek Talebi Oluşturuldu",
        description: "Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.",
      });

      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        title: "Hata",
        description: "Destek talebi oluşturulurken hata oluştu.",
        variant: "destructive"
      });
      return null;
    }
  };

  const joinExistingRoom = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      setCurrentRoom(data);
      return data;
    } catch (error) {
      console.error('Error joining chat room:', error);
      return null;
    }
  };

  const loadMessages = async () => {
    if (!currentRoom) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(first_name, last_name, avatar_url)
        `)
        .eq('chat_room_id', currentRoom.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        chat_room_id: msg.chat_room_id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || 
          (msg.sender ? `${msg.sender.first_name || ''} ${msg.sender.last_name || ''}`.trim() : 'Anonim'),
        sender_avatar: msg.sender?.avatar_url,
        message: msg.message,
        message_type: msg.message_type,
        created_at: msg.created_at,
        is_admin: msg.is_admin || false
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentRoom) return;

    const channel = supabase
      .channel(`chat_room_${currentRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${currentRoom.id}`
      }, (payload) => {
        const newMessage = payload.new as any;
        const formattedMessage: ChatMessage = {
          id: newMessage.id,
          chat_room_id: newMessage.chat_room_id,
          sender_id: newMessage.sender_id,
          sender_name: newMessage.sender_name,
          sender_avatar: newMessage.sender_avatar,
          message: newMessage.message,
          message_type: newMessage.message_type,
          created_at: newMessage.created_at,
          is_admin: newMessage.is_admin || false
        };

        setMessages(prev => [...prev, formattedMessage]);
        
        // Show notification if message is from admin
        if (newMessage.is_admin) {
          toast({
            title: "Yeni Mesaj",
            description: newMessage.message,
          });
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const adminUsers = Object.values(newState).filter((user: any) => user[0]?.is_admin);
        setOnlineAdmins(adminUsers.length);
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== supabase.auth.getUser()) {
          setAdminTyping(payload.payload.typing);
          
          if (payload.payload.typing) {
            setTimeout(() => setAdminTyping(false), 3000);
          }
        }
      })
      .subscribe();

    setIsConnected(true);

    // Track user presence
    channel.track({
      user_id: supabase.auth.getUser(),
      is_admin: false,
      online_at: new Date().toISOString()
    });

    return channel;
  };

  const sendMessage = async (message: string) => {
    if (!currentRoom || !message.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const senderName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Kullanıcı';

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: currentRoom.id,
          sender_id: user.id,
          sender_name: senderName,
          message: message.trim(),
          message_type: 'text',
          is_admin: false
        });

      if (error) throw error;

      // Update room's last activity
      await supabase
        .from('chat_rooms')
        .update({ 
          updated_at: new Date().toISOString(),
          last_message: message.trim().substring(0, 100)
        })
        .eq('id', currentRoom.id);

      // Stop typing indicator
      stopTyping();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const sendSystemMessage = async (message: string) => {
    if (!currentRoom) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: currentRoom.id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_name: 'Sistem',
          message,
          message_type: 'system',
          is_admin: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  const startTyping = () => {
    if (!currentRoom) return;

    setIsTyping(true);
    
    // Broadcast typing indicator
    supabase
      .channel(`chat_room_${currentRoom.id}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { typing: true, user_id: supabase.auth.getUser() }
      });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!currentRoom) return;

    setIsTyping(false);

    // Broadcast stop typing
    supabase
      .channel(`chat_room_${currentRoom.id}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { typing: false, user_id: supabase.auth.getUser() }
      });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentRoom) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('chat_rooms')
        .update({ unread_count: 0 })
        .eq('id', currentRoom.id)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const closeChat = async () => {
    if (!currentRoom) return;

    try {
      await supabase
        .from('chat_rooms')
        .update({ status: 'closed' })
        .eq('id', currentRoom.id);

      await sendSystemMessage('Destek görüşmesi kapatıldı. Teşekkür ederiz!');

      setCurrentRoom(null);
      setMessages([]);
      setIsConnected(false);

      toast({
        title: "Görüşme Kapatıldı",
        description: "Destek görüşmesi başarıyla kapatıldı.",
      });
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setMessages([]);
    setIsConnected(false);
    setIsTyping(false);
    setAdminTyping(false);
  };

  const notifyAdmins = async (roomId: string, subject: string) => {
    try {
      await supabase.functions.invoke('notify-admins', {
        body: {
          type: 'new_support_request',
          roomId,
          subject,
          message: `Yeni destek talebi: ${subject}`
        }
      });
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  };

  return {
    currentRoom,
    messages,
    isConnected,
    isTyping,
    adminTyping,
    onlineAdmins,
    messagesEndRef,
    createChatRoom,
    joinExistingRoom,
    sendMessage,
    startTyping,
    stopTyping,
    closeChat,
    leaveRoom
  };
};