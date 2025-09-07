import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { MessageCircle, Send, Phone, Clock, Users, Star, Headphones, FileText } from 'lucide-react';

const LiveSupport = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      name: 'Ahmet',
      message: 'Merhaba! GuduBet canlı desteğe hoş geldiniz. Size nasıl yardımcı olabilirim?',
      time: '14:32',
      avatar: '👨‍💼'
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'user',
        name: 'Siz',
        message: message,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate support response
      setTimeout(() => {
        const supportResponse = {
          id: messages.length + 2,
          sender: 'support',
          name: 'Ahmet',
          message: 'Mesajınızı aldım, hemen yardımcı oluyorum...',
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          avatar: '👨‍💼'
        };
        setMessages(prev => [...prev, supportResponse]);
      }, 1000);
    }
  };

  const quickActions = [
    { title: 'Para Yatırma Sorunu', description: 'Ödeme ile ilgili sorunlar' },
    { title: 'Para Çekme İşlemi', description: 'Çekim talepları ve süreçler' },
    { title: 'Bonus Sorgulaması', description: 'Bonus kullanımı ve şartları' },
    { title: 'Hesap Doğrulaması', description: 'Kimlik onayı ve güvenlik' },
    { title: 'Teknik Sorun', description: 'Site ve uygulama sorunları' },
    { title: 'Bahis İptali', description: 'Bahis iptali ve iade işlemleri' }
  ];

  const supportStats = [
    { icon: Clock, title: 'Ortalama Yanıt', value: '30 saniye', color: 'text-green-500' },
    { icon: Users, title: 'Aktif Destek', value: '24/7', color: 'text-blue-500' },
    { icon: Star, title: 'Memnuniyet', value: '%98', color: 'text-yellow-500' },
    { icon: MessageCircle, title: 'Günlük Destek', value: '5000+', color: 'text-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="bg-gradient-to-br from-background to-background/50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              Canlı Destek
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GuduBet destek ekibi 7/24 sizin için burada. Anında yardım alın, sorularınızı çözün.
            </p>
          </div>

          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {supportStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center border-primary/20 shadow-lg">
                  <CardHeader className="pb-2">
                    <IconComponent className={`h-8 w-8 mx-auto ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="border-primary/20 shadow-xl h-[600px] flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                      <CardTitle className="flex items-center gap-2">
                        <Headphones className="h-5 w-5" />
                        Canlı Destek Sohbeti
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      Çevrimiçi
                    </Badge>
                  </div>
                  <CardDescription>
                    Destek ekibimiz ile anlık olarak iletişime geçin
                  </CardDescription>
                </CardHeader>
                
                {/* Chat Messages */}
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {msg.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex flex-col max-w-xs ${msg.sender === 'user' ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{msg.name}</span>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <div className={`rounded-lg p-3 text-sm ${
                              msg.sender === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Mesajınızı yazın..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Help Topics */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Hızlı Yardım Konuları
                  </CardTitle>
                  <CardDescription>
                    Yaygın sorunlar için hızlı çözümler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3 border-primary/20"
                        onClick={() => setMessage(action.title)}
                      >
                        <div>
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Options */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Diğer İletişim Yolları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Destek Talebi Oluştur
                  </Button>
                  
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>E-posta:</span>
                      <span className="text-primary">support@gudubet.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telegram:</span>
                      <span className="text-primary">@gudubet_official</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yanıt Süresi:</span>
                      <span className="text-green-500">30 saniye</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Hours */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Destek Saatleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Canlı Destek:</span>
                      <span className="text-green-500 font-semibold">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>E-posta Desteği:</span>
                      <span className="text-green-500 font-semibold">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telegram:</span>
                      <span className="text-green-500 font-semibold">24/7</span>
                    </div>
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                      <p className="text-xs text-center">
                        Tüm iletişim kanallarımız 7 gün 24 saat aktiftir
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sık Sorulan Sorular</CardTitle>
                <CardDescription className="text-center">
                  Hızlı çözüm için önce bu sorulara göz atın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Para yatırma işlemi ne kadar sürer?</h3>
                      <p className="text-sm text-muted-foreground">Kredi kartı ve EFT ödemeleri anında hesabınıza yansır.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Bonus nasıl kullanılır?</h3>
                      <p className="text-sm text-muted-foreground">Bonuslar otomatik olarak hesabınıza yüklenir ve çevirme şartları vardır.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Para çekme süresi nedir?</h3>
                      <p className="text-sm text-muted-foreground">Çekim talepleri 24 saat içinde işleme alınır.</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Hesap doğrulaması nasıl yapılır?</h3>
                      <p className="text-sm text-muted-foreground">Kimlik belgesi ve adres belgesi yüklemeniz yeterlidir.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LiveSupport;