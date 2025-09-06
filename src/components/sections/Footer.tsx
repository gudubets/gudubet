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
  return (
    <footer className="bg-black">
      {/* Promotional Banner */}
      <div className="container mx-auto px-4">
        <div 
          className="mx-auto p-4 text-center rounded-lg text-base"
          style={{ 
            background: '#151414', 
            padding: '10px', 
            borderRadius: '10px', 
            fontSize: '16px' 
          }}
        >
          <strong style={{ color: '#fbb204' }}>
            Casibom™ | Önde Gelen Casino ve Bahis Platformu
          </strong>
          <br />
          Casibom ile en iyi casino ve bahis deneyimini yaşayın! 2000 TL hoş geldin bonusuyla hemen kazanmaya başlayın.
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 items-center">
            {/* Payment method placeholders - you can replace these with actual payment logos */}
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">VISA</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">MC</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Papara</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Paykasa</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Bitcoin</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Havale</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Astropay</span>
            </div>
            <div className="bg-white rounded p-2 flex items-center justify-center h-12">
              <span className="text-xs font-semibold text-gray-800">Jeton</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div>
              © 2024 Casibom™. Tüm hakları saklıdır.
            </div>
            <div className="flex items-center gap-4">
              <span>18+ Sorumlu Oyun</span>
              <span>|</span>
              <span>Güvenli Ödeme</span>
              <span>|</span>
              <span>7/24 Destek</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;