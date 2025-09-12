import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Edit } from 'lucide-react';

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  iban: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const AdminBankAccounts = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_holder_name: '',
    iban: '',
    sort_order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('sort_order');

    if (error) {
      console.error('Error fetching bank accounts:', error);
      toast({
        title: "Hata",
        description: "Banka hesapları yüklenemedi.",
        variant: "destructive"
      });
      return;
    }

    setBankAccounts(data || []);
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_holder_name: '',
      iban: '',
      sort_order: 0
    });
    setEditingAccount(null);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank_name: account.bank_name,
      account_holder_name: account.account_holder_name,
      iban: account.iban,
      sort_order: account.sort_order
    });
    setIsDialogOpen(true);
  };

  const validateIban = (iban: string) => {
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    return cleanIban.startsWith('TR') && cleanIban.length === 26;
  };

  const handleSubmit = async () => {
    if (!formData.bank_name || !formData.account_holder_name || !formData.iban) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      });
      return;
    }

    const cleanIban = formData.iban.replace(/\s/g, '').toUpperCase();
    
    if (!validateIban(cleanIban)) {
      toast({
        title: "Hata",
        description: "Geçerli bir Türk IBAN numarası giriniz (TR + 24 rakam).",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('bank_accounts')
          .update({
            bank_name: formData.bank_name,
            account_holder_name: formData.account_holder_name,
            iban: cleanIban,
            sort_order: formData.sort_order
          })
          .eq('id', editingAccount.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Banka hesabı güncellendi."
        });
      } else {
        // Create new account
        const { error } = await supabase
          .from('bank_accounts')
          .insert({
            bank_name: formData.bank_name,
            account_holder_name: formData.account_holder_name,
            iban: cleanIban,
            sort_order: formData.sort_order
          });

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Yeni banka hesabı eklendi."
        });
      }

      fetchBankAccounts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving bank account:', error);
      toast({
        title: "Hata",
        description: error.message || "Banka hesabı kaydedilemedi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Hesap durumu ${!currentStatus ? 'aktif' : 'pasif'} olarak güncellendi.`
      });

      fetchBankAccounts();
    } catch (error: any) {
      console.error('Error updating account status:', error);
      toast({
        title: "Hata",
        description: "Hesap durumu güncellenemedi.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Bu banka hesabını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Banka hesabı silindi."
      });

      fetchBankAccounts();
    } catch (error: any) {
      console.error('Error deleting bank account:', error);
      toast({
        title: "Hata",
        description: "Banka hesabı silinemedi.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banka Hesapları Yönetimi</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hesap Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Banka Hesabını Düzenle' : 'Yeni Banka Hesabı Ekle'}
              </DialogTitle>
              <DialogDescription>
                Para yatırma işlemleri için kullanılacak banka hesap bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bank_name">Banka Adı</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="Örn: Ziraat Bankası"
                />
              </div>
              <div>
                <Label htmlFor="account_holder_name">Hesap Sahibi</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  placeholder="Hesap sahibinin adı soyadı"
                />
              </div>
              <div>
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                  placeholder="TR123456789012345678901234"
                  maxLength={26}
                />
              </div>
              <div>
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? 'Kaydediliyor...' : (editingAccount ? 'Güncelle' : 'Ekle')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banka Hesapları</CardTitle>
          <CardDescription>
            Para yatırma işlemleri için kullanılan banka hesaplarını yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banka</TableHead>
                <TableHead>Hesap Sahibi</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Sıralama</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.bank_name}</TableCell>
                  <TableCell>{account.account_holder_name}</TableCell>
                  <TableCell className="font-mono text-sm">{account.iban}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={() => toggleAccountStatus(account.id, account.is_active)}
                      />
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{account.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAccount(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {bankAccounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz banka hesabı eklenmemiş.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBankAccounts;