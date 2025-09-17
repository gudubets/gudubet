import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MessageCircle, Shield, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import bankLogoCompact from '@/assets/bank-logo-compact.png';
import { useI18n } from '@/hooks/useI18n';
const Footer = () => {
  const { currentLanguage, t } = useI18n();
  return <footer className="bg-black text-white">
      {/* Promotional Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto p-4 text-center rounded-lg text-base" style={{
        background: '#151414',
        padding: '10px',
        borderRadius: '10px',
        fontSize: '16px'
      }}>
          <strong style={{
          color: '#fbb204'
        }}>
            {currentLanguage === 'tr' 
              ? 'Gudubet™ | Önde Gelen Casino ve Bahis Platformu'
              : 'Gudubet™ | Leading Casino and Betting Platform'
            }
          </strong>
          <br />
          {currentLanguage === 'tr'
            ? 'Gudubet ile en iyi casino ve bahis deneyimini yaşayın! 2000 TL hoş geldin bonusuyla hemen kazanmaya başlayın.'
            : 'Experience the best casino and betting with Gudubet! Start winning with 2000 TL welcome bonus.'
          }
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Email */}
          <div>
            <div className="text-orange-400 text-sm mb-2">EMAIL</div>
            <div className="text-orange-400">support@gudubet.com</div>
          </div>

          {/* Legal/General Rules */}
          <div>
            <h3 className="text-orange-400 text-lg font-semibold mb-4 border-b border-orange-400 pb-2">
              {currentLanguage === 'tr' ? 'Genel Kurallar' : 'Legal & Rules'}
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                to="/terms-and-conditions"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Kurallar ve Şartlar' : 'Terms & Conditions'}
              </Link>
              <Link 
                to="/privacy-policy"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
              </Link>
              <Link 
                to="/cookie-policy"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Çerez Politikası' : 'Cookie Policy'}
              </Link>
              <Link 
                to="/partnership"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Ortaklık' : 'Partnership'}
              </Link>
            </div>
            <div className="space-y-2 text-sm mt-4">
              <Link 
                to="/responsible-gaming"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Sorumlu Oyun' : 'Responsible Gaming'}
              </Link>
              <Link 
                to="/age-warning"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? '18+ Yaş Uyarısı' : '18+ Age Warning'}
              </Link>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-orange-400 text-lg font-semibold mb-4 border-b border-orange-400 pb-2">
              {currentLanguage === 'tr' ? 'Hakkımızda' : 'About Us'}
            </h3>
            <div className="space-y-2 text-sm">
              <Link 
                to="/contact-us"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Bize ulaşın' : 'Contact Us'}
              </Link>
              <Link 
                to="/help-center"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Gudubet Yardım Merkezi' : 'Gudubet Help Center'}
              </Link>
              <Link 
                to="/betting-rules"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                {currentLanguage === 'tr' ? 'Bahis Kuralları' : 'Betting Rules'}
              </Link>
            </div>
            
            {/* Certifications */}
            <div className="flex items-center gap-4 mt-6">
              <div className="bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center text-xs font-bold">
                18+
              </div>
              <div className="bg-green-600 rounded px-3 py-1 text-xs font-bold">
                GCB
              </div>
              <div className="bg-red-600 rounded px-2 py-1 text-xs font-bold flex items-center gap-1">
                🇹🇷 TR
              </div>
            </div>
          </div>
        </div>

        {/* Payment Providers */}
        <div className="mb-8">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-6 mb-4 items-center">
            {['PAYco', 'Banka', 'SUPER PAY', 'PEP', 'papara', 'PAY', 'Hey', 'bitcoin', 'Litecoin', 'ethereum', 'TRX', 'DOGE'].map((provider, index) => (
              <div key={`payment-${provider}-${index}`} className="flex items-center justify-center h-8 opacity-70 hover:opacity-100 transition-opacity">
                {provider === 'PAYco' ? (
                  <img 
                    src="/lovable-uploads/images-2.png" 
                    alt="PayCo" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'Banka' ? (
                  <img 
                    src="/lovable-uploads/d69c217a-d016-4085-a2fb-32e5edbf795a.png" 
                    alt="Banka" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'SUPER PAY' ? (
                  <img 
                    src="/lovable-uploads/4e010e53-eeae-4995-9217-4a4443b976c2.png" 
                    alt="SuperPay" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'PEP' ? (
                  <img 
                    src="/lovable-uploads/8627ae24-cef8-4f70-b840-ca2efba32223.png" 
                    alt="PEP" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'papara' ? (
                  <img 
                    src="/lovable-uploads/902957d9-017b-4fed-8e28-fc43872f0ac4.png" 
                    alt="Papara" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'PAY' ? (
                  <img 
                    src="/lovable-uploads/1f2a654f-a8f3-4da6-91e2-50385bc78663.png" 
                    alt="PAY" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'Hey' ? (
                  <span className="text-sm font-bold text-white">Hey</span>
                ) : provider === 'bitcoin' ? (
                  <img 
                    src="/lovable-uploads/b309d125-4554-4c9e-b138-1e77bf9c039a.png" 
                    alt="Bitcoin" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'Litecoin' ? (
                  <img 
                    src="/lovable-uploads/18eee11b-4a02-40bc-9ef7-fdcad384ea3f.png" 
                    alt="Litecoin" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'ethereum' ? (
                  <img 
                    src="/lovable-uploads/a1446f55-3168-4b98-8c46-44246d579061.png" 
                    alt="Ethereum" 
                    className="h-6 w-auto object-contain filter brightness-0 invert"
                  />
                ) : provider === 'TRX' ? (
                  <span className="text-sm font-bold text-white">TRX</span>
                ) : provider === 'DOGE' ? (
                  <span className="text-sm font-bold text-white">DOGE</span>
                ) : (
                  <span className="text-sm font-bold text-white">{provider}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Providers - Row 1 */}
        <div className="mb-6">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-6 mb-4 items-center">
            {['GuduBet Original', 'PRAGMATIC', 'Evolution', 'PRAGMATIC LIVE', 'imaginelive', 'AMIDST', 'WAZDAN', 'DIGITAIN', 'HACKSAW', 'NOLIMIT', 'RED TIGER', 'MOD', 'SMARTSOFT'].map((provider, index) => 
              <div key={`provider1-${provider}-${index}`} className="flex items-center justify-center h-8 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-300 font-medium">{provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Providers - Row 2 */}
        <div className="mb-6">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-6 mb-4 items-center">
            {['SPRIBE', 'PLAYSON', 'EGT', 'PG', 'betsolutions', 'BGAMING', 'zugi', 'RELAX', 'NETENT', 'GALAXSYS', 'BETSOFT', 'YGGDRASIL', 'BTG'].map((provider, index) => 
              <div key={`provider2-${provider}-${index}`} className="flex items-center justify-center h-8 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-300 font-medium">{provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Providers - Row 3 */}
        <div className="mb-8">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-6 mb-4 items-center">
            {['evoplay', 'HABANERO', 'Endorphina', 'Microgaming', 'QUICKSPIN', 'Swinominator', 'IRON DOG STUDIO', 'BOOMING GAMES', 'tom horn', 'NOMATIC'].map((provider, index) => 
              <div key={`provider3-${provider}-${index}`} className="flex items-center justify-center h-8 opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-300 font-medium">{provider}</span>
              </div>
            )}
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-xs text-gray-400 mb-4">
          {currentLanguage === 'tr'
            ? 'gudubet.com Curaçao yasalarına göre kayıtlı ve 153142 şirket numarasına sahip Seguro N.V. tarafından işletilmektedir. Site GCB tarafından verilen geçerli bir lisansa sahiptir.'
            : 'gudubet.com is operated by Seguro N.V., registered under Curaçao laws with company number 153142. The site holds a valid license issued by GCB.'
          }
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              {currentLanguage === 'tr' 
                ? '© GuduBet. Tüm hakları saklıdır.'
                : '© GuduBet. All rights reserved.'
              }
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 rounded-full p-1">
                <span className="text-black text-xs">♦️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;