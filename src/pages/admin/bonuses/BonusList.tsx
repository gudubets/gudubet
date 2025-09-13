import { useState } from "react";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBonuses, useDeleteBonus, useUpdateBonus } from "@/hooks/useBonuses";
import { BONUS_TYPE_LABELS } from "@/lib/types/bonus";
import type { Bonus, BonusType } from "@/lib/types/bonus";
import { useToast } from "@/hooks/use-toast";

interface BonusListProps {
  onCreateNew: () => void;
  onEdit: (bonus: Bonus) => void;
}

export const BonusList: React.FC<BonusListProps> = ({ onCreateNew, onEdit }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { data: bonuses = [], isLoading, error } = useBonuses();
  const deleteBonus = useDeleteBonus();
  const updateBonus = useUpdateBonus();

  // Debug için
  console.log('Bonuses data:', bonuses);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);

  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = bonus.name.toLowerCase().includes(search.toLowerCase()) ||
                         bonus.description?.toLowerCase().includes(search.toLowerCase()) ||
                         bonus.code?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || bonus.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && bonus.is_active) ||
                         (statusFilter === "inactive" && !bonus.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = async (bonus: Bonus) => {
    try {
      await updateBonus.mutateAsync({
        id: bonus.id,
        is_active: !bonus.is_active
      });
    } catch (error) {
      console.error('Error toggling bonus status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteBonus.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
  };

  const formatAmount = (bonus: Bonus) => {
    if (bonus.amount_type === 'percent') {
      return `%${bonus.amount_value}`;
    }
    return `${bonus.amount_value} TL`;
  };

  const getStatusBadge = (bonus: Bonus) => {
    if (!bonus.is_active) {
      return <Badge variant="secondary">İnaktif</Badge>;
    }
    
    const now = new Date();
    const validFrom = bonus.valid_from ? new Date(bonus.valid_from) : null;
    const validTo = bonus.valid_to ? new Date(bonus.valid_to) : null;
    
    if (validFrom && validFrom > now) {
      return <Badge variant="outline">Başlamadı</Badge>;
    }
    
    if (validTo && validTo < now) {
      return <Badge variant="destructive">Süresi Doldu</Badge>;
    }
    
    return <Badge variant="default">Aktif</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bonus Yönetimi</h1>
          <p className="text-muted-foreground">Bonus kampanyalarını yönet ve takip et</p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Yeni Bonus</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam Bonus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bonuses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Aktif Bonuslar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bonuses.filter(b => b.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">İnaktif Bonuslar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {bonuses.filter(b => !b.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Otomatik Bonuslar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bonuses.filter(b => b.auto_grant).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Bonus adı, açıklama veya kod ile ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Bonus Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                {Object.entries(BONUS_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">İnaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bonus Listesi</CardTitle>
          <CardDescription>
            {filteredBonuses.length} bonus listeleniyor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead>Min. Yatırım</TableHead>
                  <TableHead>Çevrim</TableHead>
                  <TableHead>Durum</TableHead>
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
                        {BONUS_TYPE_LABELS[bonus.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatAmount(bonus)}</span>
                      {bonus.max_cap && (
                        <div className="text-sm text-muted-foreground">
                          Max: {bonus.max_cap} TL
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {bonus.min_deposit > 0 ? `${bonus.min_deposit} TL` : '-'}
                    </TableCell>
                    <TableCell>
                      {bonus.rollover_multiplier > 0 ? `${bonus.rollover_multiplier}x` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(bonus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          onClick={() => onEdit(bonus)} 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-3"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          onClick={() => setDeleteId(bonus.id)} 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredBonuses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Hiç bonus bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bonusu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu bonusu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};