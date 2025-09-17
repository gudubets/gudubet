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
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('');
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

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || !withdrawalMethod) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen miktar ve çekim yöntemi seçiniz.",
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

    // Collect payout details based on method
    const collectPayoutDetails = () => {
      const details: any = {};
      
      if (withdrawalMethod === 'iban') {
        const bankName = (document.getElementById('bankName') as HTMLInputElement)?.value;
        const iban = (document.getElementById('iban') as HTMLInputElement)?.value;
        const accountHolder = (document.getElementById('accountHolder') as HTMLInputElement)?.value;
        
        if (!bankName || !iban || !accountHolder) {
          throw new Error('Banka bilgileri eksik');
        }
        
        details.bank_name = bankName;
        details.iban = iban;
        details.account_holder = accountHolder;
      } else if (withdrawalMethod === 'papara') {
        const paparaNumber = (document.getElementById('paparaNumber') as HTMLInputElement)?.value;
        const paparaName = (document.getElementById('paparaName') as HTMLInputElement)?.value;
        
        if (!paparaNumber || !paparaName) {
          throw new Error('Papara bilgileri eksik');
        }
        
        details.papara_id = paparaNumber;
        details.account_holder = paparaName;
      } else if (withdrawalMethod?.startsWith('crypto-')) {
        const walletAddress = (document.getElementById('walletAddress') as HTMLInputElement)?.value;
        const networkType = (document.querySelector('#networkType') as HTMLSelectElement)?.value;
        
        if (!walletAddress || !networkType) {
          throw new Error('Cüzdan bilgileri eksik');
        }
        
        details.address = walletAddress;
        details.network = networkType;
        details.asset = withdrawalMethod.replace('crypto-', '').toUpperCase();
        
        if (withdrawalMethod === 'crypto-other') {
          const cryptoType = (document.getElementById('cryptoType') as HTMLInputElement)?.value;
          if (!cryptoType) {
            throw new Error('Kripto para türü belirtilmeli');
          }
          details.asset = cryptoType.toUpperCase();
        }
      }
      
      return details;
    };

    setLoading(true);
    
    try {
      const payoutDetails = collectPayoutDetails();
      
      // Call withdrawal request Edge Function
      const { data, error } = await supabase.functions.invoke('withdraw-request', {
        body: {
          amount: parseFloat(withdrawalAmount),
          method: withdrawalMethod,
          payout_details: payoutDetails
        }
      });

      if (error) {
        console.error('Withdrawal error:', error);
        toast({
          title: "Hata",
          description: error.message || "Para çekme işlemi başarısız oldu.",
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
        description: data?.message || `₺${withdrawalAmount} çekme talebiniz alındı.`
      });
      
      // Show KYC info if needed
      if (data?.kyc_info) {
        setTimeout(() => {
          toast({
            title: "KYC Bilgileri",
            description: `Günlük limit: ₺${data.kyc_info.daily_remaining} kaldı, Aylık limit: ₺${data.kyc_info.monthly_remaining} kaldı`,
            variant: "default"
          });
        }, 2000);
      }
      
      setWithdrawalAmount('');
      setWithdrawalMethod('');

    } catch (error: any) {
      console.error('Withdrawal request error:', error);
      toast({
        title: "Hata",
        description: error.message || "Sunucu hatası oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  const recentTransactions = [
    { id: 1, type: 'deposit', amount: 500, status: 'completed', date: '15 Aralık 2024', method: 'Kredi Kartı' },
    { id: 2, type: 'withdrawal', amount: 250, status: 'pending', date: '14 Aralık 2024', method: 'Banka Havalesi' },
    { id: 3, type: 'deposit', amount: 100, status: 'completed', date: '13 Aralık 2024', method: 'Papara' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Para İşlemleri</h1>
          <p className="text-muted-foreground">Hesabınıza para yatırın veya çekim yapın</p>
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

          {/* Deposit/Withdrawal Forms */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>İşlem Seçimi</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit" className="flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4" />
                    Para Yatır
                  </TabsTrigger>
                  <TabsTrigger value="withdrawal" className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4" />
                    Para Çek
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="space-y-6 mt-6">
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
                </TabsContent>

                <TabsContent value="withdrawal" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="withdrawalAmount">Çekilecek Miktar (₺)</Label>
                      <Input
                        id="withdrawalAmount"
                        type="number"
                        placeholder="Miktar giriniz"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        min="20"
                        max="10000"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Min: ₺20 - Max: ₺10,000 (günlük)
                      </p>
                    </div>

                    <div>
                      <Label>Hızlı Seçim</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {quickAmounts.slice(0, 4).map(amount => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setWithdrawalAmount(amount.toString())}
                          >
                            ₺{amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="withdrawalMethod">Para Alacak Hesap</Label>
                      <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hesap türü seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iban">IBAN / Banka Hesabı</SelectItem>
                          <SelectItem value="papara">Papara</SelectItem>
                          <SelectItem value="crypto-btc">Bitcoin (BTC)</SelectItem>
                          <SelectItem value="crypto-eth">Ethereum (ETH)</SelectItem>
                          <SelectItem value="crypto-usdt">Tether (USDT)</SelectItem>
                          <SelectItem value="crypto-other">Diğer Kripto Para</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dinamik Hesap Detay Formları */}
                    {withdrawalMethod && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-sm font-medium">Hesap Bilgileri</Label>
                        
                        {withdrawalMethod === 'iban' && (
                          <>
                            <div>
                              <Label htmlFor="bankName">Banka Adı</Label>
                              <Input
                                id="bankName"
                                placeholder="Örn: Türkiye İş Bankası"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="iban">IBAN</Label>
                              <Input
                                id="iban"
                                placeholder="TR00 0000 0000 0000 0000 0000 00"
                                maxLength={32}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountHolder">Hesap Sahibi</Label>
                              <Input
                                id="accountHolder"
                                placeholder="Ad Soyad (TC Kimlik ile aynı)"
                                required
                              />
                            </div>
                          </>
                        )}

                        {withdrawalMethod === 'papara' && (
                          <>
                            <div>
                              <Label htmlFor="paparaNumber">Papara Numarası</Label>
                              <Input
                                id="paparaNumber"
                                placeholder="1234567890"
                                maxLength={10}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="paparaName">Papara Hesap Adı</Label>
                              <Input
                                id="paparaName"
                                placeholder="TC Kimlik ile aynı ad soyad"
                                required
                              />
                            </div>
                          </>
                        )}

                        {(withdrawalMethod?.startsWith('crypto-') || withdrawalMethod === 'crypto-other') && (
                          <>
                            <div>
                              <Label htmlFor="walletAddress">Cüzdan Adresi</Label>
                              <Input
                                id="walletAddress"
                                placeholder={
                                  withdrawalMethod === 'crypto-btc' ? 'bc1...' :
                                  withdrawalMethod === 'crypto-eth' ? '0x...' :
                                  withdrawalMethod === 'crypto-usdt' ? '0x... (ERC-20)' :
                                  'Cüzdan adresi giriniz'
                                }
                                required
                              />
                            </div>
                            {withdrawalMethod === 'crypto-other' && (
                              <div>
                                <Label htmlFor="cryptoType">Kripto Para Türü</Label>
                                <Input
                                  id="cryptoType"
                                  placeholder="Örn: DOGE, LTC, XRP"
                                  required
                                />
                              </div>
                            )}
                            <div>
                              <Label htmlFor="networkType">Ağ Türü</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Ağ seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                  {withdrawalMethod === 'crypto-btc' && (
                                    <SelectItem value="bitcoin">Bitcoin Network</SelectItem>
                                  )}
                                  {(withdrawalMethod === 'crypto-eth' || withdrawalMethod === 'crypto-usdt') && (
                                    <>
                                      <SelectItem value="ethereum">Ethereum (ERC-20)</SelectItem>
                                      <SelectItem value="bsc">Binance Smart Chain (BEP-20)</SelectItem>
                                      <SelectItem value="polygon">Polygon (MATIC)</SelectItem>
                                    </>
                                  )}
                                  {withdrawalMethod === 'crypto-other' && (
                                    <>
                                      <SelectItem value="mainnet">Ana Ağ (Mainnet)</SelectItem>
                                      <SelectItem value="erc20">Ethereum (ERC-20)</SelectItem>
                                      <SelectItem value="bep20">Binance Smart Chain (BEP-20)</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3">
                              <p className="text-sm text-orange-700 dark:text-orange-300">
                                ⚠️ Kripto para transferlerinde ağ türünü doğru seçtiğinizden emin olun. 
                                Yanlış ağ seçimi para kaybına neden olabilir.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          Çekim Bilgileri
                        </span>
                      </div>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Çekim işlemleri 24 saat içinde onaylanır</li>
                        <li>• İlk çekim için kimlik doğrulama gereklidir</li>
                        <li>• Günlük maksimum çekim limiti: ₺10,000</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={handleWithdrawal}
                      disabled={loading}
                      className="w-full"
                      variant="outline"
                      size="lg"
                    >
                      {loading ? 'İşlem Yapılıyor...' : 'Para Çekme Talebi Oluştur'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Son İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
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
                        transaction.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'deposit' ? '+' : '-'}₺{transaction.amount}
                      </p>
                      <div className="flex items-center gap-1">
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className={`text-sm ${
                          transaction.status === 'completed' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
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