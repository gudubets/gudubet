import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, UserCheck, Lock, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useI18n } from '@/hooks/useI18n';

const AgeWarning = () => {
  const { currentLanguage } = useI18n();

  return (
    <>
      <SEO 
        pageSlug="age-warning"
        customTitle={currentLanguage === 'tr' ? "18+ Yaş Uyarısı | GuduBet" : "18+ Age Warning | GuduBet"}
        customDescription={currentLanguage === 'tr'
          ? "GuduBet 18 yaş altı kullanıcılar için uygun değildir. Yaş doğrulama ve sorumlu oyun hakkında önemli bilgiler."
          : "GuduBet is not suitable for users under 18. Important information about age verification and responsible gaming."
        }
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
              <h1 className="text-3xl font-bold text-foreground">
                {currentLanguage === 'tr' ? '18+ Yaş Uyarısı' : '18+ Age Warning'}
              </h1>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 p-4 max-w-2xl mx-auto">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                {currentLanguage === 'tr'
                  ? 'Bu site yalnızca 18 yaş ve üzeri kişiler içindir!'
                  : 'This site is only for people 18 years and older!'
                }
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {currentLanguage === 'tr'
                  ? 'Reşit olmayan kişilerin siteye erişimi yasaktır.'
                  : 'Access to the site by minors is prohibited.'
                }
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Warning */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950">
                <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <UserCheck className="h-6 w-6" />
                  {currentLanguage === 'tr' ? 'Yaş Sınırlaması ve Doğrulama' : 'Age Restriction and Verification'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                    <span className="text-3xl font-bold text-red-600 dark:text-red-400">18+</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {currentLanguage === 'tr' ? 'Reşitlik Zorunluluğu' : 'Legal Age Requirement'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentLanguage === 'tr'
                      ? 'GuduBet platformunu kullanabilmek için 18 yaşını tamamlamış olmanız gerekmektedir. Bu yasal bir zorunluluktur ve istisna kabul edilmez.'
                      : 'You must be 18 years old to use the GuduBet platform. This is a legal requirement and no exceptions are accepted.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Age Verification Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Yaş Doğrulama Süreci' : 'Age Verification Process'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Hesap oluştururken yaşınızı doğrulamanız gerekir:'
                    : 'You need to verify your age when creating an account:'
                  }
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <h4 className="font-semibold">
                        {currentLanguage === 'tr' ? 'Kimlik Doğrulama' : 'Identity Verification'}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Geçerli bir kimlik belgesi (TC kimlik, pasaport) ile yaşınızı kanıtlamanız gerekir.'
                        : 'You need to prove your age with a valid ID document (ID card, passport).'
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">
                        {currentLanguage === 'tr' ? 'Güvenli İşlem' : 'Secure Process'}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Tüm yaş doğrulama işlemleri güvenli ve gizli bir şekilde yapılır.'
                        : 'All age verification processes are conducted securely and confidentially.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {currentLanguage === 'tr' ? 'Önemli Yasal Uyarılar' : 'Important Legal Warnings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    {currentLanguage === 'tr' ? 'Yasal Sorumluluk' : 'Legal Responsibility'}
                  </h4>
                  <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                    <li>• {currentLanguage === 'tr' 
                      ? '18 yaş altı kişilerin siteye erişimi kesinlikle yasaktır'
                      : 'Access to the site by persons under 18 is strictly prohibited'
                    }</li>
                    <li>• {currentLanguage === 'tr'
                      ? 'Sahte kimlik bilgileri kullanmak suçtur'
                      : 'Using false identity information is a crime'
                    }</li>
                    <li>• {currentLanguage === 'tr'
                      ? 'Yaş hilesi yapan hesaplar kalıcı olarak kapatılır'
                      : 'Accounts with age fraud are permanently closed'
                    }</li>
                    <li>• {currentLanguage === 'tr'
                      ? 'Veliler çocuklarının internet erişimini kontrol etmelidir'
                      : 'Parents should control their children\'s internet access'
                    }</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    {currentLanguage === 'tr' ? 'Cezai Sorumluluk' : 'Criminal Liability'}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {currentLanguage === 'tr'
                      ? '18 yaş altı kişilerin kumar oynaması yasa dışıdır. Bu durumda hem kullanıcı hem de veliler yasal sorumluluk altına girebilir.'
                      : 'Gambling by persons under 18 is illegal. In this case, both the user and parents may be legally liable.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Parental Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  {currentLanguage === 'tr' ? 'Ebeveyn Kontrolü ve Koruma' : 'Parental Control and Protection'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Ebeveynler çocuklarını korumak için aşağıdaki önlemleri alabilir:'
                    : 'Parents can take the following measures to protect their children:'
                  }
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'İnternet Filtreleri' : 'Internet Filters'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Çocuğunuzun cihazına kumar sitelerini engelleyen filtreler kurun.'
                        : 'Install filters on your child\'s device that block gambling sites.'
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'Düzenli Kontrol' : 'Regular Monitoring'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Çocuğunuzun internet aktivitelerini düzenli olarak kontrol edin.'
                        : 'Regularly monitor your child\'s internet activities.'
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'Finansal Kontrol' : 'Financial Control'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Banka kartı ve kredi kartı kullanımını kontrol altında tutun.'
                        : 'Keep debit and credit card usage under control.'
                      }
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">
                      {currentLanguage === 'tr' ? 'Bilinçlendirme' : 'Education'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {currentLanguage === 'tr'
                        ? 'Çocuğunuzu kumar riskleri konusunda bilinçlendirin.'
                        : 'Educate your child about gambling risks.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsible Gaming */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  {currentLanguage === 'tr' ? 'Sorumlu Oyun Taahhüdü' : 'Responsible Gaming Commitment'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'GuduBet olarak sorumlu oyun politikalarını destekliyoruz:'
                    : 'As GuduBet, we support responsible gaming policies:'
                  }
                </p>
                
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Yaş doğrulama sistemleri' : 'Age verification systems'}
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Oyun süresi sınırlamaları' : 'Gaming time limitations'}
                  </li>
                  <li className="flex items-start gap-2">
                    <Lock className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Bahis limiti belirleme' : 'Betting limit setting'}
                  </li>
                  <li className="flex items-start gap-2">
                    <UserCheck className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    {currentLanguage === 'tr' ? 'Kendini dışlama seçenekleri' : 'Self-exclusion options'}
                  </li>
                </ul>
                
                <div className="pt-4">
                  <Link to="/responsible-gaming">
                    <Button className="w-full md:w-auto">
                      {currentLanguage === 'tr' 
                        ? 'Sorumlu Oyun Sayfasını Ziyaret Edin'
                        : 'Visit Responsible Gaming Page'
                      }
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Help and Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  {currentLanguage === 'tr' ? 'Yardım ve Destek' : 'Help and Support'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {currentLanguage === 'tr'
                    ? 'Kumar bağımlılığı ile ilgili yardım için:'
                    : 'For help with gambling addiction:'
                  }
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      {currentLanguage === 'tr' ? 'Kumar Bağımlıları Derneği' : 'Gambling Addicts Association'}
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>{currentLanguage === 'tr' ? 'Telefon:' : 'Phone:'}</strong> 0212 292 00 00<br />
                      <strong>Web:</strong> www.kumarbagimlilaridernegi.org
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">AMATEM</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>{currentLanguage === 'tr' ? 'Telefon:' : 'Phone:'}</strong> 183<br />
                      <strong>{currentLanguage === 'tr' ? '24/7 Destek Hattı' : '24/7 Support Line'}</strong>
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