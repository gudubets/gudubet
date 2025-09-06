import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { 
  Menu, 
  X, 
  User, 
  Wallet, 
  Bell, 
  Settings,
  LogIn,
  UserPlus
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const navItems = [
    { name: 'Spor Bahisleri', href: '#sports' },
    { name: 'Canlı Casino', href: '#casino' },
    { name: 'Slot Oyunları', href: '#slots' },
    { name: 'Tombala', href: '#bingo' },
    { name: 'Promosyonlar', href: '#promotions' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-gaming font-bold text-lg">SB</span>
            </div>
            <span className="text-xl font-gaming font-bold gradient-text-primary">
              SportsBet Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  ₺1,250.00
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsRegistrationModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Kayıt Ol
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 border-t border-border">
            <nav className="space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-border space-y-3">
              {isLoggedIn ? (
                <>
                  <Button variant="outline" className="w-full gap-2">
                    <Wallet className="w-4 h-4" />
                    Bakiye: ₺1,250.00
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="flex-1">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1">
                      <User className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full gap-2"
                    onClick={() => setIsRegistrationModalOpen(true)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Kayıt Ol
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <RegistrationModal 
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </header>
  );
};

export default Header;