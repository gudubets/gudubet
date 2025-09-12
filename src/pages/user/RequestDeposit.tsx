import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserBalance } from '@/hooks/useUserBalance';
import { User } from '@supabase/supabase-js';

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  iban: string;
}

const RequestDeposit = () => {
  const [user, setUser] = useState<User | null>(null);
  const [amount, setAmount] = useState('');
  const [userAccountName, setUserAccountName] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const { toast } = useToast();
  const balanceData = useUserBalance(user);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching bank accounts:', error);
        return;
      }

      setBankAccounts(data || []);
      if (data && data.length > 0) {
        setSelectedBankAccount(data[0]);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleSubmitRequest = async () => {
    if (!amount || !userAccountName || !selectedBankAccount) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir miktar giriniz.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('deposit-request', {
        body: {
          amount: amountNum,
          user_account_name: userAccountName,
          bank_account_id: selectedBankAccount.id
        }
      });

      if (response.error) {
        throw response.error;
      }

      setShowBankDetails(true);
      toast({
        title: "Başarılı",
        description: "Para yatırma talebi oluşturuldu. Lütfen aşağıdaki hesap bilgilerine para yatırın.",
      });

      // Reset form
      setAmount('');
      setUserAccountName('');
    } catch (error: any) {
      console.error('Error creating deposit request:', error);
      toast({
        title: "Hata",
        description: error.message || "Para yatırma talebi oluşturulamadı.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeposit = () => {
    toast({
      title: "Onaylandı",
      description: "Para yatırdığınızı onayladınız. Admin kontrolü sonrası bakiyenize yansıyacaktır.",
    });
    setShowBankDetails(false);
  };

  if (!showBankDetails) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Para Yatır</CardTitle>
            <CardDescription>
              Hesabınıza para yatırmak için miktarı ve hesap adınızı girin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Mevcut Bakiye</p>
              <p className="text-2xl font-bold">{balanceData.balance.toFixed(2)} ₺</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Yatırılacak Miktar (₺)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userAccountName">Hesap Sahibi Adı Soyadı</Label>
              <Input
                id="userAccountName"
                placeholder="Para yatıracağınız hesabın sahibi adı soyadı"
                value={userAccountName}
                onChange={(e) => setUserAccountName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Kayıt olurken kullandığınız ad soyad ile aynı olmalıdır.
              </p>
            </div>

            <Button 
              onClick={handleSubmitRequest} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'İstek Gönderiliyor...' : 'Para Yatırma Talebi Gönder'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Para Yatırma Bilgileri</CardTitle>
          <CardDescription>
            Aşağıdaki hesap bilgilerine para yatırın ve onaylayın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedBankAccount && (
            <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
              <h3 className="font-semibold mb-4">Para Yatırılacak Hesap</h3>
              <div className="space-y-2">
                <p><strong>Banka:</strong> {selectedBankAccount.bank_name}</p>
                <p><strong>Hesap Sahibi:</strong> {selectedBankAccount.account_holder_name}</p>
                <p><strong>IBAN:</strong> {selectedBankAccount.iban}</p>
                <p><strong>Yatırılacak Miktar:</strong> {amount} ₺</p>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800">
              <strong>Önemli:</strong> Açıklama yazmayın ve miktarı doğru girdiğinizden emin olun.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleConfirmDeposit}
              className="flex-1"
            >
              Para Yatırdım, Onayla
            </Button>
            <Button 
              onClick={() => setShowBankDetails(false)}
              variant="outline"
              className="flex-1"
            >
              İptal Et
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDeposit;