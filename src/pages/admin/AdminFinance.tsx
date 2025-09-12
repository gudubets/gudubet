import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DollarSign, TrendingUp, TrendingDown, Clock, Shield, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { logAdminActivity, ACTIVITY_TYPES } from '@/utils/adminActivityLogger';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: string;
  payment_method?: string;
  payment_provider?: string;
  created_at: string;
  processed_at?: string;
  description?: string;
  account_details?: any;
  users?: {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

interface DashboardStats {
  dailyDeposits: number;
  dailyWithdrawals: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const AdminFinance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const queryClient = useQueryClient();

  // Always call all hooks first - before any conditional returns
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions', searchTerm, typeFilter, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      // Fetch payments (deposits) - join with profiles
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          id,
          user_id,
          amount,
          status,
          payment_method,
          created_at,
          processed_at
        `)
        .order('created_at', { ascending: false });

      // Fetch withdrawals - join with profiles  
      let withdrawalsQuery = supabase
        .from('withdrawals')
        .select(`
          id,
          user_id,
          amount,
          status,
          method,
          payout_details,
          created_at,
          processed_at
        `)
        .order('created_at', { ascending: false });

      // Apply search filter later after joining with profiles
      
      if (statusFilter) {
        paymentsQuery = paymentsQuery.eq('status', statusFilter);
        withdrawalsQuery = withdrawalsQuery.eq('status', statusFilter);
      }
      
      if (dateFrom) {
        paymentsQuery = paymentsQuery.gte('created_at', dateFrom.toISOString());
        withdrawalsQuery = withdrawalsQuery.gte('created_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        paymentsQuery = paymentsQuery.lte('created_at', dateTo.toISOString());
        withdrawalsQuery = withdrawalsQuery.lte('created_at', dateTo.toISOString());
      }

      // Execute queries
      const [paymentsResult, withdrawalsResult] = await Promise.all([
        paymentsQuery,
        withdrawalsQuery
      ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (withdrawalsResult.error) throw withdrawalsResult.error;

      // Get unique user IDs from both datasets
      const paymentsUserIds = (paymentsResult.data || []).map((p: any) => p.user_id);
      const withdrawalsUserIds = (withdrawalsResult.data || []).map((w: any) => w.user_id);
      const allUserIds = [...new Set([...paymentsUserIds, ...withdrawalsUserIds])];

      // Fetch user profiles for all transactions
      let profilesData: any[] = [];
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select(`
            id,
            user_id,
            first_name,
            last_name,
            email
          `)
          .in('id', allUserIds);
        profilesData = profiles || [];
      }

      // Create a map for quick lookup
      const profilesMap = profilesData.reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Transform and combine data
      const payments: Transaction[] = (paymentsResult.data || []).map((payment: any) => {
        const userProfile = profilesMap[payment.user_id];
        return {
          id: payment.id,
          user_id: payment.user_id,
          type: 'deposit' as const,
          amount: payment.amount,
          status: payment.status,
          payment_method: payment.payment_method,
          created_at: payment.created_at,
          processed_at: payment.processed_at,
          profiles: userProfile ? {
            id: userProfile.id,
            username: userProfile.email?.split('@')[0] || 'Unknown',
            email: userProfile.email || '',
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || ''
          } : null
        };
      });

      const withdrawals: Transaction[] = (withdrawalsResult.data || []).map((withdrawal: any) => {
        const userProfile = profilesMap[withdrawal.user_id];
        return {
          id: withdrawal.id,
          user_id: withdrawal.user_id,
          type: 'withdraw' as const,
          amount: withdrawal.amount,
          status: withdrawal.status,
          payment_method: withdrawal.method,
          account_details: withdrawal.payout_details,
          created_at: withdrawal.created_at,
          processed_at: withdrawal.processed_at,
          profiles: userProfile ? {
            id: userProfile.id,
            username: userProfile.email?.split('@')[0] || 'Unknown',
            email: userProfile.email || '',
            first_name: userProfile.first_name || '',
            last_name: userProfile.last_name || ''
          } : null
        };
      });

      // Combine and sort by date
      const allTransactions = [...payments, ...withdrawals];
      
      // Apply search filter on combined data
      let filteredTransactions = allTransactions;
      
      if (searchTerm) {
        filteredTransactions = allTransactions.filter((t: Transaction) => {
          const user = t.users;
          if (!user) return false;
          const searchLower = searchTerm.toLowerCase();
          return (
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower)
          );
        });
      }
      
      // Apply type filter if specified
      if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
      }

      return filteredTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: isSuperAdmin && !isCheckingAccess,
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-finance-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get daily payments (deposits)
      const { data: dailyPayments } = await supabase
        .from('payments')
        .select('amount, status')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Get daily withdrawals
      const { data: dailyWithdrawals } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Get all payments status counts
      const { data: paymentsStatusCounts } = await supabase
        .from('payments')
        .select('status');

      // Get all withdrawals status counts
      const { data: withdrawalsStatusCounts } = await supabase
        .from('withdrawals')
        .select('status');

      const dailyDepositsSum = dailyPayments
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const dailyWithdrawalsSum = dailyWithdrawals
        ?.filter(t => t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Count pending, approved, and rejected across both tables
      const paymentsPending = paymentsStatusCounts?.filter(t => t.status === 'pending').length || 0;
      const withdrawalsPending = withdrawalsStatusCounts?.filter(t => t.status === 'pending').length || 0;
      
      const paymentsApproved = paymentsStatusCounts?.filter(t => t.status === 'completed').length || 0;
      const withdrawalsApproved = withdrawalsStatusCounts?.filter(t => t.status === 'approved').length || 0;
      
      const paymentsRejected = paymentsStatusCounts?.filter(t => t.status === 'failed').length || 0;
      const withdrawalsRejected = withdrawalsStatusCounts?.filter(t => t.status === 'rejected').length || 0;

      return {
        dailyDeposits: dailyDepositsSum,
        dailyWithdrawals: dailyWithdrawalsSum,
        pendingCount: paymentsPending + withdrawalsPending,
        approvedCount: paymentsApproved + withdrawalsApproved,
        rejectedCount: paymentsRejected + withdrawalsRejected,
      } as DashboardStats;
    },
    enabled: isSuperAdmin && !isCheckingAccess,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, type }: { id: string; status: string; type: 'deposit' | 'withdraw' }) => {
      let error;
      
      if (type === 'deposit') {
        const updateResult = await supabase
          .from('payments')
          .update({ 
            status: status === 'approved' ? 'completed' : status === 'rejected' ? 'failed' : status,
            processed_at: new Date().toISOString() 
          })
          .eq('id', id);
        error = updateResult.error;
      } else {
        const updateResult = await supabase
          .from('withdrawals')
          .update({ 
            status: status === 'completed' ? 'approved' : status,
            processed_at: status === 'approved' ? new Date().toISOString() : null,
            approved_at: status === 'approved' ? new Date().toISOString() : null
          })
          .eq('id', id);
        error = updateResult.error;
      }
      
      if (error) throw error;
      return { id, status, type };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance-stats'] });
      
      // Log admin activity
      await logAdminActivity({
        action_type: data.status === 'approved' ? ACTIVITY_TYPES.TRANSACTION_APPROVED : ACTIVITY_TYPES.TRANSACTION_REJECTED,
        description: `İşlem ${data.status === 'approved' ? 'onaylandı' : 'reddedildi'}`,
        target_id: data.id,
        target_type: 'transaction',
        metadata: { new_status: data.status }
      });
      
      toast({
        title: "İşlem Güncellendi",
        description: "İşlem durumu başarıyla güncellendi.",
      });
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast({
        title: "Hata",
        description: "İşlem güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Check access after hooks are defined
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('admins')
            .select('role_type')
            .eq('id', session.user.id)
            .single();
          
          setIsSuperAdmin(data?.role_type === 'super_admin');
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };
    
    checkSuperAdmin();
  }, []);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Beklemede</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Reddedildi</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Tamamlandı</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          Yatırım
        </Badge>;
      case 'withdraw':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <TrendingDown className="w-3 h-3 mr-1" />
          Çekim
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Yetki kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-600">Erişim Reddedildi</h2>
          <p className="text-muted-foreground">
            Bu sayfaya erişim için Süper Admin yetkisi gereklidir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold gradient-text-primary">Finans Yönetimi</h1>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Yatırımlar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{stats?.dailyDeposits?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Çekimler</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₺{stats?.dailyWithdrawals?.toLocaleString() || '0'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen İşlemler</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingCount || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan İşlemler</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.approvedCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                  Temizle
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="İşlem Türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Yatırım</SelectItem>
                  <SelectItem value="withdraw">Çekim</SelectItem>
                </SelectContent>
              </Select>
              {typeFilter && (
                <Button variant="outline" size="sm" onClick={() => setTypeFilter('')}>
                  Temizle
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
              {statusFilter && (
                <Button variant="outline" size="sm" onClick={() => setStatusFilter('')}>
                  Temizle
                </Button>
              )}
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: tr }) : "Başlangıç"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: tr }) : "Bitiş"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Hiç işlem bulunamadı
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Ödeme Yöntemi</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                     <TableCell>
                       <div>
                         <div className="font-medium">
                            {transaction.users?.first_name && transaction.users?.last_name 
                              ? `${transaction.users.first_name} ${transaction.users.last_name}`
                              : transaction.users?.username || 'Bilinmiyor'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.users?.email}
                          </div>
                         {transaction.account_details && (
                           <div className="text-xs text-muted-foreground mt-1">
                             {transaction.type === 'withdraw' && transaction.account_details.iban && 
                               `IBAN: ${transaction.account_details.iban}`
                             }
                             {transaction.type === 'withdraw' && transaction.account_details.papara_number && 
                               `Papara: ${transaction.account_details.papara_number}`
                             }
                             {transaction.type === 'withdraw' && transaction.account_details.wallet_address && 
                               `Wallet: ${transaction.account_details.wallet_address.slice(0, 10)}...`
                             }
                           </div>
                         )}
                       </div>
                     </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className="font-medium">
                      ₺{Number(transaction.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{transaction.payment_method || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(transaction.created_at), "dd.MM.yyyy HH:mm", { locale: tr })}
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateStatusMutation.mutate({ 
                              id: transaction.id, 
                              status: 'approved',
                              type: transaction.type
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatusMutation.mutate({ 
                              id: transaction.id, 
                              status: 'rejected',
                              type: transaction.type
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Reddet
                          </Button>
                        </div>
                      )}
                      {transaction.status === 'approved' && transaction.type === 'withdraw' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => updateStatusMutation.mutate({ 
                            id: transaction.id, 
                            status: 'completed',
                            type: transaction.type
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Tamamla
                        </Button>
                      )}
                      {(transaction.status === 'completed' || transaction.status === 'rejected' || 
                        (transaction.type === 'deposit' && transaction.status === 'failed')) && (
                        <span className="text-sm text-muted-foreground">İşlem tamamlandı</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;