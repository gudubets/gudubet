import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserPlus,
  Download,
  Calendar,
  TrendingUp,
  Gift,
  Users
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BonusFormModal } from '@/components/admin/BonusFormModal';
import { ManualBonusModal } from '@/components/admin/ManualBonusModal';

interface BonusCampaign {
  id: string;
  name: string;
  code?: string;
  type: string;
  amount_type: string;
  amount_value: number;
  max_cap?: number;
  min_deposit: number;
  rollover_multiplier: number;
  auto_grant: boolean;
  requires_code: boolean;
  valid_from?: string;
  valid_to?: string;
  max_per_user: number;
  cooldown_hours: number;
  is_active: boolean;
  excluded_providers?: any;
  created_at: string;
  updated_at: string;
  description?: string;
}

const BONUS_TYPE_LABELS = {
  FIRST_DEPOSIT: 'İlk Yatırım Bonusu',
  RELOAD: 'Yeniden Yükle Bonusu',
  CASHBACK: 'Kayıp Bonusu',
  FREEBET: 'Bedava Bahis'
};

const GAME_TYPE_LABELS = {
  all: 'Tüm Oyunlar',
  sports: 'Spor Bahisleri',
  casino: 'Casino',
  slots: 'Slot',
  'live-casino': 'Canlı Casino'
};

