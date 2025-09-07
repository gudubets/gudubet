import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Handshake, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Award, 
  Calendar, 
  Mail,
  Phone,
  Globe,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Partnership = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Handshake className="w-16 h-16 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">Ortaklık</span>
              <span className="text-orange-500"> Programı</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            GuduBet ile ortaklık kurun ve bahis sektöründeki en kazançlı programdan yararlanın
          </p>
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-orange-400">
              %45'e varan komisyon oranları ile en yüksek kazancı elde edin!
            </p>
          </div>
        </div>

        {/* Avantajlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-orange-900/50 to-gray-900 border-orange-500/30 text-center">
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-orange-400 mb-2">%45 Komisyon</h3>
              <p className="text-gray-300 text-sm">
                Sektördeki en yüksek komisyon oranları
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-gray-900 border-green-500/30 text-center">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">Haftalık Ödeme</h3>
              <p className="text-gray-300 text-sm">
                Kazançlarınızı haftada bir alın
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-gray-900 border-blue-500/30 text-center">
            <CardContent className="p-6">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-400 mb-2">Detaylı Raporlar</h3>
              <p className="text-gray-300 text-sm">
                Gerçek zamanlı istatistikler
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-gray-900 border-purple-500/30 text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-400 mb-2">7/24 Destek</h3>
              <p className="text-gray-300 text-sm">
                Özel affiliate destek ekibi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Komisyon Yapısı */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <TrendingUp className="w-8 h-8 mr-3" />
              Komisyon Yapısı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-400 mb-2">%25</div>
                <div className="text-white font-semibold mb-2">Başlangıç Komisyonu</div>
                <div className="text-gray-300 text-sm">0-50 Aktif Oyuncu</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                <div className="text-3xl font-bold text-green-400 mb-2">%35</div>
                <div className="text-white font-semibold mb-2">Orta Seviye</div>
                <div className="text-gray-300 text-sm">51-200 Aktif Oyuncu</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-400 mb-2">%45</div>
                <div className="text-white font-semibold mb-2">VIP Komisyon</div>
                <div className="text-gray-300 text-sm">200+ Aktif Oyuncu</div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Award className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-blue-400 font-semibold">Özel Bonuslar</span>
              </div>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• İlk 10 oyuncu getiren ortaklar için %5 ek bonus</li>
                <li>• Aylık 1000€ üzeri kazanç için %10 ekstra komisyon</li>
                <li>• Yıllık performans bonusu (kazanca göre %20'ye kadar)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Pazarlama Araçları */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <Target className="w-8 h-8 mr-3" />
              Pazarlama Araçları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Kreatif Materyaller</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Banner reklamları (çeşitli boyutlarda)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Video reklamlar
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Email şablonları
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sosyal medya içerikleri
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Landing page şablonları
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Teknik Destek</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    API entegrasyonu
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Tracking linkler
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Gerçek zamanlı raporlama
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Conversion optimizasyonu
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Özelleştirilebilir dashboard
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İletişim ve Başvuru Formu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* İletişim Bilgileri */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Mail className="w-6 h-6 mr-3" />
                İletişim Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">Affiliate Manager</div>
                  <div className="text-gray-300">affiliates@gudubet.com</div>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">WhatsApp Destek</div>
                  <div className="text-gray-300">+90 555 123 45 67</div>
                </div>
              </div>

              <div className="flex items-center">
                <Globe className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">Telegram</div>
                  <div className="text-gray-300">@gudubet_affiliates</div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="font-semibold text-white mb-2">Çalışma Saatleri</h4>
                <p className="text-gray-300 text-sm">Pazartesi - Pazar: 09:00 - 18:00 (GMT+3)</p>
                <p className="text-gray-300 text-sm">Acil durumlar için 7/24 WhatsApp destek</p>
              </div>
            </CardContent>
          </Card>

          {/* Başvuru Formu */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Users className="w-6 h-6 mr-3" />
                Ortaklık Başvurusu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">Ad *</Label>
                    <Input id="firstName" placeholder="Adınız" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">Soyad *</Label>
                    <Input id="lastName" placeholder="Soyadınız" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">E-posta *</Label>
                  <Input id="email" type="email" placeholder="ornek@email.com" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm">Telefon *</Label>
                  <Input id="phone" type="tel" placeholder="+90 555 123 45 67" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm">Website/Platform</Label>
                  <Input id="website" placeholder="www.orneksite.com" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="traffic" className="text-sm">Aylık Trafik</Label>
                  <Input id="traffic" placeholder="Örn: 10,000 ziyaretçi" className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-sm">Affiliate Deneyimi</Label>
                  <Textarea 
                    id="experience" 
                    placeholder="Daha önce hangi platformlarla çalıştınız? Deneyiminizi kısaca açıklayın."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3">
                  Başvuru Gönder
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Başvurunuz 24-48 saat içerisinde değerlendirilecektir.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* SSS */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-500 text-2xl">
              Sıkça Sorulan Sorular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-2">Ortaklık programına kimler başvurabilir?</h4>
                <p className="text-gray-300 text-sm">
                  18 yaşını doldurmuş, yasal olarak iş yapabilen herkes başvurabilir. 
                  Website, blog, sosyal medya hesapları veya email listesi olan kişiler tercih edilir.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Ödemeler ne zaman yapılır?</h4>
                <p className="text-gray-300 text-sm">
                  Ödemeler her hafta Salı günleri yapılır. Minimum ödeme tutarı 100€'dur. 
                  Bu tutarı geçmeyen kazançlar bir sonraki haftaya aktarılır.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Hangi pazarlama yöntemlerini kullanabilirim?</h4>
                <p className="text-gray-300 text-sm">
                  Yasal olmayan, spam veya yanıltıcı pazarlama yöntemleri dışında 
                  tüm pazarlama kanallarını kullanabilirsiniz. Detaylar sözleşmede belirtilmiştir.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Komisyon nasıl hesaplanır?</h4>
                <p className="text-gray-300 text-sm">
                  Komisyon, getirdiğiniz oyuncuların net kaybına (bahis tutarı - kazanç) göre hesaplanır. 
                  Aktif oyuncu sayınıza göre komisyon oranınız artar.
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

export default Partnership;