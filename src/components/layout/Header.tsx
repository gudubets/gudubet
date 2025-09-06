import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  Wallet, 
  Bell, 
  Settings,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const navItems = [
    { name: 'Spor Bahisleri', href: '/sports-betting' },
    { name: 'Canlı Bahisler', href: '/live-betting' },
    { name: 'Canlı Casino', href: '/live-casino' },
    { name: 'Slot Oyunları', href: '#slots' },
    { name: 'Tombala', href: '#bingo' },
    { name: 'Promosyonlar', href: '#promotions' },
  ];

  // Authentication state management
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span 
              className="text-xl font-gaming font-bold gradient-text-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.href = '/'}
            >
              GUDUBET
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="outline" size="sm" className="gap-2">
                  <Wallet className="w-4 h-4" />
                  ₺1,250.00
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/profile'}
                >
                  <UserIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open('/admin', '_blank')}
                >
                  Admin Panel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setIsLoginModalOpen(true)}
                >
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
                item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
            <div className="pt-4 border-t border-border space-y-3">
              {user ? (
                <>
                  <Button variant="outline" className="w-full gap-2">
                    <Wallet className="w-4 h-4" />
                    Bakiye: ₺1,250.00
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="flex-1">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <UserIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
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
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default Header;