import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Minus, 
  Search, 
  Download, 
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  balance: number;
  bonus_balance: number;
  status: string;
  created_at: string;
}

const AdminBalance = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'balance' | 'bonus_balance'>('balance');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    
    // Set up realtime subscription for profiles balance changes
    const channel = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile balance update received:', payload);
          // Refresh users list when profile balance changes
          fetchUsers();
        }
      )
      .on(
        'broadcast',
        { event: 'balance_updated' },
        (payload) => {
          console.log('Balance broadcast received in admin:', payload);
          // Update specific user in the list immediately
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === payload.payload.user_id 
                ? { ...user, balance: payload.payload.new_balance }
                : user
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles data directly with balance - same source as other components
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, first_name, last_name, phone, email, balance, bonus_balance, status, 
          created_at, user_id
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      // Transform profiles data directly - no wallet lookups needed
      const usersWithBalance = profilesData?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        created_at: profile.created_at,
        user_id: profile.user_id || profile.id,
        balance: profile.balance || 0,
        bonus_balance: profile.bonus_balance || 0,
        email: profile.email || '',
        status: profile.status || 'active'
      })) || [];
      setUsers(usersWithBalance);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = async () => {
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir miktar giriniz.",
        variant: "destructive"
      });
      return;
    }

    try {
      setProcessing(true);
      const amountValue = parseFloat(amount);
      const currentBalance = balanceType === 'balance' ? selectedUser.balance : selectedUser.bonus_balance;
      
      let newBalance;
      if (actionType === 'add') {
        newBalance = currentBalance + amountValue;
      } else {
        newBalance = Math.max(0, currentBalance - amountValue);
      }

      const updateData = {
        [balanceType]: newBalance
      };

      // Update balance directly in profiles table (same source as other components)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ [balanceType]: newBalance })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Create transaction record
      if (!profileError) {
        await supabase
          .from('wallet_transactions')
          .insert({
            wallet_id: selectedUser.id, // This should be actual wallet ID in production
            amount: amountValue,
            direction: actionType === 'add' ? 'credit' : 'debit',
            ledger_key: `admin_${actionType}_${balanceType}`,
            meta: {
              description: description || `Admin balance ${actionType === 'add' ? 'added' : 'removed'}: ${amountValue} TRY (${balanceType})`,
              admin_action: true,
              balance_type: balanceType
            }
          });
      }

      // Update local state immediately for better UX
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              [balanceType]: newBalance 
            } 
          : user
      ));

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.id,
          type: actionType === 'add' ? 'deposit' : 'withdrawal',
          amount: amountValue,
          status: 'approved',
          description: description || `Admin ${actionType === 'add' ? 'ekleme' : 'çıkarma'} işlemi`,
          payment_method: 'admin_adjustment',
          processed_at: new Date().toISOString()
        });

      toast({
        title: "Başarılı",
        description: `Bakiye güncellendi: ${actionType === 'add' ? '+' : '-'}₺${amountValue.toLocaleString('tr-TR')}`
      });

      // Refresh users list
      await fetchUsers();
      
      // Close modal and reset form
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
      setSelectedUser(null);

    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Hata",
        description: "Bakiye güncellenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const openBalanceModal = (user: User, type: 'add' | 'subtract') => {
    setSelectedUser(user);
    setActionType(type);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalBonusBalance = users.reduce((sum, user) => sum + (user.bonus_balance || 0), 0);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Ad,Soyad,Gerçek Bakiye,Bonus Bakiye,Toplam Bakiye,Durum,Kayıt Tarihi\n"
      + filteredUsers.map(user => 
          `"${user.email}","${user.first_name || ''}","${user.last_name || ''}","${user.balance}","${user.bonus_balance}","${(user.balance || 0) + (user.bonus_balance || 0)}","${user.status}","${new Date(user.created_at).toLocaleDateString('tr-TR')}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kullanici_bakiyeleri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bakiye Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcı bakiyelerini görüntüle ve yönet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gerçek Bakiye</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalBalance.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              {users.length} kullanıcı
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bonus Bakiye</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalBonusBalance.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              Bonus bakiye toplamı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genel Toplam</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{(totalBalance + totalBonusBalance).toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              Tüm bakiyeler
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bakiyeleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Email, ad veya soyad ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Kullanıcılar yükleniyor...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Gerçek Bakiye</TableHead>
                    <TableHead className="text-right">Bonus Bakiye</TableHead>
                    <TableHead className="text-right">Toplam</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'İsimsiz Kullanıcı'
                          }
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="text-right font-mono">
                        ₺{(user.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-green-600">
                        ₺{(user.bonus_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        ₺{((user.balance || 0) + (user.bonus_balance || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBalanceModal(user, 'add')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openBalanceModal(user, 'subtract')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Update Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? 'Bakiye Ekle' : 'Bakiye Çıkar'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedUser && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.email}</p>
                <p className="text-sm text-muted-foreground">
                  Mevcut Bakiye: ₺{(selectedUser.balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} | 
                  Bonus: ₺{(selectedUser.bonus_balance || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="balanceType">Bakiye Türü</Label>
              <Select value={balanceType} onValueChange={(value: 'balance' | 'bonus_balance') => setBalanceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balance">Gerçek Bakiye</SelectItem>
                  <SelectItem value="bonus_balance">Bonus Bakiye</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Miktar (₺)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="İşlem açıklaması..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setIsModalOpen(false)} 
                variant="outline" 
                className="flex-1"
              >
                İptal
              </Button>
              <Button 
                onClick={handleBalanceUpdate} 
                disabled={processing || !amount}
                className="flex-1"
              >
                {processing ? 'İşleniyor...' : (actionType === 'add' ? 'Ekle' : 'Çıkar')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBalance;