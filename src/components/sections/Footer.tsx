import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
  Phone,
  MessageCircle,
  Shield,
  Award,
  Clock
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Spor Bahisleri', href: '#sports' },
    { name: 'Canlı Casino', href: '#casino' },
    { name: 'Slot Oyunları', href: '#slots' },
    { name: 'Tombala', href: '#bingo' },
    { name: 'Promosyonlar', href: '#promotions' },
  ];

  const supportLinks = [
    { name: 'Yardım Merkezi', href: '#help' },
    { name: 'Canlı Destek', href: '#support' },
    { name: 'SSS', href: '#faq' },
    { name: 'İletişim', href: '#contact' },
    { name: 'Şikayet', href: '#complaints' },
  ];

  const legalLinks = [
    { name: 'Kullanım Şartları', href: '#terms' },
    { name: 'Gizlilik Politikası', href: '#privacy' },
    { name: 'Sorumlu Oyun', href: '#responsible' },
    { name: 'Güvenlik', href: '#security' },
    { name: 'Lisans', href: '#license' },
  ];

  const paymentMethods = [
    'Kredi Kartı', 'Banka Havalesi', 'Papara', 'Paykasa', 'Bitcoin'
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-gaming font-bold text-lg">SB</span>
              </div>
              <span className="text-xl font-gaming font-bold gradient-text-primary">
                SportsBet Pro
              </span>
            </div>
            
            <p className="text-muted-foreground">
              Türkiye'nin en güvenilir bahis ve casino platformu. 
              Lisanslı sağlayıcılar ile güvenli oyun deneyimi.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-success" />
                <span>SSL Güvenlik Sertifikası</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-gold" />
                <span>Lisanslı ve Denetimli</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span>7/24 Müşteri Desteği</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="ghost" size="sm">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hızlı Erişim</h3>
            <div className="space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Destek</h3>
            <div className="space-y-3">
              {supportLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span>+90 (212) 123 45 67</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>destek@sportsbetpro.com</span>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Canlı Destek
              </Button>
            </div>
          </div>

          {/* Legal & Payment */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Yasal</h3>
            <div className="space-y-3 mb-6">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-3">Ödeme Yöntemleri</h4>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method}
                    className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 SportsBet Pro. Tüm hakları saklıdır.
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>18+ Sorumlu Oyun</span>
              <span>•</span>
              <span>Lisans No: 123456</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;