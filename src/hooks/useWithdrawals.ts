import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Withdrawal, WithdrawalMethod } from '../lib/types.withdrawals';

export function useMyWithdrawals() {
  return useQuery({
    queryKey: ['me','withdrawals'],
    queryFn: async (): Promise<Withdrawal[]> => {
      const { data, error } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Withdrawal[];
    }
  });
}

export function useCreateWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { 
      amount: number; 
      method: WithdrawalMethod; 
      currency?: string; 
      payout_details?: any;
      iban?: string; 
      papara_id?: string; 
      phone?: string; 
      asset?: string; 
      network?: string; 
      address?: string; 
      tag?: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('withdraw-request', { body: payload });
      if (error) throw error;
      return data as { success: boolean; withdrawal_id: string };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me','withdrawals'] }); }
  });
}

export function useAdminWithdrawals(status: Withdrawal['status'] = 'pending') {
  return useQuery({
    queryKey: ['admin','withdrawals', status],
    queryFn: async (): Promise<Withdrawal[]> => {
      const { data, error } = await supabase.from('withdrawals').select('*').eq('status', status).order('created_at', { ascending: true });
      if (error) throw error;
      return data as Withdrawal[];
    },
    refetchInterval: 15000,
  });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { withdrawal_id: string; note?: string }) => {
      const { data, error } = await supabase.functions.invoke('withdraw-approve', { body: { action: 'approve', ...payload } });
      if (error) throw error;
      return data as { ok: boolean; status: string };
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin','withdrawals'] }); 
      qc.invalidateQueries({ queryKey: ['user-balance'] });
    }
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { withdrawal_id: string; note?: string }) => {
      const { data, error } = await supabase.functions.invoke('withdraw-approve', { body: { action: 'reject', ...payload } });
      if (error) throw error;
      return data as { ok: boolean; status: string };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','withdrawals'] }); }
  });
}

export function useMarkPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { withdrawal_id: string; provider_ref?: string; tx_hash?: string; note?: string }) => {
      const { data, error } = await supabase.functions.invoke('withdraw-approve', { body: { action: 'paid', ...payload } });
      if (error) throw error;
      return data as { ok: boolean; status: string };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','withdrawals'] }); }
  });
}