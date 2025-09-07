import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { LoginModal } from '@/components/auth/LoginModal';
import UserProfileModal from '@/components/ui/user-profile-modal';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Wallet, Bell } from 'lucide-react';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  const navItems = [{
    name: 'SPOR',
    href: '/sports-betting'
  }, {
    name: 'CANLI BAHİS',
    href: '/live-betting'
  }, {
    name: 'CASİNO',
    href: '/casino'
  }, {
    name: 'CANLI CASİNO',
    href: '/live-casino'
  }, {
    name: 'BONUSLAR',
    href: '/promotions'
  }, {
    name: 'VIP PROGRAMI',
    href: '/vip'
  }];
  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    };
    getSession();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };
  return <header className="bg-black relative z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold">
              <span className="text-white">Gudu</span>
              <span className="text-orange-500">bet</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => <Link key={index} to={item.href} className="text-white hover:text-orange-400 transition-colors duration-200 text-sm font-medium uppercase">
                {item.name}
              </Link>)}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {!user ? <>
                <Button variant="outline" onClick={() => setIsLoginModalOpen(true)} className="text-black bg-white border-white hover:bg-gray-100 text-xs px-4 h-8 uppercase font-medium">
                  GİRİŞ
                </Button>
                <Button onClick={() => setIsRegistrationModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 h-8 uppercase font-medium">
                  ÜYE OL
                </Button>
              </> : <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">₺0.00</span>
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setIsProfileModalOpen(true)} className="text-white hover:bg-white/10 p-2">
                  <UserIcon className="h-4 w-4" />
                </Button>
              </div>}

            {/* Mobile Menu Button */}
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white hover:bg-white/10 p-2">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <div className="lg:hidden bg-gray-900 border-t border-gray-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item, index) => <Link key={index} to={item.href} onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-orange-400 transition-colors duration-200 py-2 uppercase font-medium">
                {item.name}
              </Link>)}
            
            {!user && <div className="flex space-x-2 pt-4 border-t border-gray-700">
                <Button variant="outline" onClick={() => {
            setIsLoginModalOpen(true);
            setIsMenuOpen(false);
          }} className="flex-1 text-black bg-white border-white hover:bg-gray-100">
                  GİRİŞ
                </Button>
                <Button onClick={() => {
            setIsRegistrationModalOpen(true);
            setIsMenuOpen(false);
          }} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  ÜYE OL
                </Button>
              </div>}
          </div>
        </div>}

      {/* Login and Registration Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <RegistrationModal isOpen={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user ? {
          email: user.email || '',
          first_name: user.user_metadata?.first_name,
          last_name: user.user_metadata?.last_name
        } : undefined}
      />
    </header>;
};
export default Header;