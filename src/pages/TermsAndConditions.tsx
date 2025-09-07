import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, AlertCircle, Scale, Users, Calendar, Globe } from 'lucide-react';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Scale className="w-12 h-12 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">Kurallar ve</span>
              <span className="text-orange-500"> Şartlar</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            GuduBet platformunu kullanırken uymanız gereken kurallar ve şartlar
          </p>
          <div className="flex justify-center items-center mt-4 text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Son güncelleme: 7 Eylül 2025
          </div>
        </div>

        <div className="space-y-8">
          {/* Genel Kurallar */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Shield className="w-6 h-6 mr-3" />
                1. Genel Kurallar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                GuduBet platformuna erişim ve kullanım, aşağıdaki şartlara tabi olup, 
                bu şartları kabul etmekle yükümlü olursunuz.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>18 yaşından büyük olmalısınız</li>
                <li>Yasal olarak bahis oynamaya yetkili olmalısınız</li>
                <li>Tek bir hesap açma hakkınız vardır</li>
                <li>Doğru ve güncel bilgiler vermelisiniz</li>
                <li>Hesap güvenliğinizden sorumlusunuz</li>
              </ul>
            </CardContent>
          </Card>

          {/* Hesap Kullanımı */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Users className="w-6 h-6 mr-3" />
                2. Hesap Kullanımı ve Sorumluluklar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">2.1 Hesap Açma</h4>
              <p>
                Hesap açmak için gerçek, doğru ve tam bilgiler sağlamalısınız. 
                Sahte bilgiler kullanılması hesabın kapatılmasına neden olabilir.
              </p>
              
              <h4 className="text-white font-semibold">2.2 Hesap Güvenliği</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Şifrenizi kimseyle paylaşmamalısınız</li>
                <li>Hesabınızda şüpheli aktivite fark ederseniz derhal bildiriniz</li>
                <li>Hesap bilgilerinizi güncel tutmalısınız</li>
              </ul>

              <h4 className="text-white font-semibold">2.3 Yasaklı Aktiviteler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hileli yazılım veya botlar kullanmak</li>
                <li>Çoklu hesap açmak</li>
                <li>Para aklama faaliyetleri</li>
                <li>Başka kullanıcıların hesaplarına erişmeye çalışmak</li>
              </ul>
            </CardContent>
          </Card>

          {/* Bahis Kuralları */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Globe className="w-6 h-6 mr-3" />
                3. Bahis Kuralları ve Sınırlamalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">3.1 Minimum ve Maksimum Bahisler</h4>
              <p>
                Her bahis türü için minimum ve maksimum bahis limitleri belirlenmiştir. 
                Bu limitler oyun türüne ve kullanıcı seviyesine göre değişiklik gösterebilir.
              </p>

              <h4 className="text-white font-semibold">3.2 Bahis İptali</h4>
              <p>
                Teknik hatalar, açık hatalar veya olağandışı durumlar nedeniyle 
                bahisler iptal edilebilir. İptal edilen bahislerde yatırılan miktar iade edilir.
              </p>

              <h4 className="text-white font-semibold">3.3 Sonuç Belirleme</h4>
              <p>
                Bahis sonuçları resmi kaynaklara göre belirlenir. Tartışmalı durumlar 
                için nihai karar GuduBet yönetimine aittir.
              </p>
            </CardContent>
          </Card>

          {/* Ödeme Kuralları */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <AlertCircle className="w-6 h-6 mr-3" />
                4. Ödeme Kuralları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">4.1 Para Yatırma</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sadece kendinize ait ödeme yöntemlerini kullanabilirsiniz</li>
                <li>Minimum yatırım tutarları ödeme yöntemine göre değişir</li>
                <li>Para yatırma işlemleri anında gerçekleşir</li>
              </ul>

              <h4 className="text-white font-semibold">4.2 Para Çekme</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Çekim talebiniz 24-72 saat içinde işleme alınır</li>
                <li>Kimlik doğrulama gerekli olabilir</li>
                <li>Çekim işlemleri için minimum tutar 50 TL'dir</li>
                <li>Bonus şartlarını tamamlamanız gerekebilir</li>
              </ul>
            </CardContent>
          </Card>

          {/* Bonus ve Promosyonlar */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Globe className="w-6 h-6 mr-3" />
                5. Bonus ve Promosyonlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                Tüm bonuslar özel şart ve koşullara tabidir. Bonus kötüye kullanımı 
                tespit edildiğinde hesap kapatılabilir ve kazançlar iptal edilebilir.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Her kullanıcı sadece bir kez hoş geldin bonusundan yararlanabilir</li>
                <li>Bonus çevrim şartları tamamlanana kadar çekim yapılamaz</li>
                <li>Promosyon koşulları değişiklik gösterebilir</li>
              </ul>
            </CardContent>
          </Card>

          {/* Sorumlu Oyun */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Shield className="w-6 h-6 mr-3" />
                6. Sorumlu Oyun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                GuduBet sorumlu oyun politikasını destekler ve oyun bağımlılığının 
                önlenmesi için çeşitli araçlar sunar:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Günlük/haftalık/aylık bahis limitleri</li>
                <li>Kendini oyundan alıkoyma seçenekleri</li>
                <li>Oyun süresi takibi</li>
                <li>Profesyonel yardım kaynaklarına yönlendirme</li>
              </ul>
            </CardContent>
          </Card>

          {/* İletişim */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Users className="w-6 h-6 mr-3" />
                7. İletişim ve Şikayetler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                Herhangi bir sorun veya şikayet için 7/24 müşteri hizmetlerimizle 
                iletişime geçebilirsiniz:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>E-posta: support@gudubet.com</li>
                <li>Canlı sohbet: Site üzerinden</li>
                <li>Telegram: @gudubet</li>
              </ul>
            </CardContent>
          </Card>

          <Separator className="bg-gray-700" />

          {/* Yasal Uyarı */}
          <Card className="bg-orange-900/20 border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-orange-500 font-semibold mb-2">Önemli Yasal Uyarı</h3>
                  <p className="text-gray-300 text-sm">
                    Bu şartlar ve koşullar Curaçao yasalarına tabidir. GuduBet, 
                    bu şartları önceden haber vermeksizin değiştirme hakkını saklı tutar. 
                    Platformu kullanmaya devam ederek güncel şartları kabul etmiş sayılırsınız.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;