import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Search, MessageCircle, Phone, Mail, Clock, Users, Shield, CreditCard, Gift, Gamepad2, HelpCircle } from 'lucide-react';

const HelpCenter = () => {
  const categories = [
    {
      icon: Users,
      title: "Hesap Yönetimi",
      description: "Hesap açma, profil düzenleme ve güvenlik",
      color: "bg-blue-500"
    },
    {
      icon: CreditCard,
      title: "Para Yatırma & Çekme",
      description: "Ödeme yöntemleri ve işlem süreçleri",
      color: "bg-green-500"
    },
    {
      icon: Gift,
      title: "Bonuslar & Promosyonlar",
      description: "Bonus kuralları ve promosyon bilgileri",
      color: "bg-purple-500"
    },
    {
      icon: Gamepad2,
      title: "Oyunlar & Bahis",
      description: "Oyun kuralları ve bahis rehberi",
      color: "bg-orange-500"
    },
    {
      icon: Shield,
      title: "Güvenlik & Gizlilik",
      description: "Hesap güvenliği ve gizlilik politikası",
      color: "bg-red-500"
    },
    {
      icon: HelpCircle,
      title: "Teknik Destek",
      description: "Teknik sorunlar ve çözüm önerileri",
      color: "bg-indigo-500"
    }
  ];

  const faqItems = [
    {
      category: "Genel",
      question: "GuduBet hesabı nasıl açılır?",
      answer: "Ana sayfadaki 'ÜYE OL' butonuna tıklayarak kişisel bilgilerinizi doldurun. E-posta doğrulaması sonrası hesabınız aktif hale gelecektir."
    },
    {
      category: "Ödeme",
      question: "Para yatırma işlemi ne kadar sürer?",
      answer: "Kredi kartı ve EFT ile yapılan ödemeler anında hesabınıza yansır. Banka havalesi işlemleri 1-3 iş günü sürebilir."
    },
    {
      category: "Ödeme",
      question: "Para çekme limitleri nelerdir?",
      answer: "Günlük minimum 50 TL, maksimum 50.000 TL çekim yapabilirsiniz. VIP üyeler için limitler daha yüksektir."
    },
    {
      category: "Bonus",
      question: "Hoş geldin bonusu nasıl alınır?",
      answer: "İlk para yatırma işleminizde otomatik olarak %100 bonus hesabınıza yüklenir. Bonus çevirme şartları 35x'dir."
    },
    {
      category: "Bonus",
      question: "Bonus çevirme şartları nedir?",
      answer: "Bonus tutarını 35 kez casino oyunlarında çevirmeniz gerekmektedir. Spor bahislerinde çevirme oranı farklıdır."
    },
    {
      category: "Teknik",
      question: "Mobil uygulamayı nereden indirebilirim?",
      answer: "Android için APK dosyasını web sitemizden, iOS için App Store'dan indirebilirsiniz."
    },
    {
      category: "Güvenlik",
      question: "Hesabım güvenli mi?",
      answer: "SSL şifreleme ve 2FA ile hesabınız korunmaktadır. Kişisel bilgileriniz asla üçüncü kişilerle paylaşılmaz."
    },
    {
      category: "Genel",
      question: "Canlı destek saatleri nedir?",
      answer: "7/24 canlı destek hizmeti sunuyoruz. Ortalama yanıt süresi 30 saniyedir."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="bg-gradient-to-br from-background to-background/50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              GuduBet Yardım Merkezi
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Size yardımcı olmak için buradayız. Aradığınız cevabı bulamıyor musunuz? Destek ekibimizle iletişime geçin.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Sorunuzu buraya yazın..." 
                className="pl-10 py-3 text-lg border-primary/20"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Canlı Destek</CardTitle>
                <CardDescription>Anında yardım alın</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                  Sohbeti Başlat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>E-posta Desteği</CardTitle>
                <CardDescription>Detaylı sorularınız için</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full border-primary/20">
                  E-posta Gönder
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Telegram Kanalı</CardTitle>
                <CardDescription>Güncel duyurular</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full border-primary/20">
                  Kanala Katıl
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Yardım Kategorileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Card key={index} className="border-primary/20 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`${category.color} p-3 rounded-full text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription className="text-sm">{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Sık Sorulan Sorular</h2>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-primary/20 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">7/24</p>
                <p className="text-sm text-muted-foreground">Her gün hizmetinizdeyiz</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Ortalama Yanıt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">30 saniye</p>
                <p className="text-sm text-muted-foreground">Canlı destek</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Aktif Kullanıcı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">500K+</p>
                <p className="text-sm text-muted-foreground">Güvenilir platform</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Güvenlik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">SSL</p>
                <p className="text-sm text-muted-foreground">256-bit şifreleme</p>
              </CardContent>
            </Card>
          </div>

          {/* Still Need Help */}
          <div className="text-center">
            <Card className="border-primary/20 shadow-xl max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Hala yardıma mı ihtiyacınız var?</CardTitle>
                <CardDescription>
                  Destek ekibimiz size özel çözüm sunmak için hazır bekliyor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-primary to-primary/80">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Canlı Destek
                  </Button>
                  <Button variant="outline" className="border-primary/20">
                    <Mail className="mr-2 h-4 w-4" />
                    E-posta Gönder
                  </Button>
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

export default HelpCenter;