import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MessageCircle, Shield, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
const Footer = () => {
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
            Gudubet™ | Önde Gelen Casino ve Bahis Platformu
          </strong>
          <br />
          Gudubet ile en iyi casino ve bahis deneyimini yaşayın! 2000 TL hoş geldin bonusuyla hemen kazanmaya başlayın.
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

          {/* Genel Kurallar */}
          <div>
            <h3 className="text-orange-400 text-lg font-semibold mb-4 border-b border-orange-400 pb-2">Genel Kurallar</h3>
            <div className="space-y-2 text-sm">
              <Link 
                to="/terms-and-conditions"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                Kurallar ve Şartlar
              </Link>
              <Link 
                to="/privacy-policy"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                Gizlilik politikası
              </Link>
              <Link 
                to="/partnership"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                Ortaklık
              </Link>
            </div>
            <div className="space-y-2 text-sm mt-4">
              <Link 
                to="/responsible-gaming"
                className="block hover:text-orange-400 transition-colors cursor-pointer"
              >
                Sorumlu Oyun
              </Link>
            </div>
          </div>

          {/* Hakkımızda */}
          <div>
            <h3 className="text-orange-400 text-lg font-semibold mb-4 border-b border-orange-400 pb-2">Hakkımızda</h3>
            <div className="space-y-2 text-sm">
              <div>Bize ulaşın</div>
              <div>Gudubet Yardım Merkezi</div>
              <div>Bahis Kuralları</div>
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
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 mb-4">
            {['PAYco', 'Banka', 'SUPER PAY', 'PEP', 'papara', 'PAY', 'bitcoin', 'Litecoin', 'ethereum', 'VIGO', 'VIGO BONUS'].map(provider => <div key={provider} className="bg-gray-800 rounded p-2 flex items-center justify-center h-10">
                <span className="text-xs text-gray-300">{provider}</span>
              </div>)}
          </div>
        </div>

        {/* Game Providers - Row 1 */}
        <div className="mb-6">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 mb-4">
            {['GuduBet Original', 'PRAGMATIC', 'Evolution', 'PRAGMATIC', 'imaginelive', 'AMIDST', 'WAZDAN', 'DIGITAIN', 'HACKSAW', 'NOLIMIT', 'RED TIGER', 'MOD', 'SMARTSOFT'].map(provider => <div key={provider} className="bg-gray-800 rounded p-2 flex items-center justify-center h-10">
                <span className="text-xs text-gray-300">{provider}</span>
              </div>)}
          </div>
        </div>

        {/* Game Providers - Row 2 */}
        <div className="mb-6">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 mb-4">
            {['SPRIBE', 'PLAYSON', 'EGT', 'PG', 'betsolutions', 'BGAMING', 'zugi', 'RELAX', 'NETENT', 'GALAXSYS', 'BETSOFT', 'YGGDRASIL', 'BTG'].map(provider => <div key={provider} className="bg-gray-800 rounded p-2 flex items-center justify-center h-10">
                <span className="text-xs text-gray-300">{provider}</span>
              </div>)}
          </div>
        </div>

        {/* Game Providers - Row 3 */}
        <div className="mb-8">
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 mb-4">
            {['evoplay', 'HABANERO', 'Endorphina', 'Microgaming', 'QUICKSPIN', 'Swinominator', 'IRON DOG STUDIO', 'BOOMING GAMES', 'tom horn', 'NOMATIC'].map(provider => <div key={provider} className="bg-gray-800 rounded p-2 flex items-center justify-center h-10">
                <span className="text-xs text-gray-300">{provider}</span>
              </div>)}
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-xs text-gray-400 mb-4">
          gudubet.com Curaçao yasalarına göre kayıtlı ve 153142 şirket numarasına sahip Seguro N.V. tarafından işletilmektedir. Site GCB tarafından verilen geçerli bir lisansa sahiptir.
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © GuduBet. Tüm hakları saklıdır.
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