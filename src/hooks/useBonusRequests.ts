import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BonusRequest {
  id: string;
  user_id: string;
  bonus_type: 'birthday' | 'welcome' | 'cashback' | 'freebet' | 'vip_platinum' | 'deposit';
  status: 'pending' | 'approved' | 'rejected';
  requested_amount?: number;
  loss_amount?: number;
  deposit_amount?: number;
  admin_note?: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

// User hooks
export function useMyBonusRequests() {
  return useQuery({
    queryKey: ['my_bonus_requests'],
    queryFn: async (): Promise<BonusRequest[]> => {
      const { data, error } = await supabase
        .from('bonus_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useCreateBonusRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: Omit<BonusRequest, 'id' | 'status' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at'>): Promise<BonusRequest> => {
      const { data, error } = await supabase
        .from('bonus_requests')
        .insert(request)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my_bonus_requests'] });
    }
  });
}

// Admin hooks
export function useAdminBonusRequests(status?: 'pending' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: ['admin_bonus_requests', status],
    queryFn: async (): Promise<BonusRequest[]> => {
      let query = supabase
        .from('bonus_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useApproveBonusRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, admin_note }: { id: string; admin_note?: string }): Promise<void> => {
      const { error } = await supabase
        .from('bonus_requests')
        .update({
          status: 'approved',
          admin_note,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_bonus_requests'] });
    }
  });
}

export function useRejectBonusRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, rejection_reason, admin_note }: { id: string; rejection_reason: string; admin_note?: string }): Promise<void> => {
      const { error } = await supabase
        .from('bonus_requests')
        .update({
          status: 'rejected',
          rejection_reason,
          admin_note,
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_bonus_requests'] });
    }
  });
}

// Bonus eligibility checks
export function useBonusEligibility() {
  return {
    checkBirthdayEligibility: async (userId: string) => {
      const { data, error } = await supabase.rpc('can_request_birthday_bonus', { p_user_id: userId });
      if (error) throw error;
      return data;
    },
    
    checkWelcomeEligibility: async (userId: string) => {
      const { data, error } = await supabase.rpc('can_request_welcome_bonus', { p_user_id: userId });
      if (error) throw error;
      return data;
    },
    
    calculateUserLosses: async (userId: string, days: number = 30) => {
      const { data, error } = await supabase.rpc('calculate_user_losses', { p_user_id: userId, p_days: days });
      if (error) throw error;
      return data;
    }
  };
}

// VIP Level Management
export function useUpdateVIPLevel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, vipLevel }: { userId: string; vipLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' }): Promise<void> => {
      const { error } = await supabase
        .from('profiles')
        .update({ vip_level: vipLevel })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
    }
  });
}