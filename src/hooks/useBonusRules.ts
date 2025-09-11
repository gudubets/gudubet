import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BonusRulesData {
  id: string;
  bonus_id: string;
  rules: any;
  created_at: string;
  updated_at: string;
}

export function useBonusRules(bonusId: string) {
  return useQuery({
    queryKey: ['bonus_rules', bonusId],
    queryFn: async (): Promise<BonusRulesData | null> => {
      const { data, error } = await supabase
        .from('bonus_rules')
        .select('*')
        .eq('bonus_id', bonusId)
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!bonusId
  });
}

export function useUpsertBonusRules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { bonus_id: string; rules: any }): Promise<BonusRulesData> => {
      const { data, error } = await supabase
        .from('bonus_rules')
        .upsert(payload, { onConflict: 'bonus_id' })
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bonus_rules', variables.bonus_id] });
      queryClient.invalidateQueries({ queryKey: ['bonus_rules'] });
    }
  });
}

export function useDeleteBonusRules() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bonusId: string): Promise<void> => {
      const { error } = await supabase
        .from('bonus_rules')
        .delete()
        .eq('bonus_id', bonusId);
        
      if (error) throw error;
    },
    onSuccess: (_, bonusId) => {
      queryClient.invalidateQueries({ queryKey: ['bonus_rules', bonusId] });
      queryClient.invalidateQueries({ queryKey: ['bonus_rules'] });
    }
  });
}