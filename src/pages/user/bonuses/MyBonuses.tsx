import React, { useState } from 'react';
import { useAvailableBonuses, useUserBonuses, useClaimBonus } from '@/hooks/useBonuses';
import { BONUS_TYPE_LABELS, BONUS_STATUS_LABELS, type BonusClaimRequest } from '@/lib/types/bonus';
import { supabase } from '@/lib/supabase';

export default function MyBonuses() {
  const [user, setUser] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [bonusCode, setBonusCode] = useState<string>('');
  const [claimingBonusId, setClaimingBonusId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const { data: availableBonuses, isLoading: loadingAvailable } = useAvailableBonuses();
  const { data: userBonuses, isLoading: loadingUser } = useUserBonuses(user?.id);
  const claimBonus = useClaimBonus();

  const handleClaimBonus = async (bonusId: string, requiresCode: boolean) => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Geçerli bir yatırım miktarı giriniz');
      return;
    }

    if (requiresCode && !bonusCode.trim()) {
      alert('Bonus kodu gereklidir');
      return;
    }

    setClaimingBonusId(bonusId);
    
    try {
      await claimBonus.mutateAsync({
        bonus_id: bonusId,
        deposit_amount: parseFloat(depositAmount),
        code: requiresCode ? bonusCode.trim() : undefined
      } as BonusClaimRequest);
      
      alert('Bonus başarıyla talep edildi!');
      setDepositAmount('');
      setBonusCode('');
    } catch (error) {
      alert('Bonus talebi başarısız: ' + (error as Error).message);
    } finally {
      setClaimingBonusId(null);
    }
  };

  const eligibleBonuses = availableBonuses?.filter(bonus => 
    !userBonuses?.some(ub => ub.bonus_id === bonus.id && ub.status === 'active')
  ) || [];

  const activeBonuses = userBonuses?.filter(ub => ub.status === 'active') || [];

  if (loadingAvailable || loadingUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-xl">Lütfen giriş yapın</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Benim Bonuslarım</h1>

      {/* Bonus Talep Etme Bölümü */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Bonus Talep Et</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Yatırım Miktarı (TL)
            </label>
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bonus Kodu (Opsiyonel)
            </label>
            <input
              type="text"
              value={bonusCode}
              onChange={(e) => setBonusCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="WELCOME100"
            />
          </div>
        </div>
      </div>

      {/* Mevcut Bonuslar */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-white">Mevcut Bonuslar</h2>
        
        {eligibleBonuses.length > 0 ? (
          <div className="grid gap-4">
            {eligibleBonuses.map((bonus) => (
              <div key={bonus.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{bonus.name}</h3>
                    <p className="text-gray-400">{BONUS_TYPE_LABELS[bonus.type]}</p>
                    {bonus.description && (
                      <p className="text-gray-300 mt-2">{bonus.description}</p>
                    )}
                  </div>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    Mevcut
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Miktar</div>
                    <div className="text-white font-medium">
                      {bonus.amount_type === 'percent' 
                        ? `%${bonus.amount_value}` 
                        : `${bonus.amount_value} TL`}
                      {bonus.max_cap && ` (Max: ${bonus.max_cap} TL)`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Min. Yatırım</div>
                    <div className="text-white font-medium">{bonus.min_deposit || 0} TL</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Rollover</div>
                    <div className="text-white font-medium">{bonus.rollover_multiplier}x</div>
                  </div>
                  {bonus.requires_code && (
                    <div>
                      <div className="text-sm text-gray-400">Kod Gerekli</div>
                      <div className="text-yellow-400 font-medium">Evet</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleClaimBonus(bonus.id, bonus.requires_code)}
                  disabled={claimingBonusId === bonus.id || !depositAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >
                  {claimingBonusId === bonus.id ? 'Talep Ediliyor...' : 'Bonus Talep Et'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            Şu anda mevcut bonus yok
          </div>
        )}
      </div>

      {/* Aktif Bonuslar */}
      {activeBonuses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Aktif Bonuslarım</h2>
          
          <div className="grid gap-4">
            {activeBonuses.map((userBonus) => {
              const bonus = userBonus.bonuses_new;
              if (!bonus) return null;

              const progressPercent = userBonus.remaining_rollover > 0 
                ? (userBonus.progress / (userBonus.progress + userBonus.remaining_rollover)) * 100
                : 100;

              return (
                <div key={userBonus.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{bonus.name}</h3>
                      <p className="text-gray-400">{BONUS_TYPE_LABELS[bonus.type]}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {BONUS_STATUS_LABELS[userBonus.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Verilen Miktar</div>
                      <div className="text-white font-medium">{userBonus.granted_amount} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Kalan Rollover</div>
                      <div className="text-white font-medium">{userBonus.remaining_rollover.toFixed(2)} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">İlerleme</div>
                      <div className="text-white font-medium">{userBonus.progress.toFixed(2)} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Tamamlanma</div>
                      <div className="text-white font-medium">{progressPercent.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}