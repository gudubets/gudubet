import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpCircle, ArrowDownCircle, CreditCard, Wallet, Clock, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { useToast } from '@/hooks/use-toast';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const DepositWithdrawal = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Get user balance data
  const balanceData = useUserBalance(user);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || !paymentMethod) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen miktar ve ödeme yöntemi seçiniz.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Hata",
        description: "Lütfen giriş yapınız.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Call deposit request Edge Function
      const { data, error } = await supabase.functions.invoke('deposit-request', {
        body: {
          amount: parseFloat(depositAmount),
          payment_method: paymentMethod,
          user_account_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim()
        }
      });

      if (error) {
        console.error('Deposit error:', error);
        toast({
          title: "Hata",
          description: error.message || "Para yatırma işlemi başarısız oldu.",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Hata",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "İşlem Başarılı",
        description: data?.message || `₺${depositAmount} yatırma işleminiz başlatıldı.`
      });
      
      setDepositAmount('');
      setPaymentMethod('');

    } catch (error) {
      console.error('Deposit request error:', error);
      toast({
        title: "Hata",
        description: "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 500, status: 'completed', date: '15 Aralık 2024', method: 'Kredi Kartı' },
    { id: 3, type: 'deposit', amount: 100, status: 'completed', date: '13 Aralık 2024', method: 'Papara' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Para Yatırma</h1>
          <p className="text-muted-foreground">Hesabınıza güvenli bir şekilde para yatırın</p>
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

          {/* Deposit Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5" />
                Para Yatır
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="depositAmount">Yatırılacak Miktar (₺)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      placeholder="Miktar giriniz"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                      max="50000"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Min: ₺10 - Max: ₺50,000
                    </p>
                  </div>

                  <div>
                    <Label>Hızlı Seçim</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {quickAmounts.map(amount => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositAmount(amount.toString())}
                        >
                          ₺{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Ödeme Yöntemi</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ödeme yöntemi seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Kredi Kartı</SelectItem>
                        <SelectItem value="papara">Papara</SelectItem>
                        <SelectItem value="bank-transfer">Banka Havalesi</SelectItem>
                        <SelectItem value="crypto">Kripto Para</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'İşlem Yapılıyor...' : 'Para Yatır'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Son Para Yatırma İşlemleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                        <ArrowUpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">Para Yatırma</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.method} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +₺{transaction.amount}
                      </p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          {transaction.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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