import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Lock, Database, UserCheck, Calendar, Globe, AlertTriangle } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Shield className="w-12 h-12 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">Gizlilik</span>
              <span className="text-orange-500"> Politikası</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuz hakkında bilgiler
          </p>
          <div className="flex justify-center items-center mt-4 text-sm text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            Son güncelleme: 7 Eylül 2025
          </div>
        </div>

        <div className="space-y-8">
          {/* Genel Bilgiler */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Eye className="w-6 h-6 mr-3" />
                1. Genel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                GuduBet olarak, kullanıcılarımızın kişisel verilerinin güvenliğini ve gizliliğini 
                korumak önceliğimizdir. Bu gizlilik politikası, verilerinizi nasıl topladığımız, 
                kullandığımız, sakladığımız ve koruduğumuz konusunda şeffaflık sağlamak amacıyla hazırlanmıştır.
              </p>
              <p>
                Bu politika, KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR 
                (Genel Veri Koruma Yönetmeliği) uyumludur.
              </p>
            </CardContent>
          </Card>

          {/* Toplanan Veriler */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Database className="w-6 h-6 mr-3" />
                2. Toplanan Kişisel Veriler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">2.1 Kayıt Sırasında Toplanan Veriler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ad, soyad bilgileri</li>
                <li>E-posta adresi</li>
                <li>Telefon numarası</li>
                <li>Doğum tarihi</li>
                <li>Adres bilgileri</li>
                <li>Kimlik doğrulama belgeleri</li>
              </ul>

              <h4 className="text-white font-semibold">2.2 Platform Kullanımı Sırasında Toplanan Veriler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>IP adresi ve konum bilgileri</li>
                <li>Cihaz bilgileri (tarayıcı, işletim sistemi)</li>
                <li>Oturum süreleri ve aktivite logları</li>
                <li>Bahis geçmişi ve oyun tercihleri</li>
                <li>Ödeme işlem geçmişi</li>
                <li>Müşteri destek görüşmeleri</li>
              </ul>

              <h4 className="text-white font-semibold">2.3 Otomatik Olarak Toplanan Veriler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Çerezler (cookies) ve benzeri teknolojiler</li>
                <li>Web sitesi kullanım istatistikleri</li>
                <li>Sayfa görüntüleme bilgileri</li>
              </ul>
            </CardContent>
          </Card>

          {/* Veri Kullanım Amaçları */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <UserCheck className="w-6 h-6 mr-3" />
                3. Veri Kullanım Amaçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>Kişisel verilerinizi aşağıdaki amaçlarla kullanırız:</p>
              
              <h4 className="text-white font-semibold">3.1 Hizmet Sunumu</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hesap oluşturma ve yönetimi</li>
                <li>Bahis ve oyun hizmetleri sunma</li>
                <li>Ödeme işlemlerini gerçekleştirme</li>
                <li>Müşteri destek hizmeti sağlama</li>
              </ul>

              <h4 className="text-white font-semibold">3.2 Yasal Yükümlülükler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Kimlik doğrulama ve yaş kontrolü</li>
                <li>Anti-money laundering (AML) kontrolleri</li>
                <li>Vergi mevzuatı gereği raporlama</li>
                <li>Lisanslama gereksinimlerini karşılama</li>
              </ul>

              <h4 className="text-white font-semibold">3.3 Platform Geliştirme</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Hizmet kalitesini artırma</li>
                <li>Kişiselleştirilmiş deneyim sunma</li>
                <li>Güvenlik önlemlerini güçlendirme</li>
                <li>Teknik sorunları tespit etme ve çözme</li>
              </ul>
            </CardContent>
          </Card>

          {/* Veri Güvenliği */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Lock className="w-6 h-6 mr-3" />
                4. Veri Güvenliği ve Koruma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">4.1 Teknik Güvenlik Önlemleri</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>SSL/TLS şifreleme protokolleri</li>
                <li>Güvenli veri merkezlerinde saklama</li>
                <li>Çok faktörlü kimlik doğrulama</li>
                <li>Düzenli güvenlik taramaları</li>
                <li>Erişim kontrolü ve loglama</li>
              </ul>

              <h4 className="text-white font-semibold">4.2 Organizasyonel Önlemler</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Personel eğitimleri</li>
                <li>Veri işleme protokolleri</li>
                <li>Düzenli güvenlik denetimleri</li>
                <li>Gizlilik sözleşmeleri</li>
              </ul>

              <h4 className="text-white font-semibold">4.3 Veri Saklama Süreleri</h4>
              <p>
                Kişisel verilerinizi yalnızca gerekli olduğu süre boyunca saklarız. 
                Yasal yükümlülükler gereği bazı veriler daha uzun süre saklanabilir.
              </p>
            </CardContent>
          </Card>

          {/* Veri Paylaşımı */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Globe className="w-6 h-6 mr-3" />
                5. Veri Paylaşımı ve Aktarımı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">5.1 Üçüncü Taraflarla Paylaşım</h4>
              <p>Verilerinizi aşağıdaki durumlarda paylaşabiliriz:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ödeme hizmet sağlayıcıları ile (işlem gerçekleştirme için)</li>
                <li>Kimlik doğrulama hizmetleri ile</li>
                <li>Yasal yükümlülükler gereği yetkili otoriteler ile</li>
                <li>Hizmet sağlayıcılarımız ile (teknik destek için)</li>
              </ul>

              <h4 className="text-white font-semibold">5.2 Uluslararası Veri Aktarımı</h4>
              <p>
                Verileriniz güvenli ülkelere aktarılabilir. Bu durumda uygun 
                güvenlik önlemleri alınır ve yasal gerekliliklere uyulur.
              </p>
            </CardContent>
          </Card>

          {/* Kullanıcı Hakları */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <UserCheck className="w-6 h-6 mr-3" />
                6. Kullanıcı Hakları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Bilgi alma hakkı:</strong> Verilerinizin işlenip işlenmediğini öğrenme</li>
                <li><strong>Erişim hakkı:</strong> İşlenen verilerinizi görme</li>
                <li><strong>Düzeltme hakkı:</strong> Yanlış verilerin düzeltilmesini isteme</li>
                <li><strong>Silme hakkı:</strong> Verilerinizin silinmesini talep etme</li>
                <li><strong>İşlemeye itiraz hakkı:</strong> Veri işlemeye karşı çıkma</li>
                <li><strong>Veri taşınabilirliği hakkı:</strong> Verilerinizi başka platforma taşıma</li>
                <li><strong>Otomatik karar vermeye itiraz:</strong> Otomatik profilleme işlemlerine karşı çıkma</li>
              </ul>

              <p className="mt-4">
                Bu haklarınızı kullanmak için <strong>support@gudubet.com</strong> 
                adresine başvurabilirsiniz.
              </p>
            </CardContent>
          </Card>

          {/* Çerezler */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Database className="w-6 h-6 mr-3" />
                7. Çerezler (Cookies)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <h4 className="text-white font-semibold">7.1 Çerez Türleri</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Zorunlu çerezler:</strong> Site işlevselliği için gerekli</li>
                <li><strong>Performans çerezleri:</strong> Site performansını iyileştirme</li>
                <li><strong>Fonksiyonel çerezler:</strong> Kullanıcı deneyimini kişiselleştirme</li>
                <li><strong>Pazarlama çerezleri:</strong> Hedefli reklamlar sunma</li>
              </ul>

              <h4 className="text-white font-semibold">7.2 Çerez Yönetimi</h4>
              <p>
                Tarayıcı ayarlarınızdan çerezleri yönetebilir, kabul edip etmeme 
                konusunda tercih yapabilirsiniz. Bazı çerezleri devre dışı bırakmanız 
                site işlevselliğini etkileyebilir.
              </p>
            </CardContent>
          </Card>

          {/* İletişim */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Globe className="w-6 h-6 mr-3" />
                8. İletişim ve Başvurular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-300">
              <p>
                Gizlilik politikası ile ilgili sorularınız veya veri koruma 
                haklarınızı kullanmak için:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>E-posta:</strong> support@gudubet.com</li>
                <li><strong>Veri Koruma Sorumlusu:</strong> dpo@gudubet.com</li>
                <li><strong>Canlı Destek:</strong> 7/24 site üzerinden</li>
              </ul>

              <p className="mt-4">
                Başvurularınız 30 gün içerisinde cevaplanacaktır.
              </p>
            </CardContent>
          </Card>

          <Separator className="bg-gray-700" />

          {/* Önemli Uyarı */}
          <Card className="bg-orange-900/20 border-orange-500/50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-orange-500 font-semibold mb-2">Önemli Bilgilendirme</h3>
                  <p className="text-gray-300 text-sm">
                    Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler 
                    hakkında e-posta veya site üzerinden bilgilendirileceksiniz. 
                    Platformu kullanmaya devam ederek güncel politikayı kabul etmiş sayılırsınız.
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    <strong>Veri Sorumlusu:</strong> Seguro N.V. (Şirket No: 153142) - Curaçao
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

export default PrivacyPolicy;