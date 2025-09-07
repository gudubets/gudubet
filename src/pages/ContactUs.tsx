import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Bize Ulaşın
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            GuduBet ekibi olarak size yardımcı olmaktan mutluluk duyarız. Sorularınız için bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">E-posta</CardTitle>
                    <CardDescription>7/24 destek hattımız</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">support@gudubet.com</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Genellikle 2 saat içinde yanıtlıyoruz
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Canlı Destek</CardTitle>
                    <CardDescription>Anında yardım alın</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Canlı Desteği Başlat
                </Button>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Ortalama yanıt süresi: 30 saniye
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
                    <CardDescription>Destek saatlerimiz</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pazartesi - Pazar</span>
                    <span className="text-primary font-semibold">24/7</span>
                  </div>
                  <p className="text-muted-foreground">
                    Her zaman buradayız!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Mesaj Gönderin</CardTitle>
                <CardDescription>
                  Detaylı sorularınız için formu doldurun, en kısa sürede size dönüş yapalım.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input id="firstName" placeholder="Adınız" className="border-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input id="lastName" placeholder="Soyadınız" className="border-primary/20" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input id="email" type="email" placeholder="email@example.com" className="border-primary/20" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Konu *</Label>
                  <Input id="subject" placeholder="Mesajınızın konusu" className="border-primary/20" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj *</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Mesajınızı buraya yazın..." 
                    rows={6}
                    className="border-primary/20 resize-none"
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-3">
                  Mesajı Gönder
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  * işaretli alanlar zorunludur. Kişisel verileriniz güvende tutulur.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Lisans Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Curaçao eGaming lisansı ile güvenle hizmet veriyoruz. 
                Lisans No: #153142
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Teknik Destek</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Oyun ve teknik sorunlarınız için özel destek ekibimize ulaşın.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Şikayet ve Öneriler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Görüş ve önerileriniz bizim için değerlidir. Lütfen paylaşın.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;