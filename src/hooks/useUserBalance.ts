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

        // Get balance from wallets table instead of users table
        const { data: walletsData, error } = await supabase
          .from('wallets')
          .select('balance, type')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching balance:', error);
          setBalanceData(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
          return;
        }

        let mainBalance = 0;
        let bonusBalance = 0;

        walletsData?.forEach(wallet => {
          if (wallet.type === 'main') {
            mainBalance = wallet.balance || 0;
          } else if (wallet.type === 'bonus') {
            bonusBalance = wallet.balance || 0;
          }
        });

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

    // Real-time subscription for wallet updates
    const channel = supabase
      .channel('user_wallet_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Wallet updated:', payload);
          // Refresh balance when wallet changes
          fetchUserBalance();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `wallet_id=eq.${user.id}` // This should match the wallet's actual ID
        },
        (payload) => {
          console.log('Wallet transaction updated:', payload);
          // Refresh balance when new transaction occurs
          fetchUserBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return balanceData;
};