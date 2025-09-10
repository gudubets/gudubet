import React, { useState } from 'react';
import { useUserBonuses, useBonusEvents } from '@/hooks/useBonuses';
import { BONUS_TYPE_LABELS, BONUS_STATUS_LABELS } from '@/lib/types/bonus';
import { supabase } from '@/lib/supabase';

export default function BonusProgress() {
  const [user, setUser] = useState<any>(null);
  const [selectedBonusId, setSelectedBonusId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const { data: userBonuses, isLoading } = useUserBonuses(user?.id);
  const { data: bonusEvents } = useBonusEvents(user?.id, selectedBonusId || undefined);

  const activeBonuses = userBonuses?.filter(ub => ub.status === 'active') || [];
  const completedBonuses = userBonuses?.filter(ub => ['completed', 'forfeited', 'expired'].includes(ub.status)) || [];

  if (isLoading) {
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

  const selectedBonus = userBonuses?.find(ub => ub.id === selectedBonusId);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Bonus İlerlemesi</h1>

      {/* Aktif Bonuslar */}
      {activeBonuses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Aktif Bonuslar</h2>
          
          <div className="grid gap-4">
            {activeBonuses.map((userBonus) => {
              const bonus = userBonus.bonuses_new;
              if (!bonus) return null;

              const progressPercent = userBonus.remaining_rollover > 0 
                ? (userBonus.progress / (userBonus.progress + userBonus.remaining_rollover)) * 100
                : 100;

              const isSelected = selectedBonusId === userBonus.id;

              return (
                <div key={userBonus.id} className={`bg-gray-800 rounded-lg p-6 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700'
                }`}
                onClick={() => setSelectedBonusId(isSelected ? null : userBonus.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{bonus.name}</h3>
                      <p className="text-gray-400">{BONUS_TYPE_LABELS[bonus.type]}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        Aktif
                      </span>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(userBonus.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Verilen</div>
                      <div className="text-white font-medium">{userBonus.granted_amount} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">İlerleme</div>
                      <div className="text-white font-medium">{userBonus.progress.toFixed(2)} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Kalan</div>
                      <div className="text-white font-medium">{userBonus.remaining_rollover.toFixed(2)} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Tamamlanma</div>
                      <div className="text-white font-medium">{progressPercent.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">İlerleme</span>
                      <span className="text-white">{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {userBonus.expires_at && (
                    <div className="mt-4 text-sm text-gray-400">
                      Bitiş tarihi: {new Date(userBonus.expires_at).toLocaleDateString('tr-TR')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seçili Bonus Detayları */}
      {selectedBonus && bonusEvents && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {selectedBonus.bonuses_new?.name} - Aktivite Geçmişi
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bonusEvents.length > 0 ? (
              bonusEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'bonus_granted' ? 'bg-green-500' :
                    event.type === 'wager_placed' ? 'bg-blue-500' :
                    event.type === 'bonus_completed' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-white text-sm">
                      {event.type === 'bonus_granted' && 'Bonus verildi'}
                      {event.type === 'wager_placed' && 'Bahis yapıldı'}
                      {event.type === 'bonus_completed' && 'Bonus tamamlandı'}
                      {event.type === 'bonus_progressed' && 'Bonus ilerletildi'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(event.occurred_at).toLocaleString('tr-TR')}
                    </div>
                    {event.payload && Object.keys(event.payload).length > 0 && (
                      <div className="text-gray-300 text-xs mt-1">
                        {JSON.stringify(event.payload, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Henüz aktivite yok
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tamamlanan Bonuslar */}
      {completedBonuses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">Geçmiş Bonuslar</h2>
          
          <div className="grid gap-4">
            {completedBonuses.map((userBonus) => {
              const bonus = userBonus.bonuses_new;
              if (!bonus) return null;

              return (
                <div key={userBonus.id} className="bg-gray-800 rounded-lg p-6 opacity-75">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{bonus.name}</h3>
                      <p className="text-gray-400">{BONUS_TYPE_LABELS[bonus.type]}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                        userBonus.status === 'completed' ? 'bg-green-100 text-green-800' :
                        userBonus.status === 'forfeited' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {BONUS_STATUS_LABELS[userBonus.status]}
                      </span>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(userBonus.updated_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Verilen Miktar</div>
                      <div className="text-white font-medium">{userBonus.granted_amount} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Tamamlanan İlerleme</div>
                      <div className="text-white font-medium">{userBonus.progress.toFixed(2)} TL</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Süre</div>
                      <div className="text-white font-medium">
                        {new Date(userBonus.created_at).toLocaleDateString('tr-TR')} - {new Date(userBonus.updated_at).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeBonuses.length === 0 && completedBonuses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-xl mb-4">Henüz bonus geçmişiniz yok</div>
          <div className="text-gray-500">İlk bonusunuzu almak için Benim Bonuslarım sayfasını ziyaret edin</div>
        </div>
      )}
    </div>
  );
}