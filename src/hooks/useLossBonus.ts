import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LossBonusData {
  totalLoss: number;
  isEligible: boolean;
  bonusAmount: number;
  lastClaimDate: string | null;
}

export const useLossBonus = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch loss bonus eligibility and amount
  const { data: lossBonusData, isLoading } = useQuery({
    queryKey: ['loss-bonus', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.functions.invoke('calculate-loss-bonus', {
        body: { userId }
      });

      if (error) {
        console.error('Error calculating loss bonus:', error);
        throw error;
      }

      return data as LossBonusData;
    },
    enabled: !!userId
  });

  // Claim loss bonus mutation
  const claimLossBonusMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase.functions.invoke('claim-loss-bonus', {
        body: { userId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Kayıp Bonusu Alındı!",
          description: `₺${data.bonusAmount} hesabınıza eklendi.`
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['loss-bonus'] });
        queryClient.invalidateQueries({ queryKey: ['user-balance'] });
      }
    },
    onError: (error: any) => {
      if (error.message?.includes('profit')) {
        toast({
          title: "Kayıp Bonusu Alınamaz",
          description: "Kazanç durumunda olduğunuzdan dolayı kayıp bonusu alamazsınız.",
          variant: "destructive"
        });
      } else if (error.message?.includes('welcome_bonus_received')) {
        toast({
          title: "Kayıp Bonusu Alınamaz",
          description: "Hoşgeldin bonusu aldığınız için kayıp bonusu alamıyorsunuz.",
          variant: "destructive"
        });
      } else if (error.message?.includes('already_claimed')) {
        toast({
          title: "Kayıp Bonusu Alınamaz", 
          description: "Bu dönem için kayıp bonusunuzu zaten aldınız.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Hata",
          description: "Kayıp bonusu alınırken bir hata oluştu.",
          variant: "destructive"
        });
      }
    }
  });

  return {
    lossBonusData,
    isLoading,
    claimLossBonus: claimLossBonusMutation.mutate,
    isClaimingLossBonus: claimLossBonusMutation.isPending
  };
};