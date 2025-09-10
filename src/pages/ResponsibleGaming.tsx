import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Clock, 
  Users, 
  AlertTriangle, 
  Heart, 
  Phone,
  Mail,
  Lock,
  CheckCircle,
  Calendar,
  Ban,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import SEO from '@/components/SEO';

const ResponsibleGaming = () => {
  const { currentLanguage } = useI18n();

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        pageSlug="responsible-gaming"
        customTitle={currentLanguage === 'tr' ? "Sorumlu Oyun | GuduBet" : "Responsible Gaming | GuduBet"}
        customDescription={currentLanguage === 'tr'
          ? "GuduBet sorumlu oyun politikaları, kendini kontrol araçları ve kumar bağımlılığı konusunda destek kaynakları."
          : "GuduBet responsible gaming policies, self-control tools and support resources for gambling addiction."
        }
      />
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Shield className="w-16 h-16 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">
                {currentLanguage === 'tr' ? 'Sorumlu' : 'Responsible'}
              </span>
              <span className="text-orange-500">
                {currentLanguage === 'tr' ? ' Oyun' : ' Gaming'}
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            {currentLanguage === 'tr'
              ? 'Güvenli ve kontrollü oyun deneyimi için size sunduğumuz araçlar ve destek hizmetleri'
              : 'Tools and support services we provide for a safe and controlled gaming experience'
            }
          </p>
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-orange-400">
              {currentLanguage === 'tr'
                ? 'Bahis ve oyunlar eğlenceli olmalı, asla bir sorun haline gelmemelidir'
                : 'Betting and games should be fun, never become a problem'
              }
            </p>
          </div>
        </div>

        {/* Warning Signs */}
        <Card className="bg-red-900/20 border-red-500/50 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-red-400 text-2xl">
              <AlertTriangle className="w-8 h-8 mr-4" />
              {currentLanguage === 'tr' ? 'Uyarı Sinyalleri' : 'Warning Signs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6">
              {currentLanguage === 'tr'
                ? 'Aşağıdaki belirtilerden birini veya birkaçını yaşıyorsanız, yardım almanın zamanı gelmiş olabilir:'
                : 'If you are experiencing one or more of the following symptoms, it may be time to seek help:'
              }
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-orange-400 font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {currentLanguage === 'tr' ? 'Davranışsal Belirtiler' : 'Behavioral Signs'}
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr' 
                      ? 'Planladığınızdan daha uzun süre oynama'
                      : 'Playing longer than planned'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Planladığınızdan daha fazla para harcama'
                      : 'Spending more money than planned'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Kaybettikten sonra hızla geri kazanmaya çalışma'
                      : 'Trying to quickly win back losses'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oyun oynama alışkanlığınızı gizleme'
                      : 'Hiding your gaming habits'
                    }
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  {currentLanguage === 'tr' ? 'Duygusal Belirtiler' : 'Emotional Signs'}
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oyun oynarken endişe veya stres hissetme'
                      : 'Feeling anxiety or stress while playing'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oyun oynayamadığında rahatsızlık hissetme'
                      : 'Feeling uncomfortable when unable to play'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Diğer aktivitelerden zevk almama'
                      : 'Not enjoying other activities'
                    }
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-1 mr-2 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Sadece oyun oynarken mutlu hissetme'
                      : 'Only feeling happy when playing'
                    }
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Tools */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-orange-500">
              {currentLanguage === 'tr' ? 'Kontrol Araçları' : 'Control Tools'}
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <CardTitle className="text-orange-400">
                  {currentLanguage === 'tr' ? 'Zaman Sınırı' : 'Time Limit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-4">
                  {currentLanguage === 'tr'
                    ? 'Günlük, haftalık veya aylık oyun sürenizi sınırlayın'
                    : 'Limit your daily, weekly or monthly gaming time'
                  }
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  {currentLanguage === 'tr' ? 'Sınır Belirle' : 'Set Limit'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <Lock className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <CardTitle className="text-orange-400">
                  {currentLanguage === 'tr' ? 'Bahis Sınırı' : 'Betting Limit'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-4">
                  {currentLanguage === 'tr'
                    ? 'Günlük, haftalık veya aylık bahis miktarınızı sınırlayın'
                    : 'Limit your daily, weekly or monthly betting amount'
                  }
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  {currentLanguage === 'tr' ? 'Sınır Belirle' : 'Set Limit'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <Ban className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <CardTitle className="text-orange-400">
                  {currentLanguage === 'tr' ? 'Mola Ver' : 'Take a Break'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-4">
                  {currentLanguage === 'tr'
                    ? '24 saat ile 6 hafta arasında hesabınızı geçici olarak kapatın'
                    : 'Temporarily close your account for 24 hours to 6 weeks'
                  }
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  {currentLanguage === 'tr' ? 'Mola Ver' : 'Take Break'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <Settings className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <CardTitle className="text-orange-400">
                  {currentLanguage === 'tr' ? 'Kendini Dışlama' : 'Self-Exclusion'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-300 mb-4">
                  {currentLanguage === 'tr'
                    ? '6 ay ile 5 yıl arasında hesabınızı kalıcı olarak kapatın'
                    : 'Permanently close your account for 6 months to 5 years'
                  }
                </p>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  {currentLanguage === 'tr' ? 'Kendini Dışla' : 'Self-Exclude'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Responsible Gaming Tips */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-400 flex items-center">
              <CheckCircle className="w-8 h-8 mr-4" />
              {currentLanguage === 'tr' ? 'Sorumlu Oyun İpuçları' : 'Responsible Gaming Tips'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-orange-400 font-semibold mb-4">
                  {currentLanguage === 'tr' ? 'Önceden Planlayın' : 'Plan Ahead'}
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oynayacağınız süreyi önceden belirleyin'
                      : 'Set the time you will play in advance'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Kaybetmeyi göze alabileceğiniz miktarla oynayın'
                      : 'Play with an amount you can afford to lose'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oyunu bir yatırım değil, eğlence olarak görün'
                      : 'See the game as entertainment, not investment'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Duygusal olduğunuzda oynamayın'
                      : 'Don\'t play when you\'re emotional'
                    }
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-4">
                  {currentLanguage === 'tr' ? 'Sağlıklı Alışkanlıklar' : 'Healthy Habits'}
                </h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Düzenli molalar verin'
                      : 'Take regular breaks'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Başka hobiler ve aktiviteler yapın'
                      : 'Engage in other hobbies and activities'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Arkadaşlarınız ve ailenizle zaman geçirin'
                      : 'Spend time with friends and family'
                    }
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                    {currentLanguage === 'tr'
                      ? 'Oyun alışkanlıklarınızı takip edin'
                      : 'Track your gaming habits'
                    }
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Help */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-400 flex items-center">
              <Phone className="w-8 h-8 mr-4" />
              {currentLanguage === 'tr' ? 'Profesyonel Yardım' : 'Professional Help'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-6">
              {currentLanguage === 'tr'
                ? 'Kumar bağımlılığı konusunda yardım alabileceğiniz kuruluşlar:'
                : 'Organizations where you can get help with gambling addiction:'
              }
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-400 font-semibold mb-3">
                  {currentLanguage === 'tr' 
                    ? 'Kumar Bağımlıları Derneği'
                    : 'Gambling Addicts Association'
                  }
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>{currentLanguage === 'tr' ? 'Telefon:' : 'Phone:'}</strong> 0212 292 00 00</p>
                  <p><strong>Email:</strong> info@kumarbagimlilaridernegi.org</p>
                  <p className="text-gray-400">
                    {currentLanguage === 'tr'
                      ? 'Kumar bağımlılığı ile mücadele eden bireyler ve ailelerine destek'
                      : 'Support for individuals and families struggling with gambling addiction'
                    }
                  </p>
                </div>
              </div>
              
              <div className="bg-green-900/20 p-6 rounded-lg border border-green-500/30">
                <h4 className="text-green-400 font-semibold mb-3">AMATEM</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>{currentLanguage === 'tr' ? 'Telefon:' : 'Phone:'}</strong> 183</p>
                  <p><strong>Email:</strong> amatem@gov.tr</p>
                  <p className="text-gray-400">
                    {currentLanguage === 'tr'
                      ? 'Alkol ve Madde Bağımlılığı Tedavi Merkezleri - 24/7 destek hattı'
                      : 'Alcohol and Substance Addiction Treatment Centers - 24/7 support line'
                    }
                  </p>
                </div>
              </div>
              
              <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30">
                <h4 className="text-purple-400 font-semibold mb-3">
                  {currentLanguage === 'tr' ? 'Gamblers Anonymous' : 'Gamblers Anonymous'}
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><strong>Web:</strong> gamblersanonymous.org</p>
                  <p><strong>Email:</strong> info@gamblersanonymous.org</p>
                  <p className="text-gray-400">
                    {currentLanguage === 'tr'
                      ? 'Uluslararası kumar bağımlılığı destek grubu'
                      : 'International gambling addiction support group'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Age Verification */}
        <Card className="bg-red-900/20 border-red-500/50 mb-12">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">18+</span>
            </div>
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              {currentLanguage === 'tr' ? 'Yaş Uyarısı' : 'Age Warning'}
            </h3>
            <p className="text-gray-300 mb-4">
              {currentLanguage === 'tr'
                ? 'Bu platform yalnızca 18 yaş ve üzeri kişiler içindir. Yaş doğrulama işlemleri titizlikle yapılmaktadır.'
                : 'This platform is only for people 18 years and older. Age verification procedures are carried out meticulously.'
              }
            </p>
            <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
              {currentLanguage === 'tr' ? 'Yaş Doğrulama Hakkında' : 'About Age Verification'}
            </Button>
          </CardContent>
        </Card>

        {/* Support and Contact */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-400 flex items-center">
              <HelpCircle className="w-8 h-8 mr-4" />
              {currentLanguage === 'tr' ? 'Destek ve İletişim' : 'Support and Contact'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-orange-400 font-semibold mb-4">
                  {currentLanguage === 'tr' ? 'GuduBet Destek Ekibi' : 'GuduBet Support Team'}
                </h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-orange-400 mr-3" />
                    <span>support@gudubet.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-orange-400 mr-3" />
                    <span>{currentLanguage === 'tr' ? 'Canlı Destek 7/24' : 'Live Support 24/7'}</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  {currentLanguage === 'tr'
                    ? 'Sorumlu oyun araçlarınızı ayarlamak için destek ekibimizle iletişime geçebilirsiniz.'
                    : 'You can contact our support team to set up your responsible gaming tools.'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="text-red-400 font-semibold mb-4">
                  {currentLanguage === 'tr' ? 'Acil Durum Hatları' : 'Emergency Hotlines'}
                </h4>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-400 mr-3" />
                    <span>183 - {currentLanguage === 'tr' ? 'AMATEM' : 'AMATEM'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-400 mr-3" />
                    <span>144 - {currentLanguage === 'tr' ? 'Alo Sosyal Hizmetler' : 'Social Services Hotline'}</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  {currentLanguage === 'tr'
                    ? 'Acil durumlarda 112 numaralı acil servis hattını arayın.'
                    : 'In emergencies, call 112 emergency services.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ResponsibleGaming;