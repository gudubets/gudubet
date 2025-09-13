import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Bonus, UserBonus } from "@/lib/types/bonus";

export function useAdminBonuses() {
  return useQuery({
    queryKey: ["admin","bonuses"],
    queryFn: async (): Promise<Bonus[]> => {
      const { data, error } = await supabase
        .from("bonuses_new")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bonus[];
    }
  });
}

// Alias for compatibility
export const useBonuses = useAdminBonuses;

export function useCreateBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any): Promise<Bonus> => {
      const { data, error } = await supabase.from("bonuses_new").insert(payload).select("*").single();
      if (error) throw error;
      return data as Bonus;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin","bonuses"] }); }
  });
}

export function useUpdateBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: any): Promise<Bonus> => {
      const { data, error } = await supabase.from("bonuses_new").update(patch).eq("id", id).select("*").single();
      if (error) throw error;
      return data as Bonus;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin","bonuses"] }); }
  });
}

export function useDeleteBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("bonuses_new").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin","bonuses"] }); }
  });
}

export function useMyBonuses(status?: UserBonus["status"]) {
  return useQuery({
    queryKey: ["me","bonuses", status],
    queryFn: async (): Promise<UserBonus[]> => {
      let q = supabase.from("user_bonus_tracking").select("*").order("created_at", { ascending: false });
      if (status) q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return data as UserBonus[];
    }
  });
}

// Aliases for compatibility
export const useUserBonuses = (userId?: string) => useMyBonuses();
export const useAvailableBonuses = () => {
  return useQuery({
    queryKey: ["bonuses", "available"],
    queryFn: async (): Promise<Bonus[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("bonuses_new")
        .select("*")
        .eq("is_active", true)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_to.is.null,valid_to.gte.${now}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bonus[];
    }
  });
};

export const useBonusProgress = (userBonusId: string) => {
  return useQuery({
    queryKey: ["bonus-progress", userBonusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bonus_tracking")
        .select("*")
        .eq("id", userBonusId)
        .single();
      if (error) throw error;
      return {
        ...data,
        progress_percentage: data.remaining_rollover > 0 
          ? (data.progress / (data.progress + data.remaining_rollover)) * 100 
          : 100,
        recent_events: []
      };
    },
    enabled: !!userBonusId
  });
};

export const useBonusEvents = (userId?: string, userBonusId?: string) => {
  return useQuery({
    queryKey: ["bonus-events", userId, userBonusId],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from("bonus_events")
        .select("*")
        .eq("user_id", userId);
      
      if (userBonusId) {
        query = query.eq("user_bonus_id", userBonusId);
      }
      
      const { data, error } = await query
        .order("occurred_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};

export function useClaimBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bonus_id: string; deposit_amount?: number; code?: string }) => {
      console.log('🚀 useClaimBonus başlatılıyor:', params);
      
      // Kullanıcı ID'sini al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Kullanıcı doğrulanamadı:', userError);
        throw new Error('Kullanıcı doğrulanamadı');
      }
      console.log('✅ Kullanıcı doğrulandı:', user.id);

      // profiles tablosundan user bilgisini al (users yerine profiles kullan)
      const { data: userData, error: userDataError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id) // auth user id ile profile id aynı
        .single();
        
      if (userDataError || !userData) {
        console.error('❌ Kullanıcı profili bulunamadı:', userDataError);
        throw new Error('Kullanıcı profili bulunamadı');
      }
      console.log('✅ Kullanıcı profili bulundu:', userData.id);

      // Bonus talebi oluştur
      const bonusTypeMapping: Record<string, string> = {
        'FIRST_DEPOSIT': 'welcome',
        'RELOAD': 'deposit', 
        'CASHBACK': 'cashback',
        'FREEBET': 'freebet'
      };

      // Bonus bilgilerini al
      const { data: bonus, error: bonusError } = await supabase
        .from('bonuses_new')
        .select('type')
        .eq('id', params.bonus_id)
        .single();
      
      if (bonusError) {
        console.error('❌ Bonus bilgisi alınamadı:', bonusError);
        throw bonusError;
      }
      console.log('✅ Bonus bilgisi alındı:', bonus);

      const bonusType = bonusTypeMapping[bonus.type] || 'deposit';

      // Bonus talebi oluştur
      const requestData = {
        user_id: userData.id, // profiles tablosundan alınan ID
        bonus_type: bonusType as any,
        requested_amount: params.deposit_amount,
        deposit_amount: params.deposit_amount,
        metadata: {
          bonus_id: params.bonus_id,
          code: params.code
        }
      };

      console.log('📝 Bonus talebi oluşturuluyor:', requestData);

      const { data, error } = await supabase
        .from('bonus_requests')
        .insert(requestData)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Bonus talebi oluşturulamadı:', error);
        throw error;
      }
      
      console.log('✅ Bonus talebi oluşturuldu:', data);
      return { ok: true, request_id: data.id, status: 'pending' };
    },
    onSuccess: (data) => {
      console.log('🎉 Bonus talebi başarılı:', data);
      qc.invalidateQueries({ queryKey: ["me","bonuses"] });
      qc.invalidateQueries({ queryKey: ["my_bonus_requests"] });
      qc.invalidateQueries({ queryKey: ["admin_bonus_requests"] });
    },
    onError: (error) => {
      console.error('💥 Bonus talebi hatası:', error);
    }
  });
}