import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  bank_account_id: string;
  user_account_name: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  reviewer_id?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export function useMyDeposits() {
  return useQuery({
    queryKey: ['me', 'deposits'],
    queryFn: async (): Promise<Deposit[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('deposits')
        .select(`
          *,
          bank_accounts(bank_name, account_holder_name, iban)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Deposits error:', error);
        return [];
      }
      return data as any[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}