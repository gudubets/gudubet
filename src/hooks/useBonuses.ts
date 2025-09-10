import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Bonus, UserBonus, BonusFormData, BonusClaimRequest } from '@/lib/types/bonus';
import { useToast } from '@/hooks/use-toast';

// Admin Bonus Management
export const useBonuses = () => {
  return useQuery({
    queryKey: ['bonuses'],
    queryFn: async (): Promise<Bonus[]> => {
      const { data, error } = await supabase
        .from('bonuses_new')
        .select(`
          *,
          bonus_rules(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Bonus[];
    }
  });
};

export const useCreateBonus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bonusData: BonusFormData) => {
      const { rules, ...bonus } = bonusData;

      // Create bonus
      const { data: newBonus, error: bonusError } = await supabase
        .from('bonuses_new')
        .insert(bonus)
        .select()
        .single();

      if (bonusError) throw bonusError;

      // Create bonus rules if provided
      if (rules && newBonus) {
        const { error: rulesError } = await supabase
          .from('bonus_rules')
          .insert({
            bonus_id: newBonus.id,
            rules: rules
          });

        if (rulesError) throw rulesError;
      }

      return newBonus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      toast({
        title: "Başarılı",
        description: "Bonus başarıyla oluşturuldu"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Bonus oluşturulamadı: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateBonus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BonusFormData> }) => {
      const { rules, ...bonus } = data;

      // Update bonus
      const { data: updatedBonus, error: bonusError } = await supabase
        .from('bonuses_new')
        .update(bonus)
        .eq('id', id)
        .select()
        .single();

      if (bonusError) throw bonusError;

      // Update bonus rules if provided
      if (rules) {
        const { error: rulesError } = await supabase
          .from('bonus_rules')
          .upsert({
            bonus_id: id,
            rules: rules
          }, {
            onConflict: 'bonus_id'
          });

        if (rulesError) throw rulesError;
      }

      return updatedBonus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      toast({
        title: "Başarılı",
        description: "Bonus başarıyla güncellendi"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Bonus güncellenemedi: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteBonus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bonuses_new')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      toast({
        title: "Başarılı",
        description: "Bonus başarıyla silindi"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Bonus silinemedi: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

// User Bonus Management
export const useUserBonuses = (userId?: string) => {
  return useQuery({
    queryKey: ['userBonuses', userId],
    queryFn: async (): Promise<UserBonus[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          *,
          bonuses_new(
            *,
            bonus_rules(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserBonus[];
    },
    enabled: !!userId
  });
};

export const useAvailableBonuses = () => {
  return useQuery({
    queryKey: ['availableBonuses'],
    queryFn: async (): Promise<Bonus[]> => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('bonuses_new')
        .select(`
          *,
          bonus_rules(*)
        `)
        .eq('is_active', true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_to.is.null,valid_to.gte.${now}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Bonus[];
    }
  });
};

export const useClaimBonus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (claimData: BonusClaimRequest) => {
      const { data, error } = await supabase.functions.invoke('claim-bonus', {
        body: claimData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBonuses'] });
      queryClient.invalidateQueries({ queryKey: ['bonusWallets'] });
      toast({
        title: "Başarılı",
        description: "Bonus başarıyla alındı"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Bonus alınamadı: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};

// Bonus Progress
export const useBonusProgress = (userBonusId: string) => {
  return useQuery({
    queryKey: ['bonusProgress', userBonusId],
    queryFn: async () => {
      const { data: userBonus, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          *,
          bonuses_new(
            *,
            bonus_rules(*)
          )
        `)
        .eq('id', userBonusId)
        .single();

      if (error) throw error;

      // Get recent events
      const { data: events } = await supabase
        .from('bonus_events')
        .select('*')
        .eq('user_bonus_id', userBonusId)
        .order('occurred_at', { ascending: false })
        .limit(10);

      const progressPercentage = userBonus.remaining_rollover > 0 
        ? ((userBonus.progress / (userBonus.progress + userBonus.remaining_rollover)) * 100)
        : 100;

      return {
        ...userBonus,
        progress_percentage: progressPercentage,
        recent_events: events || []
      };
    },
    enabled: !!userBonusId
  });
};

// Bonus Wallets
export const useBonusWallets = (userId?: string) => {
  return useQuery({
    queryKey: ['bonusWallets', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('bonus_wallets')
        .select('*')
        .eq('user_id', userId)
        .order('type', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};

// Wallet Transactions
export const useWalletTransactions = (walletId?: string) => {
  return useQuery({
    queryKey: ['walletTransactions', walletId],
    queryFn: async () => {
      if (!walletId) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('occurred_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!walletId
  });
};

// Bonus Events
export const useBonusEvents = (userId?: string, userBonusId?: string) => {
  return useQuery({
    queryKey: ['bonusEvents', userId, userBonusId],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('bonus_events')
        .select('*')
        .eq('user_id', userId);
      
      if (userBonusId) {
        query = query.eq('user_bonus_id', userBonusId);
      }
      
      const { data, error } = await query
        .order('occurred_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};