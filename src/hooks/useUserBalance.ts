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

        const { data, error } = await supabase
          .from('users')
          .select('balance, bonus_balance')
          .eq('auth_user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching balance:', error);
          setBalanceData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
          return;
        }

        const balance = data?.balance || 0;
        const bonus_balance = data?.bonus_balance || 0;

        setBalanceData({
          balance,
          bonus_balance,
          total_balance: balance + bonus_balance,
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

    // Real-time subscription for balance updates
    const channel = supabase
      .channel('user_balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `auth_user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance updated:', payload);
        if (payload.new) {
            const balance = (payload.new as any).balance || 0;
            const bonus_balance = (payload.new as any).bonus_balance || 0;
            setBalanceData({
              balance,
              bonus_balance,
              total_balance: balance + bonus_balance,
              loading: false,
              error: null
            });
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