import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Withdrawal {
  id: string;
  user_id: string;
  payment_method_id?: string;
  amount: number;
  currency: string;
  fee_amount: number;
  net_amount: number;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
  provider_reference?: string;
  provider_response?: any;
  risk_score: number;
  risk_flags: string[];
  requires_kyc: boolean;
  requires_manual_review: boolean;
  reviewer_id?: string;
  reviewed_at?: string;
  admin_note?: string;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  processed_at?: string;
  completed_at?: string;
  ip_address?: string;
  user_agent?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  payment_method?: {
    id: string;
    method_type: string;
    provider: string;
    account_info: any;
  };
  reviewer?: {
    id: string;
    email: string;
  };
}

interface WithdrawalStats {
  total_pending: number;
  total_pending_amount: number;
  total_approved_today: number;
  total_approved_amount_today: number;
  high_risk_count: number;
}

export const useWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WithdrawalStats>({
    total_pending: 0,
    total_pending_amount: 0,
    total_approved_today: 0,
    total_approved_amount_today: 0,
    high_risk_count: 0
  });
  const { toast } = useToast();

  const loadWithdrawals = async (filters?: any) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('withdrawals')
        .select(`
          *,
          users!inner(id, email, first_name, last_name, username),
          payment_methods(id, method_type, provider, account_info)
        `)
        .order('requested_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      const mappedData = (data as any[])?.map((item: any) => ({
        ...item,
        user: item.users,
        reviewer: item.reviewer
      })) || [];

      setWithdrawals(mappedData);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast({
        title: "Hata",
        description: "Para çekme işlemleri yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_withdrawal_stats', {
        date_filter: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setStats({
          total_pending: data[0].total_pending || 0,
          total_pending_amount: data[0].total_pending_amount || 0,
          total_approved_today: data[0].total_approved_today || 0,
          total_approved_amount_today: data[0].total_approved_amount_today || 0,
          high_risk_count: data[0].high_risk_count || 0
        });
      }
    } catch (error) {
      console.error('Error loading withdrawal stats:', error);
    }
  };

  const approveWithdrawal = async (withdrawalId: string, adminNote?: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'approved',
          reviewer_id: currentUser.user.id,
          reviewed_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          admin_note: adminNote || null
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Para çekme işlemi onaylandı.",
      });

      // Refresh data
      await loadWithdrawals();
      await loadStats();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "Hata",
        description: "Para çekme işlemi onaylanırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const rejectWithdrawal = async (withdrawalId: string, rejectionReason: string, adminNote?: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          reviewer_id: currentUser.user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          admin_note: adminNote || null
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Para çekme işlemi reddedildi.",
      });

      // Refresh data
      await loadWithdrawals();
      await loadStats();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: "Hata",
        description: "Para çekme işlemi reddedilirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const processWithdrawal = async (withdrawalId: string) => {
    try {
      // Call edge function to process withdrawal
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { withdrawal_id: withdrawalId }
      });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Para çekme işlemi başlatıldı.",
      });

      // Refresh data
      await loadWithdrawals();
      await loadStats();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Hata",
        description: "Para çekme işlemi başlatılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const bulkAction = async (withdrawalIds: string[], action: 'approve' | 'reject', params?: { rejectionReason?: string; adminNote?: string }) => {
    try {
      const promises = withdrawalIds.map(id => {
        if (action === 'approve') {
          return approveWithdrawal(id, params?.adminNote);
        } else {
          return rejectWithdrawal(id, params?.rejectionReason || 'Toplu reddetme', params?.adminNote);
        }
      });

      await Promise.all(promises);

      toast({
        title: "Başarılı",
        description: `${withdrawalIds.length} işlem ${action === 'approve' ? 'onaylandı' : 'reddedildi'}.`,
      });
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast({
        title: "Hata",
        description: "Toplu işlem sırasında bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadWithdrawals();
    loadStats();
  }, []);

  return {
    withdrawals,
    loading,
    stats,
    loadWithdrawals,
    loadStats,
    approveWithdrawal,
    rejectWithdrawal,
    processWithdrawal,
    bulkAction
  };
};