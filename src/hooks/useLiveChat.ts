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
  const [onlineAdmins, setOnlineAdmins] = useState(1); // Mock online admins
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
      const channel = setupRealtimeSubscription();
      setIsConnected(true);
      markMessagesAsRead();
      
      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
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

      // Create real chat room in database
      const { data: room, error } = await supabase
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

      const chatRoom: ChatRoom = {
        id: room.id,
        user_id: room.user_id,
        admin_id: room.admin_id,
        subject: room.subject,
        priority: room.priority as 'low' | 'medium' | 'high',
        status: room.status as 'waiting' | 'active' | 'closed',
        created_at: room.created_at,
        updated_at: room.updated_at,
        last_message: room.last_message,
        unread_count: room.unread_count
      };
      
      setCurrentRoom(chatRoom);
      await sendSystemMessage('Destek talebiniz oluşturuldu. Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.');
      
      toast({
        title: "Destek Talebi Oluşturuldu",
        description: "Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.",
      });

      return chatRoom;
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
      // Create a mock room for now until types are updated
      const room: ChatRoom = {
        id: roomId,
        user_id: 'current-user',
        subject: 'Existing Room',
        priority: 'medium',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0
      };

      setCurrentRoom(room);
      return room;
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
        .select('*')
        .eq('chat_room_id', currentRoom.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'system'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentRoom) return;

    const channel = supabase
      .channel(`chat_room_${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          loadMessages();
          // Show admin typing indicator
          if (payload.new?.is_admin) {
            setAdminTyping(false);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
          filter: `id=eq.${currentRoom.id}`
        },
        () => {
          // Reload room data when status changes
          loadMessages();
        }
      )
      .subscribe();

    setIsConnected(true);
    return channel;
  };

  const sendMessage = async (message: string) => {
    if (!currentRoom || !message.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Send message to database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: currentRoom.id,
          sender_id: user.id,
          sender_name: 'Kullanıcı',
          message: message.trim(),
          message_type: 'text',
          is_admin: false
        });

      if (error) throw error;

      // Update room's last message
      await supabase
        .from('chat_rooms')
        .update({ 
          last_message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentRoom.id);

      // Stop typing indicator
      stopTyping();

      // Reload messages
      loadMessages();

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
      loadMessages();
    } catch (error) {
      console.error('Error sending system message:', error);
    }
  };

  const startTyping = () => {
    if (!currentRoom) return;

    setIsTyping(true);
    
    // Mock typing broadcast
    console.log('User started typing in room:', currentRoom.id);

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
    console.log('User stopped typing in room:', currentRoom.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentRoom) return;
    // Mock implementation until database is ready
    console.log('Messages marked as read');
  };

  const closeChat = async () => {
    if (!currentRoom) return;

    try {
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
      // Mock implementation for now
      console.log('Admins notified about new support request:', subject);
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  };

  const clearMessages = async () => {
    if (!currentRoom) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_room_id', currentRoom.id);
      
      if (error) throw error;
      
      setMessages([]);
      await sendSystemMessage('Mesajlar temizlendi.');
    } catch (error) {
      console.error('Error clearing messages:', error);
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
    leaveRoom,
    clearMessages,
    setupRealtimeSubscription
  };
};