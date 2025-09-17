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
      setIsConnected(true);
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

      // Create mock room until database types are updated
      const roomId = `room_${Date.now()}`;
      const room: ChatRoom = {
        id: roomId,
        user_id: user.id,
        subject,
        priority,
        status: 'waiting',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0
      };
      
      setCurrentRoom(room);
      await sendSystemMessage('Destek talebiniz oluşturuldu. Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.');
      
      toast({
        title: "Destek Talebi Oluşturuldu",
        description: "Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.",
      });

      return room;
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
      // For now, use mock messages until database types are updated
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          chat_room_id: currentRoom.id,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_name: 'Sistem',
          message: 'Destek talebiniz oluşturuldu. Bir temsilcimiz en kısa sürede sizinle iletişime geçecek.',
          message_type: 'system',
          created_at: new Date().toISOString(),
          is_admin: false
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentRoom) return;

    // Mock setup for now
    setIsConnected(true);
    console.log('Real-time subscription would be set up for room:', currentRoom.id);

    return null;
  };

  const sendMessage = async (message: string) => {
    if (!currentRoom || !message.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create new message locally until database is ready
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        chat_room_id: currentRoom.id,
        sender_id: user.id,
        sender_name: 'Kullanıcı',
        message: message.trim(),
        message_type: 'text',
        created_at: new Date().toISOString(),
        is_admin: false
      };

      setMessages(prev => [...prev, newMessage]);

      // Stop typing indicator
      stopTyping();

      // Simulate admin response after 2 seconds
      setTimeout(() => {
        const adminResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chat_room_id: currentRoom.id,
          sender_id: 'admin',
          sender_name: 'Destek Temsilcisi',
          message: 'Mesajınızı aldık. Size yardımcı olmaya çalışıyoruz.',
          message_type: 'text',
          created_at: new Date().toISOString(),
          is_admin: true
        };

        setMessages(prev => [...prev, adminResponse]);
      }, 2000);

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
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        chat_room_id: currentRoom.id,
        sender_id: '00000000-0000-0000-0000-000000000000',
        sender_name: 'Sistem',
        message,
        message_type: 'system',
        created_at: new Date().toISOString(),
        is_admin: false
      };

      setMessages(prev => [...prev, systemMessage]);
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