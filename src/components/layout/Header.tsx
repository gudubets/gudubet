import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { LoginModal } from '@/components/auth/LoginModal';
import UserProfileModal from '@/components/ui/user-profile-modal';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, Wallet, Bell, CreditCard } from 'lucide-react';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useNotifications } from '@/hooks/useNotifications';
import { useI18n } from '@/hooks/useI18n';
import NotificationsDropdown from '@/components/ui/notifications-dropdown';
import LanguageSelector from '@/components/LanguageSelector';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const location = useLocation();
  
  // I18n hook for translations
  const { t } = useI18n();
  
  // Get user balance data
  const balanceData = useUserBalance(user);
  
  // Get notifications data
  const notificationsData = useNotifications(user);
  
  // Navigation items with translations
  const navItems = [{
    name: t('sports'),
    href: '/sports-betting'
  }, {
    name: t('live_betting'),
    href: '/live-betting'
  }, {
    name: t('casino'),
    href: '/casino'
  }, {
    name: t('live_casino'),
    href: '/live-casino'
  }, {
    name: t('bonuses'),
    href: '/promotions'
  }, {
    name: t('vip_program'),
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
            <LanguageSelector />
            {!user ? <>
                <Button variant="outline" onClick={() => setIsLoginModalOpen(true)} className="text-black bg-white border-white hover:bg-gray-100 text-xs px-4 h-8 uppercase font-medium">
                  {t('login_button')}
                </Button>
                <Button onClick={() => setIsRegistrationModalOpen(true)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 h-8 uppercase font-medium">
                  {t('register_button')}
                </Button>
              </> : <div className="flex items-center space-x-4">
                <Link to="/deposit-withdrawal" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">
                    {balanceData.loading ? '...' : `₺${balanceData.total_balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                  </span>
                </Link>
                <Link to="/user/withdraw" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Çekim</span>
                </Link>
                <NotificationsDropdown 
                  notifications={notificationsData.notifications}
                  unreadCount={notificationsData.unreadCount}
                  loading={notificationsData.loading}
                  onMarkAsRead={notificationsData.markAsRead}
                  onMarkAllAsRead={notificationsData.markAllAsRead}
                />
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
                  {t('login_button')}
                </Button>
                <Button onClick={() => {
            setIsRegistrationModalOpen(true);
            setIsMenuOpen(false);
          }} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  {t('register_button')}
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
        currentUser={user}
        balanceData={balanceData}
      />
    </header>;
};
export default Header;