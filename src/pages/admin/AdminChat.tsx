import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

interface ChatRoom {
  id: string;
  user_id: string;
  admin_id?: string;
  subject: string;
  status: 'waiting' | 'active' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  last_message?: string;
  unread_count: number;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message: string;
  message_type: 'text' | 'image' | 'system';
  is_admin: boolean;
  created_at: string;
}

const AdminChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Load chat rooms
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('chat_rooms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (searchTerm) {
        query = query.ilike('subject', `%${searchTerm}%`);
      }

      const { data: roomsData, error } = await query;

      if (error) throw error;
      
      // Get profile information separately for each room
      const roomsWithProfiles = await Promise.all(
        (roomsData || []).map(async (room) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', room.user_id)  // Use id instead of user_id for profiles table
              .single();
            
            return {
              ...room,
              status: room.status as 'waiting' | 'active' | 'closed',
              priority: room.priority as 'low' | 'medium' | 'high',
              profiles: profile
            };
          } catch (profileError) {
            console.warn('Could not load profile for user:', room.user_id);
            return {
              ...room,
              status: room.status as 'waiting' | 'active' | 'closed',
              priority: room.priority as 'low' | 'medium' | 'high',
              profiles: null
            };
          }
        })
      );

      setChatRooms(roomsWithProfiles);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast({
        title: "Hata",
        description: "Chat odaları yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected room
  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as 'text' | 'image' | 'system'
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Hata",
        description: "Mesajlar yüklenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedRoom || !newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: selectedRoom.id,
          sender_id: user.id,
          sender_name: 'Admin',
          message: newMessage.trim(),
          message_type: 'text',
          is_admin: true
        });

      if (error) throw error;

      // Update room status to active and mark as having admin response
      await supabase
        .from('chat_rooms')
        .update({ 
          status: 'active',
          admin_id: user.id,
          last_message: newMessage.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRoom.id);

      setNewMessage('');
      loadMessages(selectedRoom.id);
      loadChatRooms();

      toast({
        title: "Başarılı",
        description: "Mesaj gönderildi.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  // Close chat room
  const closeChatRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ status: 'closed' })
        .eq('id', roomId);

      if (error) throw error;

      // Send system message
      await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: roomId,
          sender_id: '00000000-0000-0000-0000-000000000000',
          sender_name: 'Sistem',
          message: 'Chat admin tarafından kapatıldı.',
          message_type: 'system',
          is_admin: false
        });

      loadChatRooms();
      if (selectedRoom?.id === roomId) {
        loadMessages(roomId);
      }

      toast({
        title: "Başarılı",
        description: "Chat kapatıldı.",
      });
    } catch (error) {
      console.error('Error closing chat:', error);
      toast({
        title: "Hata",
        description: "Chat kapatılırken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Select room
  const selectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
    loadMessages(room.id);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'destructive';
      case 'active': return 'default';
      case 'closed': return 'secondary';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel('admin_chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          loadChatRooms();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (selectedRoom && payload.new?.chat_room_id === selectedRoom.id) {
            loadMessages(selectedRoom.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  // Load data on mount
  useEffect(() => {
    loadChatRooms();
  }, [statusFilter, priorityFilter, searchTerm]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Canlı Chat Yönetimi</h1>
          <p className="text-muted-foreground">
            Kullanıcı destek taleplerini yönetin ve yanıtlayın
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
        {/* Chat Rooms List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat Odaları ({chatRooms.length})
              </CardTitle>
              
              {/* Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Konu ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="waiting">Bekleyen</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="closed">Kapalı</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Öncelikler</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                    </div>
                  ) : chatRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Henüz chat talebi yok</p>
                    </div>
                  ) : (
                    chatRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-colors
                          ${selectedRoom?.id === room.id 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-muted border-border'
                          }
                        `}
                        onClick={() => selectRoom(room)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {room.subject}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {room.profiles?.first_name} {room.profiles?.last_name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge 
                              variant={getStatusColor(room.status)}
                              className="text-xs"
                            >
                              {getStatusIcon(room.status)}
                              <span className="ml-1 capitalize">{room.status}</span>
                            </Badge>
                            <Badge 
                              variant={getPriorityColor(room.priority)}
                              className="text-xs"
                            >
                              {room.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        {room.last_message && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {room.last_message}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(room.updated_at)}
                          </span>
                          {room.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedRoom.subject}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.profiles?.first_name} {selectedRoom.profiles?.last_name} • {formatTime(selectedRoom.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(selectedRoom.status)}>
                      {getStatusIcon(selectedRoom.status)}
                      <span className="ml-1 capitalize">{selectedRoom.status}</span>
                    </Badge>
                    
                    {selectedRoom.status !== 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeChatRoom(selectedRoom.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Kapat
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[70%] rounded-lg p-3 ${
                              message.message_type === 'system'
                                ? 'bg-muted text-center text-sm text-muted-foreground mx-auto'
                                : message.is_admin
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                            }
                          `}
                        >
                          {message.message_type !== 'system' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={message.sender_avatar} />
                                <AvatarFallback className="text-xs">
                                  {message.sender_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-medium">
                                {message.sender_name}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          )}
                          
                          <p className="text-sm whitespace-pre-wrap">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedRoom.status !== 'closed' && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Mesajınızı yazın..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows={2}
                        className="flex-1 resize-none"
                        disabled={sendingMessage}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4"
                      >
                        {sendingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Chat Seçin</h3>
                <p className="text-muted-foreground">
                  Mesajlaşmaya başlamak için sol taraftan bir chat odası seçin
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;