const AdminBonuses = () => {
  const [bonuses, setBonuses] = useState<BonusCampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showManualBonusModal, setShowManualBonusModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusCampaign | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const { toast } = useToast();

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bonuses_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBonuses(data || []);
    } catch (error) {
      console.error('Error loading bonuses:', error);
      toast({
        title: "Hata",
        description: "Bonus kampanyaları yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBonusStatus = async (bonusId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bonuses_new')
        .update({ is_active: !currentStatus })
        .eq('id', bonusId);

      if (error) throw error;

      setBonuses(bonuses.map(bonus => 
        bonus.id === bonusId ? { ...bonus, is_active: !currentStatus } : bonus
      ));

      toast({
        title: "Başarılı",
        description: `Bonus kampanyası ${!currentStatus ? 'aktif edildi' : 'pasif edildi'}.`,
      });
    } catch (error) {
      console.error('Error toggling bonus status:', error);
      toast({
        title: "Hata",
        description: "Bonus durumu güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const deleteBonus = async (bonusId: string) => {
    if (!confirm('Bu bonus kampanyasını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bonuses_new')
        .delete()
        .eq('id', bonusId);

      if (error) throw error;

      setBonuses(bonuses.filter(bonus => bonus.id !== bonusId));

      toast({
        title: "Başarılı",
        description: "Bonus kampanyası silindi.",
      });
    } catch (error) {
      console.error('Error deleting bonus:', error);
      toast({
        title: "Hata",
        description: "Bonus silinirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (bonus: BonusCampaign) => {
    setEditingBonus(bonus);
    setModalMode('edit');
    setShowBonusModal(true);
  };

  const openCreateModal = () => {
    setEditingBonus(null);
    setModalMode('create');
    setShowBonusModal(true);
  };

  const closeModal = () => {
    setShowBonusModal(false);
    setEditingBonus(null);
  };

  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = 
      bonus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bonus.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bonus.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || bonus.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && bonus.is_active) ||
      (statusFilter === 'inactive' && !bonus.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (bonus: BonusCampaign) => {
    if (!bonus.is_active) {
      return <Badge variant="destructive">Pasif</Badge>;
    }
    
    const now = new Date();
    const endDate = bonus.valid_to ? new Date(bonus.valid_to) : null;
    
    if (endDate && endDate < now) {
      return <Badge variant="outline">Süresi Dolmuş</Badge>;
    }
    
    return <Badge className="bg-success text-success-foreground">Aktif</Badge>;
  };

  const formatAmount = (bonus: BonusCampaign) => {
    if (bonus.amount_type === 'percentage') {
      return `%${bonus.amount_value || 0}`;
    }
    return `₺${(bonus.amount_value || 0).toLocaleString('tr-TR')}`;
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Kampanya Adı,Tür,Miktar,Min Yatırım,Çevrim Şartı,Durum,Oluşturma Tarihi\n"
      + filteredBonuses.map(bonus => 
          `"${bonus.name}","${BONUS_TYPE_LABELS[bonus.type as keyof typeof BONUS_TYPE_LABELS] || bonus.type}","${formatAmount(bonus)}","₺${bonus.min_deposit}","${bonus.rollover_multiplier}x","${bonus.is_active ? 'Aktif' : 'Pasif'}","${new Date(bonus.created_at).toLocaleDateString('tr-TR')}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bonus_kampanyalari_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const stats = {
    total: bonuses.length,
    active: bonuses.filter(b => b.is_active).length,
    totalUsage: 0, // We'll need to calculate this differently for bonuses_new
    totalValue: bonuses.reduce((sum, b) => {
      if (b.amount_type === 'fixed') {
        return sum + b.amount_value;
      }
      return sum;
    }, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Bonus Yönetimi</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSV İndir
          </Button>
          <Button onClick={() => setShowManualBonusModal(true)} variant="outline" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Manuel Bonus
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Kampanya
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Kampanya
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} aktif kampanya
            </p>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif Kampanyalar
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              %{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0} aktif oran
            </p>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Kullanım
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Bonus kullanım sayısı
            </p>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Değer
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{(stats.totalValue || 0).toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground">
              Sabit bonus değeri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Bonus kampanyalarını filtrele ve ara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Kampanya adı, açıklama veya kod ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Bonus Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.entries(BONUS_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Bonus Kampanyaları</CardTitle>
          <CardDescription>
            Tüm bonus kampanyaları ve detayları
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
                   <TableHead>Kampanya</TableHead>
                   <TableHead>Tür</TableHead>
                   <TableHead>Miktar</TableHead>
                   <TableHead>Min Yatırım</TableHead>
                   <TableHead>Çevrim</TableHead>
                   <TableHead>Geçerli Oyunlar</TableHead>
                   <TableHead>Max Kullanım</TableHead>
                   <TableHead>Durum</TableHead>
                   <TableHead>Bitiş Tarihi</TableHead>
                   <TableHead className="text-right">İşlemler</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                     <TableCell>
                       <div className="flex items-center space-x-3">
                         <div>
                           <div className="font-medium">{bonus.name}</div>
                           {bonus.code && (
                             <div className="text-sm text-muted-foreground">
                               Kod: {bonus.code}
                             </div>
                           )}
                         </div>
                       </div>
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline">
                         {BONUS_TYPE_LABELS[bonus.type as keyof typeof BONUS_TYPE_LABELS] || bonus.type}
                       </Badge>
                     </TableCell>
                     <TableCell className="font-medium">
                       {formatAmount(bonus)}
                       {bonus.max_cap && (
                         <div className="text-xs text-muted-foreground">
                           Max: ₺{(bonus.max_cap || 0).toLocaleString('tr-TR')}
                         </div>
                       )}
                     </TableCell>
                     <TableCell>₺{(bonus.min_deposit || 0).toLocaleString('tr-TR')}</TableCell>
                     <TableCell>{bonus.rollover_multiplier}x</TableCell>
                     <TableCell>
                       <Badge variant="secondary">
                         Tüm Oyunlar
                       </Badge>
                     </TableCell>
                     <TableCell>
                       {bonus.max_per_user} kullanım
                     </TableCell>
                     <TableCell>{getStatusBadge(bonus)}</TableCell>
                     <TableCell>
                       {bonus.valid_to ? (
                         <div>
                           <div className="text-sm">
                             {new Date(bonus.valid_to).toLocaleDateString('tr-TR')}
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {new Date(bonus.valid_to).toLocaleTimeString('tr-TR')}
                           </div>
                         </div>
                       ) : (
                         <span className="text-muted-foreground">Süresiz</span>
                       )}
                     </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(bonus)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => toggleBonusStatus(bonus.id, bonus.is_active)}
                          >
                            {bonus.is_active ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Pasif Et
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Aktif Et
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteBonus(bonus.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredBonuses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Bonus kampanyası bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BonusFormModal
        isOpen={showBonusModal}
        onClose={closeModal}
        onSave={loadBonuses}
        bonus={editingBonus}
        mode={modalMode}
      />

      <ManualBonusModal
        isOpen={showManualBonusModal}
        onClose={() => setShowManualBonusModal(false)}
        onSave={() => {
          setShowManualBonusModal(false);
          // Optionally reload data if needed
        }}
      />
    </div>
  );
};

export default AdminBonuses;