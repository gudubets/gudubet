import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Separator } from '@/components/ui/separator';
import { Cookie, Settings, Shield, Eye, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';
import { useI18n } from '@/hooks/useI18n';

const CookiePolicy = () => {
  const { currentLanguage } = useI18n();

  return (
    <>
      <SEO 
        pageSlug="cookie-policy"
        customTitle={currentLanguage === 'tr' ? "Çerez Politikası | GuduBet" : "Cookie Policy | GuduBet"}
        customDescription={currentLanguage === 'tr' 
          ? "GuduBet çerez politikası. Web sitemizde kullandığımız çerezler ve veri işleme politikalarımız hakkında detaylı bilgi."
          : "GuduBet cookie policy. Detailed information about cookies we use on our website and our data processing policies."
        }
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cookie className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {currentLanguage === 'tr' ? 'Çerez Politikası' : 'Cookie Policy'}
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {currentLanguage === 'tr'
                ? 'Web sitemizde kullandığımız çerezler ve veri işleme politikalarımız hakkında detaylı bilgiler.'
                : 'Detailed information about cookies we use on our website and our data processing policies.'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {currentLanguage === 'tr' ? 'Son güncelleme: 10 Eylül 2025' : 'Last updated: September 10, 2025'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* What are Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Çerez Nedir?' : 'What are Cookies?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, web sitesinin daha iyi çalışmasını sağlar ve size daha iyi bir deneyim sunar.'
                    : 'Cookies are small text files stored in your browser when you visit websites. These files help the website work better and provide you with a better experience.'
                  }
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' 
                      ? 'Oturum çerezleri: Tarayıcı kapatıldığında silinir'
                      : 'Session cookies: Deleted when browser is closed'
                    }
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Kalıcı çerezler: Belirli bir süre boyunca cihazınızda kalır'
                      : 'Persistent cookies: Remain on your device for a specific period'
                    }
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Üçüncü taraf çerezleri: Diğer web sitelerinden gelen çerezler'
                      : 'Third-party cookies: Cookies from other websites'
                    }
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Types of Cookies We Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Kullandığımız Çerez Türleri' : 'Types of Cookies We Use'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Essential Cookies */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {currentLanguage === 'tr' ? '1. Zorunlu Çerezler' : '1. Essential Cookies'}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {currentLanguage === 'tr'
                      ? 'Web sitesinin temel işlevlerini yerine getirmesi için gerekli çerezlerdir.'
                      : 'Cookies necessary for the basic functions of the website.'
                    }
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• {currentLanguage === 'tr' ? 'Oturum yönetimi ve güvenlik' : 'Session management and security'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Dil tercihleri' : 'Language preferences'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Çerez onay durumu' : 'Cookie consent status'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Temel site işlevselliği' : 'Basic site functionality'}</li>
                  </ul>
                </div>

                <Separator />

                {/* Performance Cookies */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {currentLanguage === 'tr' ? '2. Performans Çerezleri' : '2. Performance Cookies'}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {currentLanguage === 'tr'
                      ? 'Web sitesinin performansını analiz etmek ve iyileştirmek için kullanılır.'
                      : 'Used to analyze and improve website performance.'
                    }
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• {currentLanguage === 'tr' ? 'Sayfa görüntüleme istatistikleri' : 'Page view statistics'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Site hızı analizi' : 'Site speed analysis'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Hata raporları' : 'Error reports'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Kullanıcı davranışı analizi' : 'User behavior analysis'}</li>
                  </ul>
                </div>

                <Separator />

                {/* Functionality Cookies */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {currentLanguage === 'tr' ? '3. İşlevsellik Çerezleri' : '3. Functionality Cookies'}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {currentLanguage === 'tr'
                      ? 'Kişiselleştirilmiş deneyim sunmak için kullanılan çerezlerdir.'
                      : 'Cookies used to provide personalized experience.'
                    }
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• {currentLanguage === 'tr' ? 'Favori oyunlar' : 'Favorite games'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Tema tercihleri' : 'Theme preferences'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Özelleştirilmiş içerik' : 'Customized content'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Sosyal medya entegrasyonu' : 'Social media integration'}</li>
                  </ul>
                </div>

                <Separator />

                {/* Advertising Cookies */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {currentLanguage === 'tr' ? '4. Reklam/Pazarlama Çerezleri' : '4. Advertising/Marketing Cookies'}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {currentLanguage === 'tr'
                      ? 'Size özel reklamlar sunmak ve pazarlama faaliyetlerini yürütmek için kullanılır.'
                      : 'Used to provide targeted ads and conduct marketing activities.'
                    }
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• {currentLanguage === 'tr' ? 'Hedefli reklamlar' : 'Targeted advertising'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Reklam performansı ölçümü' : 'Ad performance measurement'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Yeniden pazarlama' : 'Remarketing'}</li>
                    <li>• {currentLanguage === 'tr' ? 'Sosyal medya takibi' : 'Social media tracking'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Çerez Yönetimi ve Kontrolü' : 'Cookie Management and Control'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz:'
                    : 'You can change your cookie preferences at any time:'
                  }
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'Tarayıcı Ayarları' : 'Browser Settings'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Tarayıcınızın ayarlar menüsünden çerezleri yönetebilir, silebilir veya engelleyebilirsiniz.'
                        : 'You can manage, delete or block cookies from your browser settings menu.'
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'Çerez Tercihleri' : 'Cookie Preferences'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Sitemizin altındaki çerez ayarları linkinden tercihlerinizi güncelleyebilirsiniz.'
                        : 'You can update your preferences from the cookie settings link at the bottom of our site.'
                      }
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>{currentLanguage === 'tr' ? 'Önemli:' : 'Important:'}</strong> {' '}
                    {currentLanguage === 'tr'
                      ? 'Zorunlu çerezleri devre dışı bırakmanız durumunda, web sitesinin bazı özellikleri düzgün çalışmayabilir.'
                      : 'If you disable essential cookies, some features of the website may not work properly.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Third Party Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Üçüncü Taraf Çerezleri' : 'Third Party Cookies'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Bazı durumlarda, güvenilir üçüncü taraf hizmet sağlayıcılarının çerezlerini de kullanırız:'
                    : 'In some cases, we also use cookies from trusted third-party service providers:'
                  }
                </p>
                
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Google Analytics: Web sitesi analitiği için' : 'Google Analytics: For website analytics'}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Oyun sağlayıcıları: Casino oyunları için' : 'Game providers: For casino games'}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Ödeme işlemcileri: Güvenli ödeme işlemleri için' : 'Payment processors: For secure payment transactions'}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' 
                      ? 'Müşteri destek araçları: Canlı destek için'
                      : 'Customer support tools: For live support'
                    }
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'tr' ? 'İletişim' : 'Contact'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {currentLanguage === 'tr'
                    ? 'Çerez politikamız hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:'
                    : 'If you have questions about our cookie policy, you can contact us:'
                  }
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>{currentLanguage === 'tr' ? 'E-posta:' : 'Email:'}</strong> support@gudubet.com</p>
                  <p><strong>{currentLanguage === 'tr' ? 'Adres:' : 'Address:'}</strong> Curaçao</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CookiePolicy;