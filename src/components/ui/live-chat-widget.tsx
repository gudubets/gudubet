import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, X, Circle, Users, Phone, Mail } from 'lucide-react';
import { useLiveChat } from '@/hooks/useLiveChat';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentRoom,
    messages,
    isConnected,
    isTyping,
    adminTyping,
    onlineAdmins,
    messagesEndRef,
    createChatRoom,
    sendMessage,
    startTyping,
    stopTyping,
    closeChat,
    leaveRoom
  } = useLiveChat();

  const { t, currentLanguage } = useI18n();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
    stopTyping();
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      startTyping();
    } else if (!value.trim() && isTyping) {
      stopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartChat = async () => {
    if (!subject.trim()) return;

    const room = await createChatRoom(subject, priority);
    if (room) {
      setShowStartForm(false);
      setSubject('');
      setDescription('');
      setPriority('medium');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return currentLanguage === 'tr' ? 'Yüksek' : 'High';
      case 'medium': return currentLanguage === 'tr' ? 'Orta' : 'Medium';
      case 'low': return currentLanguage === 'tr' ? 'Düşük' : 'Low';
      default: return priority;
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {onlineAdmins > 0 && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -left-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {onlineAdmins}
          </Badge>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-80 h-96 z-50 shadow-2xl border-2">
          <CardContent className="p-0 h-full">
            {!currentRoom ? (
              <div className="h-full bg-black text-white rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 text-center border-b border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-6 w-6 p-0 text-white hover:bg-gray-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold">
                      <span className="text-white">gudu</span>
                      <span className="text-yellow-400">bet</span>
                    </h1>
                  </div>
                  
                  <div className="text-sm text-gray-300 leading-relaxed">
                    <p className="mb-1">Gudubet™ | En İyi Casino ve Bahis Sitesi</p>
                    <p>Gudubet, benzersiz ve heyecan verici</p>
                    <p>büyük ve güvenilir bir çevrimiçi kumarhane,</p>
                    <p>spor bahis web sitesidir.</p>
                  </div>
                </div>
                
                {/* Contact Form */}
                <div className="p-4 space-y-3">
                  <Button 
                    onClick={() => setShowStartForm(true)}
                    className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 rounded-lg py-3 text-left pl-4"
                    variant="outline"
                  >
                    <span className="text-gray-400 text-sm">* İsim</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowStartForm(true)}
                    className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 rounded-lg py-3 text-left pl-4"
                    variant="outline"
                  >
                    <span className="text-gray-400 text-sm">* E-posta</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowStartForm(true)}
                    className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 rounded-lg py-3 text-left pl-4"
                    variant="outline"
                  >
                    <span className="text-gray-400 text-sm">* Telefon</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowStartForm(true)}
                    className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-800 rounded-lg py-3 text-left pl-4"
                    variant="outline"
                  >
                    <span className="text-gray-400 text-sm">* Yatırım Miktarı</span>
                  </Button>
                </div>
                
                {onlineAdmins > 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-gray-400">
                      {onlineAdmins} temsilci çevrimiçi
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Circle className={cn("h-2 w-2", isConnected ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400")} />
                        <span className="font-medium text-sm">
                          {currentLanguage === 'tr' ? 'Canlı Destek' : 'Live Support'}
                        </span>
                      </div>
                      {onlineAdmins > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {onlineAdmins}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={closeChat}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        title={currentLanguage === 'tr' ? 'Görüşmeyi Sonlandır' : 'End Chat'}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentRoom.subject}
                      </p>
                      <Badge variant={getPriorityColor(currentRoom.priority) as any} className="text-xs">
                        {getPriorityText(currentRoom.priority)}
                      </Badge>
                    </div>
                    <Badge variant={currentRoom.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {currentRoom.status === 'active' 
                        ? (currentLanguage === 'tr' ? 'Aktif' : 'Active')
                        : currentRoom.status === 'waiting'
                        ? (currentLanguage === 'tr' ? 'Bekliyor' : 'Waiting')
                        : (currentLanguage === 'tr' ? 'Kapalı' : 'Closed')
                      }
                    </Badge>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.message_type === 'system' ? "justify-center" : 
                          message.is_admin ? "justify-start" : "justify-end"
                        )}
                      >
                        {message.message_type === 'system' ? (
                          <div className="bg-muted rounded-lg px-3 py-1 text-xs text-center max-w-[80%]">
                            {message.message}
                          </div>
                        ) : (
                          <div className={cn(
                            "flex items-end space-x-2 max-w-[80%]",
                            message.is_admin ? "flex-row" : "flex-row-reverse space-x-reverse"
                          )}>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={message.sender_avatar} />
                              <AvatarFallback className="text-xs">
                                {message.is_admin ? 'A' : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                              "rounded-lg px-3 py-2 max-w-full",
                              message.is_admin 
                                ? "bg-muted text-foreground" 
                                : "bg-primary text-primary-foreground"
                            )}>
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {adminTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                          <div className="flex space-x-1">
                            <div className="animate-bounce">•</div>
                            <div className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</div>
                            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-2 border-t">
                  <div className="flex space-x-2 w-full">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={currentLanguage === 'tr' ? 'Mesajınızı yazın...' : 'Type your message...'}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Start Chat Form Dialog */}
      <Dialog open={showStartForm} onOpenChange={setShowStartForm}>
        <DialogContent className="sm:max-w-md bg-black text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  <span className="text-white">gudu</span>
                  <span className="text-yellow-400">bet</span>
                </h1>
              </div>
              <div className="text-sm text-gray-300 leading-relaxed">
                <p className="mb-1">Gudubet™ | En İyi Casino ve Bahis Sitesi</p>
                <p>Gudubet, benzersiz ve heyecan verici</p>
                <p>büyük ve güvenilir bir çevrimiçi kumarhane,</p>
                <p>spor bahis web sitesidir.</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="* İsim"
                className="bg-transparent border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <Input
                type="email"
                placeholder="* E-posta"
                className="bg-transparent border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <Input
                type="tel"
                placeholder="* Telefon"
                className="bg-transparent border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <Input
                type="number"
                placeholder="* Yatırım Miktarı"
                className="bg-transparent border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="bg-transparent border-gray-600 text-white">
                  <SelectValue placeholder="Öncelik Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  <SelectItem value="low" className="text-white hover:bg-gray-800">
                    Düşük Öncelik
                  </SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-gray-800">
                    Orta Öncelik
                  </SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-gray-800">
                    Yüksek Öncelik
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sorununuzu detaylı olarak açıklayın (isteğe bağlı)"
                className="bg-transparent border-gray-600 text-white placeholder-gray-400"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleStartChat}
                disabled={!subject.trim()}
                className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
              >
                Görüşme Başlat
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowStartForm(false)}
                className="flex-1 border-gray-600 text-white hover:bg-gray-800"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveChatWidget;