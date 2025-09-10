import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Separator } from '@/components/ui/separator';
import { Cookie, Settings, Shield, Eye, CheckCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const CookiePolicy = () => {
  return (
    <>
      <SEO 
        pageSlug="cookie-policy"
        customTitle="Çerez Politikası | GuduBet"
        customDescription="GuduBet çerez politikası. Web sitemizde kullandığımız çerezler ve veri işleme politikalarımız hakkında detaylı bilgi."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cookie className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Çerez Politikası</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Web sitemizde kullandığımız çerezler ve veri işleme politikalarımız hakkında detaylı bilgiler.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Son güncelleme: 10 Eylül 2025
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Çerez Nedir */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-primary" />
                  Çerez Nedir?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Çerezler, web sitelerini ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. 
                  Bu dosyalar, web sitesinin daha iyi çalışmasını sağlar ve size daha iyi bir deneyim sunar.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    Oturum çerezleri: Tarayıcı kapatıldığında silinir
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    Kalıcı çerezler: Belirli bir süre boyunca cihazınızda kalır
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    Üçüncü taraf çerezleri: Diğer web sitelerinden gelen çerezler
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Kullandığımız Çerez Türleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Kullandığımız Çerez Türleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Zorunlu Çerezler */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1. Zorunlu Çerezler</h3>
                  <p className="text-muted-foreground mb-2">
                    Web sitesinin temel işlevlerini yerine getirmesi için gerekli çerezlerdir.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Oturum yönetimi ve güvenlik</li>
                    <li>• Dil tercihleri</li>
                    <li>• Çerez onay durumu</li>
                    <li>• Temel site işlevselliği</li>
                  </ul>
                </div>

                <Separator />

                {/* Performans Çerezleri */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2. Performans Çerezleri</h3>
                  <p className="text-muted-foreground mb-2">
                    Web sitesinin performansını analiz etmek ve iyileştirmek için kullanılır.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Sayfa görüntüleme istatistikleri</li>
                    <li>• Site hızı analizi</li>
                    <li>• Hata raporları</li>
                    <li>• Kullanıcı davranışı analizi</li>
                  </ul>
                </div>

                <Separator />

                {/* İşlevsellik Çerezleri */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">3. İşlevsellik Çerezleri</h3>
                  <p className="text-muted-foreground mb-2">
                    Kişiselleştirilmiş deneyim sunmak için kullanılan çerezlerdir.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Favori oyunlar</li>
                    <li>• Tema tercihleri</li>
                    <li>• Özelleştirilmiş içerik</li>
                    <li>• Sosyal medya entegrasyonu</li>
                  </ul>
                </div>

                <Separator />

                {/* Reklam Çerezleri */}
                <div>
                  <h3 className="font-semibold text-foreground mb-2">4. Reklam/Pazarlama Çerezleri</h3>
                  <p className="text-muted-foreground mb-2">
                    Size özel reklamlar sunmak ve pazarlama faaliyetlerini yürütmek için kullanılır.
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    <li>• Hedefli reklamlar</li>
                    <li>• Reklam performansı ölçümü</li>
                    <li>• Yeniden pazarlama</li>
                    <li>• Sosyal medya takibi</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Çerez Yönetimi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Çerez Yönetimi ve Kontrolü
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Tarayıcı Ayarları</h4>
                    <p className="text-sm text-muted-foreground">
                      Tarayıcınızın ayarlar menüsünden çerezleri yönetebilir, silebilir veya engelleyebilirsiniz.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Çerez Tercihleri</h4>
                    <p className="text-sm text-muted-foreground">
                      Sitemizin altındaki çerez ayarları linkinden tercihlerinizi güncelleyebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Önemli:</strong> Zorunlu çerezleri devre dışı bırakmanız durumunda, 
                    web sitesinin bazı özellikleri düzgün çalışmayabilir.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Üçüncü Taraf Çerezleri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Üçüncü Taraf Çerezleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Bazı durumlarda, güvenilir üçüncü taraf hizmet sağlayıcılarının çerezlerini de kullanırız:
                </p>
                
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Google Analytics: Web sitesi analitiği için
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Oyun sağlayıcıları: Casino oyunları için
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Ödeme işlemcileri: Güvenli ödeme işlemleri için
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Müşteri destek araçları: Canlı destek için
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* İletişim */}
            <Card>
              <CardHeader>
                <CardTitle>İletişim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Çerez politikamız hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>E-posta:</strong> support@gudubet.com</p>
                  <p><strong>Adres:</strong> Curaçao</p>
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