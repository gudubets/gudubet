import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Edit,
  MoreHorizontal,
  Trophy,
  X,
  CheckCircle
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

interface Betslip {
  id: string;
  total_stake: number;
  total_odds: number;
  potential_win: number;
  status: string;
  created_at: string;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const AdminBets = () => {
  const [betslips, setBetslips] = useState<Betslip[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBetslips();
  }, []);

  const loadBetslips = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('betslips')
        .select(`
          *,
          users:user_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBetslips(data || []);
    } catch (error) {
      console.error('Error loading betslips:', error);
      toast({
        title: "Hata",
        description: "Bahisler yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBetslipStatus = async (betslipId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('betslips')
        .update({ status: newStatus })
        .eq('id', betslipId);

      if (error) throw error;

      setBetslips(betslips.map(betslip => 
        betslip.id === betslipId ? { ...betslip, status: newStatus } : betslip
      ));

      toast({
        title: "Başarılı",
        description: `Bahis durumu ${newStatus} olarak güncellendi.`,
      });
    } catch (error) {
      console.error('Error updating betslip status:', error);
      toast({
        title: "Hata",
        description: "Bahis durumu güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const filteredBetslips = betslips.filter(betslip => {
    const userEmail = betslip.users?.email || '';
    const userName = `${betslip.users?.first_name || ''} ${betslip.users?.last_name || ''}`.trim();
    
    const matchesSearch = 
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      betslip.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || betslip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <Badge className="bg-success text-success-foreground">Kazandı</Badge>;
      case 'lost':
        return <Badge variant="destructive">Kaybetti</Badge>;
      case 'pending':
        return <Badge variant="secondary">Beklemede</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Bahis Yönetimi</h1>
        <div className="text-sm text-muted-foreground">
          Toplam {betslips.length} bahis kuponu
        </div>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Bahisleri filtrele ve ara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Kullanıcı e-postası veya kupon ID ile ara..."
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
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                  Beklemede
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('won')}>
                  Kazandı
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('lost')}>
                  Kaybetti
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Betslips Table */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Bahis Kuponları</CardTitle>
          <CardDescription>
            Tüm bahis kuponları ve detayları
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
                  <TableHead>Kupon ID</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Bahis Tutarı</TableHead>
                  <TableHead>Oran</TableHead>
                  <TableHead>Potansiyel Kazanç</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBetslips.map((betslip) => (
                  <TableRow key={betslip.id}>
                    <TableCell className="font-mono">
                      {betslip.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {`${betslip.users?.first_name || ''} ${betslip.users?.last_name || ''}`.trim() || 'İsim belirtilmemiş'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {betslip.users?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>₺{betslip.total_stake?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{betslip.total_odds?.toFixed(2)}</TableCell>
                    <TableCell>₺{betslip.potential_win?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{getStatusBadge(betslip.status)}</TableCell>
                    <TableCell>
                      {new Date(betslip.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {betslip.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => updateBetslipStatus(betslip.id, 'won')}
                                className="text-success"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Kazandı Olarak İşaretle
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => updateBetslipStatus(betslip.id, 'lost')}
                                className="text-destructive"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Kaybetti Olarak İşaretle
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredBetslips.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bahis kuponu bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBets;