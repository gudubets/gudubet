import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  MoreHorizontal,
  UserCheck,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  bonus_balance: number;
  status: string;
  created_at: string;
  phone?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();

    // Setup realtime subscription for wallet balance updates
    const channel = supabase
      .channel('admin-wallets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: 'type=eq.main'
        },
        () => {
          // Reload users when wallet balances change
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles data with all necessary fields including bonus_balance
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, user_id, first_name, last_name, phone, email, balance, bonus_balance, status, 
          created_at, banned_until
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Transform profiles data to match User interface
      const users = profilesData?.map(profile => ({
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone,
        balance: profile.balance || 0,
        bonus_balance: profile.bonus_balance || 0,
        status: profile.status || 'active',
        created_at: profile.created_at,
        banned_until: profile.banned_until
      })) || [];
      
      setUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Hata",
        description: "Kullanıcılar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const bannedUntil = newStatus === 'banned' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ban
        : null;

      await supabase.rpc('admin_update_profile', {
        p_user: userId,
        p_role: null,
        p_banned_until: bannedUntil
      });

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast({
        title: "Başarılı",
        description: `Kullanıcı durumu ${newStatus === 'banned' ? 'yasaklandı' : 'aktif edildi'}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Hata",
        description: "Kullanıcı durumu güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Aktif</Badge>;
      case 'banned':
        return <Badge variant="destructive">Yasaklı</Badge>;
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Kullanıcı Yönetimi</h1>
        <div className="text-sm text-muted-foreground">
          Toplam {users.length} kullanıcı
        </div>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Kullanıcıları filtrele ve ara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Ad, soyad veya e-posta ile ara..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Durum: {statusFilter === 'all' ? 'Tümü' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Tümü
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Aktif
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('banned')}>
                  Yasaklı
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Beklemede
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm kullanıcılar ve detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Telefon</TableHead>
                   <TableHead>Ana Bakiye</TableHead>
                   <TableHead>Bonus Bakiye</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'İsim belirtilmemiş'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                     <TableCell>₺{user.balance?.toLocaleString('tr-TR') || '0'}</TableCell>
                     <TableCell>₺{user.bonus_balance?.toLocaleString('tr-TR') || '0'}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'banned')}
                              className="text-destructive"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Yasakla
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-success"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Aktif Et
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Kullanıcı bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;