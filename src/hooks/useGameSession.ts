import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameSessionResult {
  session_id: string;
  game_id: string;
  bet_amount: number;
  win_amount: number;
  rounds_played: number;
  session_duration?: number;
  result_data?: any;
}

export const useGameSession = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const processGameSession = async (gameResult: GameSessionResult) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-game-session', {
        body: gameResult
      });

      if (error) {
        console.error('Game session error:', error);
        toast({
          title: "Hata",
          description: "Oyun sonucu işlenirken hata oluştu.",
          variant: "destructive"
        });
        return { success: false, error: error.message };
      }

      if (data?.error) {
        toast({
          title: "Hata", 
          description: data.error,
          variant: "destructive"
        });
        return { success: false, error: data.error };
      }

      // Show win/loss message
      if (data?.message) {
        toast({
          title: data.net_result > 0 ? "Kazandınız!" : "Oyun Tamamlandı",
          description: data.message,
          variant: data.net_result > 0 ? "default" : "destructive"
        });
      }

      return { 
        success: true, 
        data: {
          new_balance: data?.new_balance,
          net_result: data?.net_result
        }
      };

    } catch (error: any) {
      console.error('Game session processing error:', error);
      toast({
        title: "Hata",
        description: "Sunucu hatası oluştu.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    processGameSession,
    loading
  };
};