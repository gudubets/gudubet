import { useState, useEffect } from 'react';
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
import { CalendarIcon, Check, X, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  description: string;
  users: {
    username: string;
    email: string;
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
  const queryClient = useQueryClient();

  // Check if current user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('admins')
          .select('role_type')
          .eq('id', session.user.id)
          .single();
        
        setIsSuperAdmin(data?.role_type === 'super_admin');
      }
    };
    
    checkSuperAdmin();
  }, []);

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

  // Fetch transactions with filters
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions', searchTerm, typeFilter, statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users:user_id (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`users.username.ilike.%${searchTerm}%,users.email.ilike.%${searchTerm}%`);
      }
      
      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      
      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
      
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['admin-finance-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's deposits and withdrawals
      const { data: dailyTransactions } = await supabase
        .from('transactions')
        .select('type, amount, status')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Get status counts
      const { data: statusCounts } = await supabase
        .from('transactions')
        .select('status');

      const dailyDeposits = dailyTransactions
        ?.filter(t => t.type === 'deposit' && t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const dailyWithdrawals = dailyTransactions
        ?.filter(t => t.type === 'withdraw' && t.status === 'approved')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const pendingCount = statusCounts?.filter(t => t.status === 'pending').length || 0;
      const approvedCount = statusCounts?.filter(t => t.status === 'approved').length || 0;
      const rejectedCount = statusCounts?.filter(t => t.status === 'rejected').length || 0;

      return {
        dailyDeposits,
        dailyWithdrawals,
        pendingCount,
        approvedCount,
        rejectedCount,
      } as DashboardStats;
    },
  });

  // Update transaction status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('transactions')
        .update({ status, processed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-finance-stats'] });
      toast({
        title: "İşlem güncellendi",
        description: "İşlem durumu başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İşlem durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Bekliyor</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Onaylı</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="text-green-600 border-green-200"><TrendingUp className="w-3 h-3 mr-1" />Para Yatırma</Badge>;
      case 'withdraw':
        return <Badge variant="outline" className="text-red-600 border-red-200"><TrendingDown className="w-3 h-3 mr-1" />Para Çekme</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold gradient-text-primary">Finans İşlemleri</h1>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Yatırma</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.dailyDeposits?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Çekim</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.dailyWithdrawals?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) || '₺0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.approvedCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.rejectedCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              placeholder="Kullanıcı adı veya e-posta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="İşlem türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="deposit">Para Yatırma</SelectItem>
                <SelectItem value="withdraw">Para Çekme</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="approved">Onaylı</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP") : "Başlangıç tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP") : "Bitiş tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İşlem ID</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Ödeme Yöntemi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      İşlem bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.users?.username}</div>
                          <div className="text-sm text-muted-foreground">{transaction.users?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(transaction.type)}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-bold",
                          transaction.type === 'deposit' ? "text-green-600" : "text-red-600"
                        )}>
                          {Number(transaction.amount).toLocaleString('tr-TR', { 
                            style: 'currency', 
                            currency: transaction.currency || 'TRY' 
                          })}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.payment_method || '-'}</TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(transaction.created_at), 'dd.MM.yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => updateStatusMutation.mutate({ id: transaction.id, status: 'approved' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateStatusMutation.mutate({ id: transaction.id, status: 'rejected' })}
                              disabled={updateStatusMutation.isPending}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Reddet
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;