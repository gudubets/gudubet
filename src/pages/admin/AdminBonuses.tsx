import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BonusFormModal } from '@/components/admin/BonusFormModal';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
  created_at: string;
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

  const handleModalSave = () => {
    setShowModal(false);
    setEditingBonus(null);
    loadBonuses();
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bonus Yönetimi</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Bonus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bonuslar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bonuses.map((bonus) => (
              <div key={bonus.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{bonus.name}</h3>
                  <p className="text-sm text-gray-600">
                    {bonus.type} - {bonus.amount_type === 'percent' ? `%${bonus.amount_value}` : `₺${bonus.amount_value}`}
                  </p>
                  {bonus.code && (
                    <p className="text-sm text-blue-600">Kod: {bonus.code}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bonus.is_active ? "default" : "secondary"}>
                    {bonus.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(bonus)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(bonus.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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