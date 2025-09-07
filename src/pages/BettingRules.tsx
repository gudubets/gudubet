import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Trophy, Users, Clock, Shield, AlertTriangle, CheckCircle, Star, Target } from 'lucide-react';

const BettingRules = () => {
  const ruleCategories = [
    {
      icon: Target,
      title: "Spor Bahisleri",
      description: "Futbol, basketbol ve diğer spor dalları kuralları",
      color: "bg-green-500"
    },
    {
      icon: Trophy,
      title: "Canlı Bahis",
      description: "Maç sırasında bahis kuralları ve limitleri",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Kombine Bahis",
      description: "Çoklu bahis ve sistem kuralları",
      color: "bg-purple-500"
    },
    {
      icon: Clock,
      title: "Zamanla İlgili Kurallar",
      description: "Bahis süresi ve iptal koşulları",
      color: "bg-orange-500"
    },
    {
      icon: Shield,
      title: "Güvenlik Kuralları",
      description: "Hesap güvenliği ve doğrulama",
      color: "bg-red-500"
    },
    {
      icon: Star,
      title: "VIP Kuralları",
      description: "VIP üyeler için özel kurallar",
      color: "bg-indigo-500"
    }
  ];

  const generalRules = [
    {
      title: "Genel Bahis Kuralları",
      rules: [
        "Bahisler sadece 18 yaş ve üzeri kişiler tarafından yapılabilir.",
        "Her kullanıcı yalnızca bir hesap açabilir.",
        "Bahis kuponları, maç başlamadan önce onaylanmalıdır.",
        "Minimum bahis tutarı 5 TL, maksimum tutar oyun türüne göre değişir.",
        "Yanlış oran veya teknik hatalardan doğan bahisler iptal edilebilir.",
        "Şüpheli bahis aktiviteleri tespit edilirse hesap geçici olarak dondurulabilir."
      ]
    },
    {
      title: "Spor Bahisleri Kuralları",
      rules: [
        "Maç ertelenirse veya iptal edilirse, bahisler iade edilir.",
        "Uzatma süreleri, aksi belirtilmedikçe bahislere dahildir.",
        "Penalty atışları sadece belirtilen bahislerde geçerlidir.",
        "Hava koşulları nedeniyle ertelenen maçlar için özel kurallar uygulanır.",
        "Canlı bahislerde oranlar sürekli güncellenir.",
        "Maç sonucu resmi açıklandıktan sonra bahisler kapatılır."
      ]
    },
    {
      title: "Canlı Bahis Kuralları",
      rules: [
        "Canlı bahisler maç sırasında anlık olarak açılır ve kapanır.",
        "Ağ gecikmeleri nedeniyle kabul edilmeyen bahisler iade edilir.",
        "Maçta yaşanan teknik aksaklıklar durumunda bahisler askıya alınabilir.",
        "VAR kontrolü sırasında ilgili bahisler geçici olarak durdurulur.",
        "Oyuncu değişiklikleri bazı bahis türlerini etkileyebilir.",
        "Hakem kararları kesindir ve bahis sonuçlarını etkiler."
      ]
    }
  ];

  const paymentRules = [
    {
      category: "Ödeme Kuralları",
      items: [
        "Kazanılan bahisler otomatik olarak hesaba aktarılır",
        "Çekim işlemleri 24 saat içinde işleme alınır",
        "Para yatırma bonusları çevirme şartlarına tabidir",
        "Minimum çekim tutarı 50 TL'dir"
      ]
    },
    {
      category: "Bonus Kuralları",
      items: [
        "Hoş geldin bonusu sadece ilk üyelikte geçerlidir",
        "Bonus çevirme şartı 35x'dir",
        "Kombine bahislerde minimum 3 seçim olmalıdır",
        "Bonus kullanımı 30 gün ile sınırlıdır"
      ]
    },
    {
      category: "Hesap Güvenliği",
      items: [
        "Kimlik doğrulaması zorunludur",
        "Şüpheli aktivite durumunda hesap askıya alınabilir",
        "Çoklu hesap tespit edilirse tüm hesaplar kapatılır",
        "Kişisel bilgiler üçüncü kişilerle paylaşılamaz"
      ]
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
              Bahis Kuralları
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              GuduBet platformunda güvenli ve adil bahis deneyimi için tüm kurallar ve koşullar burada açıklanmıştır.
            </p>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8 border-orange-500/50 bg-orange-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Önemli Uyarı</AlertTitle>
            <AlertDescription>
              Bu kurallar değişiklik gösterebilir. Güncel kurallar için lütfen bu sayfayı düzenli olarak kontrol edin.
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </AlertDescription>
          </Alert>

          {/* Rule Categories */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Kural Kategorileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ruleCategories.map((category, index) => {
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

          {/* General Rules */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Temel Kurallar</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {generalRules.map((section, index) => (
                <Card key={index} className="border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.rules.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Detailed Rules Accordion */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Detaylı Kurallar</h2>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {paymentRules.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`} className="border border-primary/20 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {section.category}
                        </Badge>
                        <span className="font-semibold">{section.category} Detayları</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Betting Limits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Bahis Limitleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Minimum Bahis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">₺5</p>
                  <p className="text-sm text-muted-foreground">Tek bahis</p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Maksimum Bahis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">₺50.000</p>
                  <p className="text-sm text-muted-foreground">Oyuna göre değişir</p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Maksimum Kazanç</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">₺500.000</p>
                  <p className="text-sm text-muted-foreground">Günlük limit</p>
                </CardContent>
              </Card>

              <Card className="text-center border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Kombine Limit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">25</p>
                  <p className="text-sm text-muted-foreground">Maksimum seçim</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sport-Specific Rules */}
          <div className="mb-12">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Spor Dallarına Özel Kurallar</CardTitle>
                <CardDescription className="text-center">
                  Her spor dalı için geçerli özel kurallar ve koşullar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      ⚽ Futbol Kuralları
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 90 dakika + uzatma süreleri geçerlidir</li>
                      <li>• Penalty atışları ayrı bahis türüdür</li>
                      <li>• Maç ertelenirse bahisler iade edilir</li>
                      <li>• VAR kararları kesin sonuç kabul edilir</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      🏀 Basketbol Kuralları
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Uzatmalar bahislere dahildir</li>
                      <li>• Periyot bahisleri sadece o periyodu kapsar</li>
                      <li>• Maç iptal edilirse bahisler iade edilir</li>
                      <li>• Canlı bahislerde süre durması geçerlidir</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact for Rules */}
          <div className="text-center">
            <Card className="border-primary/20 shadow-xl max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Kural ile İlgili Sorunuz mu Var?</CardTitle>
                <CardDescription>
                  Bahis kuralları hakkında detaylı bilgi almak için destek ekibimizle iletişime geçin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Badge 
                    variant="outline" 
                    className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => window.location.href = '/live-support'}
                  >
                    📞 7/24 Canlı Destek
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    ✉️ support@gudubet.com
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2">
                    💬 Telegram Kanalı
                  </Badge>
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

export default BettingRules;