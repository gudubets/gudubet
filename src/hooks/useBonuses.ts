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
        .lte("valid_from", now)
        .gte("valid_to", now)
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
      const { data, error } = await supabase.functions.invoke("claim-bonus", { body: params });
      if (error) throw error;
      return data as { ok: boolean; user_bonus_id: string; granted: number };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me","bonuses"] });
    }
  });
}