import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Gift
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
import { BonusFormModal } from '@/components/admin/BonusFormModal';

interface Bonus {
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
  created_at: string;
  description?: string;
}

const BONUS_TYPE_LABELS = {
  FIRST_DEPOSIT: 'İlk Yatırım Bonusu',
  RELOAD: 'Yeniden Yükle Bonusu',
  CASHBACK: 'Kayıp Bonusu',
  FREEBET: 'Bedava Bahis'
};

const AdminBonuses = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
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
        description: "Bonuslar yüklenirken bir hata oluştu.",
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
        description: `Bonus ${!currentStatus ? 'aktif edildi' : 'pasif edildi'}.`,
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
    if (!confirm('Bu bonusu silmek istediğinizden emin misiniz?')) {
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
        description: "Bonus silindi.",
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

  const openEditModal = (bonus: Bonus) => {
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

  const handleModalSave = () => {
    loadBonuses(); // Reload bonuses after save
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

  const getStatusBadge = (bonus: Bonus) => {
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

  const formatAmount = (bonus: Bonus) => {
    if (bonus.amount_type === 'percent') {
      return `%${bonus.amount_value}`;
    }
    return `₺${bonus.amount_value.toLocaleString('tr-TR')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Bonus Yönetimi</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Toplam {bonuses.length} bonus
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Yeni Bonus
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Bonusları filtrele ve ara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Bonus adı, açıklama veya kod ile ara..."
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
                  Tür: {typeFilter === 'all' ? 'Tümü' : BONUS_TYPE_LABELS[typeFilter as keyof typeof BONUS_TYPE_LABELS]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                  Tümü
                </DropdownMenuItem>
                {Object.entries(BONUS_TYPE_LABELS).map(([value, label]) => (
                  <DropdownMenuItem key={value} onClick={() => setTypeFilter(value)}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Durum: {statusFilter === 'all' ? 'Tümü' : statusFilter === 'active' ? 'Aktif' : 'Pasif'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Tümü
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                  Aktif
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                  Pasif
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Bonus Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm bonuslar ve detayları
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
                  <TableHead>Bonus Adı</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Min Yatırım</TableHead>
                  <TableHead>Çevrim</TableHead>
                  <TableHead>Kullanım Limiti</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBonuses.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bonus.name}</div>
                        {bonus.code && (
                          <div className="text-sm text-muted-foreground">
                            Kod: {bonus.code}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {BONUS_TYPE_LABELS[bonus.type as keyof typeof BONUS_TYPE_LABELS] || bonus.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(bonus)}
                      {bonus.max_cap && bonus.amount_type === 'percent' && (
                        <div className="text-xs text-muted-foreground">
                          Max: ₺{bonus.max_cap.toLocaleString('tr-TR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>₺{bonus.min_deposit.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{bonus.rollover_multiplier}x</TableCell>
                    <TableCell>{bonus.max_per_user} kez</TableCell>
                    <TableCell>{getStatusBadge(bonus)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(bonus.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
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
                                Pasif Yap
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Aktif Yap
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
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bonus bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Arama kriterlerinize uygun bonus bulunamadı.'
                  : 'Henüz hiç bonus eklenmemiş.'}
              </p>
              {(!searchQuery && typeFilter === 'all' && statusFilter === 'all') && (
                <Button onClick={openCreateModal} className="gap-2">
                  <Plus className="w-4 h-4" />
                  İlk Bonusu Ekle
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bonus Form Modal */}
      <BonusFormModal
        isOpen={showBonusModal}
        onClose={closeModal}
        onSave={handleModalSave}
        bonus={editingBonus}
        mode={modalMode}
      />
    </div>
  );
};

export default AdminBonuses;