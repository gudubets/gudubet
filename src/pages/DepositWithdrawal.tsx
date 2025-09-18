import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpCircle, ArrowDownCircle, Wallet, CheckCircle, Clock, XCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMyDeposits } from '@/hooks/useDeposits';
import { useMyWithdrawals } from '@/hooks/useWithdrawals';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';

const DepositWithdrawal = () => {
  const [user, setUser] = useState<User | null>(null);

  // Get user balance data
  const balanceData = useUserBalance(user);
  
  // Get transaction data
  const depositsQuery = useMyDeposits();
  const withdrawalsQuery = useMyWithdrawals();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, text: "Bekliyor", icon: Clock },
      approved: { variant: "default" as const, text: "Onaylandı", icon: CheckCircle },
      rejected: { variant: "destructive" as const, text: "Reddedildi", icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  // Combine and sort all transactions
  const allTransactions = [
    ...(depositsQuery.data || []).map(deposit => ({
      id: deposit.id,
      type: 'deposit' as const,
      amount: deposit.amount,
      status: deposit.status,
      date: new Date(deposit.created_at).toLocaleDateString('tr-TR'),
      method: 'Banka Havalesi',
      created_at: deposit.created_at
    })),
    ...(withdrawalsQuery.data || []).map(withdrawal => ({
      id: withdrawal.id,
      type: 'withdrawal' as const,
      amount: withdrawal.amount,
      status: withdrawal.status,
      date: new Date(withdrawal.created_at).toLocaleDateString('tr-TR'),
      method: withdrawal.method === 'bank' ? 'Banka Havalesi' : 
              withdrawal.method === 'papara' ? 'Papara' : 'Kripto',
      created_at: withdrawal.created_at
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Para İşlemleri</h1>
          <p className="text-muted-foreground">Bakiye durumu ve işlem geçmişinizi görüntüleyin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Bakiye Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Toplam Bakiye</p>
                <p className="text-2xl font-bold">
                  {balanceData.loading ? '...' : `₺${balanceData.total_balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
              <div className="flex justify-between">
                <span>Gerçek Bakiye</span>
                <span className="font-semibold">
                  {balanceData.loading ? '...' : `₺${balanceData.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bonus Bakiye</span>
                <span className="font-semibold text-green-600">
                  {balanceData.loading ? '...' : `₺${balanceData.bonus_balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Henüz işlem bulunmuyor</p>
                  </div>
                ) : (
                  allTransactions.slice(0, 10).map(transaction => (
                    <div key={`${transaction.type}-${transaction.id}`} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowUpCircle className="w-4 h-4" />
                          ) : (
                            <ArrowDownCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {transaction.type === 'deposit' ? 'Para Yatırma' : 'Para Çekme'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.method} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}₺{transaction.amount.toLocaleString('tr-TR')}
                        </p>
                        <div className="flex items-center gap-1">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DepositWithdrawal;