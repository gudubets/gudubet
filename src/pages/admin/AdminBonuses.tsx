import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BonusFormModal } from '@/components/admin/BonusFormModal';
import { Plus, Edit, Trash2, Settings, Copy, Eye, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  is_active: boolean;
  auto_grant: boolean;
  requires_code: boolean;
  max_per_user: number;
  cooldown_hours: number;
  valid_from?: string;
  valid_to?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AdminBonuses = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    try {
      const { data, error } = await supabase
        .from('bonuses_new')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBonuses(data || []);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bonuslar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bonus: Bonus) => {
    setEditingBonus(bonus);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingBonus(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu bonusu silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await supabase
          .from('bonuses_new')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setBonuses(bonuses.filter(b => b.id !== id));
        toast({
          title: "Başarılı",
          description: "Bonus silindi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Bonus silinirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    }
  };

  const getBonusTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FIRST_DEPOSIT': 'İlk Yatırım',
      'RELOAD': 'Yeniden Yükle', 
      'CASHBACK': 'Kayıp Bonusu',
      'FREEBET': 'Bedava Bahis'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleModalSave = () => {
    setShowModal(false);
    setEditingBonus(null);
    loadBonuses();
  };

  const copyBonusCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Kopyalandı!",
        description: `Bonus kodu "${code}" panoya kopyalandı.`,
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bonus Yönetimi</h1>
        <div className="flex gap-2">
          <Link to="/admin/bonuses/requests">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Bonus Talepleri
            </Button>
          </Link>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Bonus
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bonuslar ({bonuses.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Aktif: {bonuses.filter(b => b.is_active).length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Pasif: {bonuses.filter(b => !b.is_active).length}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bonuses.map((bonus) => (
              <Card key={bonus.id} className="p-4 border-l-4 border-l-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{bonus.name}</h3>
                      <Badge variant={bonus.is_active ? "default" : "secondary"}>
                        {bonus.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getBonusTypeLabel(bonus.type)}
                      </Badge>
                      {bonus.auto_grant && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-600">
                          Otomatik
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Değer: </span>
                        {bonus.amount_type === 'percent' ? `%${bonus.amount_value}` : `₺${bonus.amount_value}`}
                        {bonus.max_cap && ` (max ₺${bonus.max_cap})`}
                      </div>
                      <div>
                        <span className="font-medium">Min. Yatırım: </span>
                        ₺{bonus.min_deposit}
                      </div>
                      <div>
                        <span className="font-medium">Çevrim: </span>
                        {bonus.rollover_multiplier}x
                      </div>
                      <div>
                        <span className="font-medium">Limit: </span>
                        {bonus.max_per_user}/kişi
                      </div>
                    </div>

                    {(bonus.valid_from || bonus.valid_to) && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Başlangıç: {formatDate(bonus.valid_from)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Bitiş: {formatDate(bonus.valid_to)}</span>
                        </div>
                      </div>
                    )}

                    {bonus.code && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Kod:</span>
                        <code className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm font-mono">
                          {bonus.code}
                        </code>
                        <button
                          onClick={() => copyBonusCode(bonus.code!)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {bonus.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {bonus.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/bonuses/${bonus.id}/rules`}>
                      <Button variant="outline" size="sm" title="Kuralları Düzenle">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(bonus)} title="Düzenle">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(bonus.id)} title="Sil">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {bonuses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Henüz bonus eklenmemiş</p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Bonusu Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BonusFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        bonus={editingBonus}
        mode={editingBonus ? 'edit' : 'create'}
      />
    </div>
  );
};

export default AdminBonuses;