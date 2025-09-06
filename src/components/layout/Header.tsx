import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User as UserIcon, 
  Wallet, 
  Bell, 
  Settings,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Spor', href: '/sports-betting' },
    { name: 'Canlı', href: '/live-betting' },
    { name: 'Casino', href: '#casino' },
    { name: 'Canlı Casino', href: '/live-casino' },
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
    <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">
              <span className="text-white font-bold text-lg">GUDUBET</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href.startsWith('#') && location.hash === item.href);
              
              return item.href.startsWith('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-orange-500 border-b-2 border-orange-500 pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-orange-500 border-b-2 border-orange-500 pb-1' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Daha Fazla Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Daha Fazla
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <a href="#slots" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700">
                    Slot Oyunları
                  </a>
                  <a href="#bingo" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700">
                    Tombala
                  </a>
                  <a href="#virtual-sports" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700">
                    Sanal Sporlar
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Button variant="outline" size="sm" className="gap-2 border-slate-600 text-gray-300 hover:bg-slate-700">
                  <Wallet className="w-4 h-4" />
                  ₺1,250.00
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-700">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-slate-700"
                  onClick={() => window.location.href = '/profile'}
                >
                  <UserIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-700">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-slate-600 text-gray-300 hover:bg-slate-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-sm font-medium"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Giriş Yap
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium"
                  onClick={() => setIsRegistrationModalOpen(true)}
                >
                  Üye Ol
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 space-y-4 border-t border-slate-700">
            <nav className="space-y-3">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href.startsWith('#') && location.hash === item.href);
                
                return item.href.startsWith('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-orange-500' : 'text-gray-300 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-700 space-y-3">
              {user ? (
                <>
                  <Button variant="outline" className="w-full gap-2 border-slate-600 text-gray-300">
                    <Wallet className="w-4 h-4" />
                    Bakiye: ₺1,250.00
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" className="flex-1 text-gray-300">
                      <Bell className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-gray-300"
                      onClick={() => window.location.href = '/profile'}
                    >
                      <UserIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1 text-gray-300">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 border-slate-600 text-gray-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Giriş Yap
                  </Button>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsRegistrationModalOpen(true)}
                  >
                    Üye Ol
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