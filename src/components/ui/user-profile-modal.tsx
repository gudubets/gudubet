import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  MessageSquare, 
  Crown, 
  Trophy, 
  Zap, 
  Gift, 
  RotateCw, 
  Clock,
  LogOut,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useLossBonus } from '@/hooks/useLossBonus';

interface UserBalance {
  balance: number;
  bonus_balance: number;
  total_balance: number;
  loading: boolean;
  error: string | null;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
  balanceData?: UserBalance;
  currentUser?: any; // Full user object from Supabase
}

const UserProfileModal = ({ isOpen, onClose, user, balanceData, currentUser }: UserProfileModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSuperAdmin, loading: adminLoading } = useAdminAccess(currentUser);
  const { lossBonusData, claimLossBonus, isClaimingLossBonus } = useLossBonus(currentUser?.id);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      navigate('/');
      toast({
        title: "Başarıyla çıkış yapıldı",
        description: "Güvenle çıkış yaptınız."
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleDepositClick = () => {
    onClose();
    navigate('/user/deposit');
  };

  const handleAccountClick = () => {
    onClose();
    navigate('/profile');
  };

  const handleAdminPanelClick = () => {
    onClose();
    navigate('/admin');
  };

  const handleAdminManagementClick = () => {
    onClose();
    navigate('/admin/management');
  };

  const handleLossBonusClick = () => {
    if (lossBonusData?.isEligible) {
      claimLossBonus();
    }
  };

  const getUserDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'Kullanıcı';
  };

  const menuItems = [
    { icon: MessageSquare, label: 'MESAJLAR', value: 'HİÇ MESAJINIZ YOK', color: 'text-gray-400' },
    { icon: Crown, label: 'VIP SEVİYENİZ', value: 'SİLVER', color: 'text-silver' },
    { icon: Trophy, label: 'SEVİYE PUANI', value: '1,186.50', color: 'text-green-500' },
    { icon: Zap, label: 'FREESPINS', value: '0', color: 'text-orange-500' },
    { 
      icon: Gift, 
      label: 'BONUS', 
      value: balanceData?.loading ? '...' : `${(balanceData?.bonus_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}₺`, 
      color: (balanceData?.bonus_balance || 0) > 0 ? 'text-green-500' : 'text-gray-400' 
    },
    { icon: RotateCw, label: 'TOPLAM ÇEVİRİM', value: 'AKTİF BONUS YOK', color: 'text-gray-400' },
    { icon: Clock, label: 'ÇEVİRİM SÜRESİ', value: 'AKTİF BONUS YOK', color: 'text-gray-400' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 text-white">
        {/* Accessibility titles - visually hidden */}
        <DialogTitle className="sr-only">Kullanıcı Profili</DialogTitle>
        <DialogDescription className="sr-only">
          Kullanıcı bakiyesi, profil bilgileri ve hesap işlemleri
        </DialogDescription>
        
        {/* Header Section */}
        <div className="p-4 space-y-4">
          {/* Balance and Deposit Button */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 min-w-0">
              <div className="text-white font-medium text-sm">
                <div>Ana: ₺{balanceData?.loading ? '...' : (balanceData?.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                {(balanceData?.bonus_balance || 0) > 0 && (
                  <div className="text-green-400 text-xs">
                    Bonus: ₺{(balanceData?.bonus_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleDepositClick}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg flex-1"
            >
              PARA YATIR
            </Button>
          </div>

          {/* User Name */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-3 text-center">
            <span className="text-black font-bold text-lg">{getUserDisplayName()}</span>
          </div>

          {/* Loss Bonus Section */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 rounded-lg px-4 py-3 flex-1">
              <span className="text-white font-medium">KAYIP BONUSU</span>
              {lossBonusData?.isEligible && (
                <div className="text-green-400 text-sm">
                  ₺{lossBonusData.bonusAmount} hakkınız var
                </div>
              )}
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-3 rounded-lg disabled:opacity-50"
              onClick={handleLossBonusClick}
              disabled={!lossBonusData?.isEligible || isClaimingLossBonus}
            >
              {isClaimingLossBonus ? 'ALIYOR...' : 'KAYIP BONUSU AL'}
            </Button>
          </div>
        </div>

        <Separator className="bg-slate-600" />

        {/* Menu Items */}
        <div className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4 text-white/70" />
                  <span className="text-white font-medium text-sm">{item.label}</span>
                </div>
                <span className={`text-sm font-medium ${item.color}`}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <Separator className="bg-slate-600" />

        {/* Bottom Actions */}
        <div className="p-4 space-y-3">
          {/* Admin Management Button - Only show for super admins */}
          {isSuperAdmin && !adminLoading && (
            <Button 
              onClick={handleAdminManagementClick}
              variant="outline" 
              className="w-full bg-blue-500/20 border-blue-500/30 text-blue-100 hover:bg-blue-500/30 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" />
              ADMİN YÖNETİMİ
            </Button>
          )}
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAccountClick}
              variant="outline" 
              className="flex-1 bg-amber-500/20 border-amber-500/30 text-amber-100 hover:bg-amber-500/30 font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              HESABIM
            </Button>
            
            {/* Admin Panel Button - Only show for super admins */}
            {isSuperAdmin && !adminLoading && (
              <Button 
                onClick={handleAdminPanelClick}
                variant="outline" 
                className="flex-1 bg-red-500/20 border-red-500/30 text-red-100 hover:bg-red-500/30 font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                ADMIN PANEL
              </Button>
            )}
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className={`${isSuperAdmin ? 'flex-1' : 'flex-1'} bg-amber-500/20 border-amber-500/30 text-amber-100 hover:bg-amber-500/30 font-medium`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              ÇIKIŞ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;