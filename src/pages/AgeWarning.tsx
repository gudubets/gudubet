import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, UserCheck, Lock, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const AgeWarning = () => {
  return (
    <>
      <SEO 
        pageSlug="age-warning"
        customTitle="18+ Yaş Uyarısı | GuduBet"
        customDescription="GuduBet 18 yaş altı kullanıcılar için uygun değildir. Yaş doğrulama ve sorumlu oyun hakkında önemli bilgiler."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-red-500 rounded-full p-3">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">18+ Yaş Uyarısı</h1>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 max-w-2xl mx-auto">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Bu site yalnızca 18 yaş ve üzeri kişiler içindir!
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                Reşit olmayan kişilerin siteye erişimi yasaktır.
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Ana Uyarı */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950">
                <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <UserCheck className="h-6 w-6" />
                  Yaş Sınırlaması ve Doğrulama
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">18+</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Reşitlik Zorunluluğu</h3>
                  <p className="text-muted-foreground">
                    GuduBet platformunu kullanabilmek için 18 yaşını tamamlamış olmanız gerekmektedir. 
                    Bu yasal bir zorunluluktur ve istisna kabul edilmez.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Yaş Doğrulama Süreci */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Yaş Doğrulama Süreci
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Hesap oluştururken yaşınızı doğrulamanız gerekir:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">Kimlik Doğrulama</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Geçerli bir kimlik belgesi (TC kimlik, pasaport) ile yaşınızı kanıtlamanız gerekir.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">Güvenli İşlem</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tüm yaş doğrulama işlemleri güvenli ve gizli bir şekilde yapılır.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yasal Uyarılar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Önemli Yasal Uyarılar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Yasal Sorumluluk</h4>
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li>• 18 yaş altı kişilerin siteye erişimi kesinlikle yasaktır</li>
                    <li>• Sahte kimlik bilgileri kullanmak suçtur</li>
                    <li>• Yaş hilesi yapan hesaplar kalıcı olarak kapatılır</li>
                    <li>• Veliler çocuklarının internet erişimini kontrol etmelidir</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Cezai Sorumluluk</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    18 yaş altı kişilerin kumar oynaması yasa dışıdır. Bu durumda hem kullanıcı hem de 
                    veliler yasal sorumluluk altına girebilir.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ebeveyn Kontrolü */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Ebeveyn Kontrolü ve Koruma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ebeveynler çocuklarını korumak için aşağıdaki önlemleri alabilir:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">İnternet Filtreleri</h4>
                    <p className="text-sm text-muted-foreground">
                      Çocuğunuzun cihazına kumar sitelerini engelleyen filtreler kurun.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Düzenli Kontrol</h4>
                    <p className="text-sm text-muted-foreground">
                      Çocuğunuzun internet aktivitelerini düzenli olarak kontrol edin.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Finansal Kontrol</h4>
                    <p className="text-sm text-muted-foreground">
                      Banka kartı ve kredi kartı kullanımını kontrol altında tutun.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Bilinçlendirme</h4>
                    <p className="text-sm text-muted-foreground">
                      Çocuğunuzu kumar riskler konusunda bilinçlendirin.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sorumlu Oyun */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  Sorumlu Oyun Taahhüdü
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GuduBet olarak sorumlu oyun politikalarını destekliyoruz:
                </p>
                
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    Yaş doğrulama sistemleri
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    Oyun süresi sınırlamaları
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    Bahis limiti belirleme
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    Kendini dışlama seçenekleri
                  </li>
                </ul>
                
                <div className="pt-4">
                  <Link to="/responsible-gaming">
                    <Button className="w-full md:w-auto">
                      Sorumlu Oyun Sayfasını Ziyaret Edin
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Yardım ve Destek */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Yardım ve Destek
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Kumar bağımlılığı ile ilgili yardım için:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Kumar Bağımlıları Derneği</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Telefon:</strong> 0212 292 00 00<br />
                      <strong>Web:</strong> www.kumarbagimlilaridernegi.org
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">AMATEM</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Telefon:</strong> 183<br />
                      <strong>24/7 Destek Hattı</strong>
                    </p>
                  </div>
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

export default AgeWarning;