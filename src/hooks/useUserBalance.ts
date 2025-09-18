import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserBalance {
  balance: number;
  bonus_balance: number;
  total_balance: number;
  loading: boolean;
  error: string | null;
}

export const useUserBalance = (user: User | null) => {
  const [balanceData, setBalanceData] = useState<UserBalance>({
    balance: 0,
    bonus_balance: 0,
    total_balance: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setBalanceData({
        balance: 0,
        bonus_balance: 0,
        total_balance: 0,
        loading: false,
        error: null
      });
      return;
    }

    const fetchUserBalance = async () => {
      try {
        setBalanceData(prev => ({ ...prev, loading: true, error: null }));

        // Get balance from profiles table which now contains balance data
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('balance, bonus_balance')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching balance:', error);
          setBalanceData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
          return;
        }

        if (!profileData) {
          // No profile found, set zero balances
          setBalanceData({
            balance: 0,
            bonus_balance: 0,
            total_balance: 0,
            loading: false,
            error: null
          });
          return;
        }

        const mainBalance = profileData?.balance || 0;
        const bonusBalance = profileData?.bonus_balance || 0;

        setBalanceData({
          balance: mainBalance,
          bonus_balance: bonusBalance,
          total_balance: mainBalance + bonusBalance,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error in fetchUserBalance:', error);
        setBalanceData(prev => ({
          ...prev,
          loading: false,
          error: 'Bakiye bilgisi alınamadı'
        }));
      }
    };

    fetchUserBalance();

    // Real-time subscription for profile balance updates
    const channel = supabase
      .channel('user_profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile balance updated:', payload);
          // Refresh balance when profile balance changes
          fetchUserBalance();
        }
      )
      .on(
        'broadcast',
        { event: 'balance_updated' },
        (payload) => {
          console.log('Balance broadcast received:', payload);
          if (payload.payload.user_id === user.id) {
            // Update balance immediately from broadcast
            setBalanceData(prev => ({
              ...prev,
              balance: payload.payload.new_balance,
              total_balance: payload.payload.new_balance + prev.bonus_balance,
              loading: false,
              error: null
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return balanceData;
};