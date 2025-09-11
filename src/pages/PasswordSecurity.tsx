import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Key,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

export default function PasswordSecurity() {
  const [showSupabaseInfo, setShowSupabaseInfo] = useState(true);

  const securityFeatures = [
    {
      title: 'Güçlü Şifre Kontrolü',
      description: 'Sistemimiz şifrenizin gücünü gerçek zamanlı analiz eder',
      status: 'active',
      icon: Shield
    },
    {
      title: 'Yaygın Şifre Koruması',
      description: 'Sıklıkla kullanılan zayıf şifreler engellenir',
      status: 'active',
      icon: Key
    },
    {
      title: 'Sızan Şifre Koruması',
      description: 'Daha önce güvenlik ihlallerinde ortaya çıkan şifreler',
      status: 'needs-config',
      icon: AlertTriangle
    }
  ];

  const passwordTips = [
    {
      tip: 'En az 12 karakter uzunluğunda olsun',
      example: 'MySecurePass123!',
      good: true
    },
    {
      tip: 'Büyük ve küçük harf karışımı kullanın',
      example: 'MyPassword vs mypassword',
      good: true
    },
    {
      tip: 'Rakam ve özel karakter ekleyin',
      example: 'Pass@123! vs Password',
      good: true
    },
    {
      tip: 'Kişisel bilgi kullanmayın',
      example: 'ahmet1990 ❌',
      good: false
    },
    {
      tip: 'Yaygın şifre kalıplarından kaçının',
      example: '123456, qwerty, password ❌',
      good: false
    },
    {
      tip: 'Her hesap için farklı şifre kullanın',
      example: 'Aynı şifreyi her yerde kullanmayın ❌',
      good: false
    }
  ];

  return (
    <>
      <SEO
        pageSlug="password-security"
        customTitle="Şifre Güvenliği | Gudubet"
        customDescription="Hesabınızın güvenliği için şifre güvenliği ipuçları ve best practice'leri öğrenin."
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Şifre Güvenliği</h1>
          <p className="text-muted-foreground">
            Hesabınızın güvenliği bizim önceliğimiz. Güvenli şifre oluşturma rehberimizi takip edin.
          </p>
        </div>

        {/* Supabase Bilgilendirme */}
        {showSupabaseInfo && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Yöneticiler için:</strong> Daha güçlü güvenlik için Supabase Auth ayarlarında 
                  "Leaked Password Protection" özelliğini etkinleştirin.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard/project/ziiwapwvyavfakeuhvpt/auth/providers', '_blank')}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Supabase Auth Ayarları
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSupabaseInfo(false)}
                  className="ml-2 text-blue-600"
                >
                  Gizle
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Güvenlik Özellikleri */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Mevcut Güvenlik Özellikleri
            </CardTitle>
            <CardDescription>
              Platformumuzda aktif olan şifre güvenlik önlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className={feature.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                    >
                      {feature.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Yapılandırma Gerekli
                        </>
                      )}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Şifre İpuçları */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="w-5 h-5 mr-2" />
              Güvenli Şifre Rehberi
            </CardTitle>
            <CardDescription>
              Güvenli şifre oluşturmak için bu kurallara uyun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {passwordTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-l-primary/20 bg-muted/50 rounded-r-lg">
                  {tip.good ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{tip.tip}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-mono bg-background px-2 py-1 rounded text-xs">
                        {tip.example}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Güvenlik Uyarıları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Güvenlik Uyarıları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Dikkat:</strong> Aynı şifreyi birden fazla sitede kullanmayın. 
                  Bir site hack'lenirse tüm hesaplarınız tehlikeye girebilir.
                </AlertDescription>
              </Alert>

              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <Eye className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>Phishing Saldırıları:</strong> Şifrenizi sadece resmi Gudubet sayfasında girin. 
                  Şüpheli e-postalardaki linklere tıklamayın.
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Lock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>İpucu:</strong> Şifre yöneticisi kullanın (1Password, Bitwarden, LastPass). 
                  Her hesap için benzersiz ve güçlü şifreler oluşturur.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}