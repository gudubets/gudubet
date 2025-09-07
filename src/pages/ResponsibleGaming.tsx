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

const ResponsibleGaming = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Shield className="w-16 h-16 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">Sorumlu</span>
              <span className="text-orange-500"> Oyun</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Güvenli ve kontrollü oyun deneyimi için size sunduğumuz araçlar ve destek hizmetleri
          </p>
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-orange-400">
              Bahis ve oyunlar eğlenceli olmalı, asla bir sorun haline gelmemelidir
            </p>
          </div>
        </div>

        {/* Uyarı Sinyalleri */}
        <Card className="bg-red-900/20 border-red-500/50 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-red-400 text-2xl">
              <AlertTriangle className="w-8 h-8 mr-3" />
              Dikkat Edilmesi Gereken Uyarı Sinyalleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Davranışsal Değişikler</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Planladığınızdan daha uzun süre oynama
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Kaybettiklerinizi geri kazanma obsesyonu
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Oyun oynamak için borç alma
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Ailenizden veya arkadaşlarınızdan oyunu gizleme
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Duygusal Belirtiler</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Kaybettiğinizde aşırı stres ve kaygı
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Oyun oynayamadığınızda huzursuzluk
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    Günlük işlerinizi ihmal etme
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    İlişkilerinizde sorunlar yaşama
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kontrol Araçları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-900/50 to-gray-900 border-blue-500/30 text-center">
            <CardContent className="p-6">
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-400 mb-2">Zaman Sınırı</h3>
              <p className="text-gray-300 text-sm mb-4">
                Günlük oyun sürenizi sınırlayın
              </p>
              <Button size="sm" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/20">
                Ayarla
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-gray-900 border-green-500/30 text-center">
            <CardContent className="p-6">
              <Lock className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">Bahis Limiti</h3>
              <p className="text-gray-300 text-sm mb-4">
                Günlük/haftalık bahis limitinizi belirleyin
              </p>
              <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/20">
                Ayarla
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-gray-900 border-orange-500/30 text-center">
            <CardContent className="p-6">
              <Ban className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-orange-400 mb-2">Mola Ver</h3>
              <p className="text-gray-300 text-sm mb-4">
                24 saat - 30 gün arası mola alın
              </p>
              <Button size="sm" variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/20">
                Ayarla
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-gray-900 border-red-500/30 text-center">
            <CardContent className="p-6">
              <Settings className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-400 mb-2">Kendini Engelle</h3>
              <p className="text-gray-300 text-sm mb-4">
                Hesabınızı kalıcı olarak kapatın
              </p>
              <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                Başvur
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sorumlu Oyun İpuçları */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <CheckCircle className="w-8 h-8 mr-3" />
              Sorumlu Oyun İpuçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Önceden Plan Yapın</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Oyun öncesi bütçenizi belirleyin ve aşmayın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Ne kadar süre oynayacağınızı önceden kararlaştırın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Kaybetmeyi göze alabileceğiniz miktarla oynayın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Oyunu bir eğlence olarak görün, gelir kaynağı olarak değil
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Sağlıklı Alışkanlıklar</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Düzenli molalar alın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Alkol veya uyuşturucu etkisinde oyun oynamayın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Kayıplarınızı kovalamaya çalışmayın
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    Diğer aktiviteler için de zaman ayırın
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yardım Kaynakları */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <Heart className="w-8 h-8 mr-3" />
              Profesyonel Yardım Kaynakları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Kumar Bağımlıları Derneği */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Kumar Bağımlıları Derneği</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-blue-400 mr-2" />
                    <span>0212 224 75 37</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-400 mr-2" />
                    <span>info@kumarbagımliligi.org</span>
                  </div>
                  <p className="mt-3">
                    Ücretsiz danışmanlık ve rehabilitasyon programları
                  </p>
                </div>
              </div>

              {/* AMATEM */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">AMATEM</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-green-400 mr-2" />
                    <span>444 6 483</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-green-400 mr-2" />
                    <span>7/24 Danışma Hattı</span>
                  </div>
                  <p className="mt-3">
                    Alkol ve Madde Bağımlılığı Tedavi Merkezi
                  </p>
                </div>
              </div>

              {/* Uluslararası Kaynaklar */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Gamblers Anonymous</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-purple-400 mr-2" />
                    <span>+44 330 094 8803</span>
                  </div>
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 text-purple-400 mr-2" />
                    <span>www.gamblersanonymous.org</span>
                  </div>
                  <p className="mt-3">
                    Uluslararası destek grubu ve kaynaklarr
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yasal Yaş Uyarısı */}
        <Card className="bg-orange-900/20 border-orange-500/50 mb-12">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="bg-orange-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-2xl font-bold">18+</span>
              </div>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Yasal Yaş Uyarısı</h3>
              <p className="text-gray-300 max-w-2xl mx-auto">
                GuduBet sadece 18 yaş ve üzeri kullanıcılara hizmet vermektedir. 
                Kimlik doğrulama işlemleri sırasında yaş kontrolü yapılmaktadır. 
                18 yaşından küçük kişilerin platforma erişimi yasaktır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Destek ve İletişim */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <Users className="w-8 h-8 mr-3" />
              Bizimle İletişime Geçin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">GuduBet Destek Ekibi</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-orange-500 mr-3" />
                    <span>support@gudubet.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-orange-500 mr-3" />
                    <span>+90 555 000 00 00</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-orange-500 mr-3" />
                    <span>7/24 Canlı Destek</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mt-4">
                  Sorumlu oyun konusunda size yardımcı olmak için buradayız. 
                  Hesabınızda limit koyma, mola verme veya kapama işlemleri 
                  için destek ekibimizle iletişime geçebilirsiniz.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Acil Durum Hatları</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-red-500 mr-3" />
                    <div>
                      <div className="font-semibold">Krize Müdahale Hattı</div>
                      <div className="text-sm">183</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-semibold">ALO 144 Danışma Hattı</div>
                      <div className="text-sm">144 (7/24)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-6">
                  <p className="text-red-400 text-sm font-semibold mb-2">Acil Durum:</p>
                  <p className="text-gray-300 text-sm">
                    Kendinize zarar verme düşünceniz varsa, derhal 112 Acil Servis 
                    veya yakınınızdaki hastaneye başvurunuz.
                  </p>
                </div>
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