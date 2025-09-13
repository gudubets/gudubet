import { useState, useEffect } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BonusFormModal } from '@/components/admin/BonusFormModal';
import { useAdminBonusRequests, useApproveBonusRequest, useRejectBonusRequest } from '@/hooks/useBonusRequests';
import { Plus, Edit, Trash2, Settings, Copy, Calendar, Users, Check, X, Gift, HandHeart, Coins, Trophy, CreditCard } from 'lucide-react';

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

const BONUS_TYPES = {
  birthday: { icon: Calendar, label: "Doğum Günü Bonusu", color: "bg-pink-500" },
  welcome: { icon: HandHeart, label: "Hoşgeldin Bonusu", color: "bg-green-500" },
  cashback: { icon: Coins, label: "Cashback Bonusu", color: "bg-blue-500" },
  freebet: { icon: Gift, label: "Freebet Bonusu", color: "bg-purple-500" },
  vip_platinum: { icon: Trophy, label: "VIP Platin Bonusu", color: "bg-yellow-500" },
  deposit: { icon: CreditCard, label: "Yatırım Bonusu", color: "bg-orange-500" }
};

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500"
};

const STATUS_LABELS = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi"
};

const AdminBonuses = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [activeTab, setActiveTab] = useState("bonuses");
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; requestId?: string }>({ open: false });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId?: string }>({ open: false });
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  
  const { data: pendingRequests, refetch: refetchRequests } = useAdminBonusRequests('pending');
  const approveRequest = useApproveBonusRequest();
  const rejectRequest = useRejectBonusRequest();

  // Her 30 saniyede bir otomatik yenile
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Admin paneli bonus talepleri yenileniyor...');
      refetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchRequests]);

  React.useEffect(() => {
    console.log('📊 Bekleyen bonus talepleri:', pendingRequests?.length || 0);
  }, [pendingRequests]);

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

  const handleApprove = async () => {
    if (!approveDialog.requestId) return;

    try {
      await approveRequest.mutateAsync({
        id: approveDialog.requestId,
        admin_note: adminNote
      });
      
      toast({
        title: "Başarılı",
        description: "Bonus talebi onaylandı.",
      });

      setApproveDialog({ open: false });
      setAdminNote("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Bonus talebi onaylanırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.requestId || !rejectionReason) return;

    try {
      await rejectRequest.mutateAsync({
        id: rejectDialog.requestId,
        rejection_reason: rejectionReason,
        admin_note: adminNote
      });
      
      toast({
        title: "Başarılı",
        description: "Bonus talebi reddedildi.",
      });

      setRejectDialog({ open: false });
      setRejectionReason("");
      setAdminNote("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Bonus talebi reddedilirken bir hata oluştu.",
        variant: "destructive"
      });
    }
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="bonuses">Bonuslar ({bonuses.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Talepler ({pendingRequests?.length || 0})
            {(pendingRequests?.length || 0) > 0 && (
              <Badge className="ml-2 bg-yellow-500 text-xs">!</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bonuses" className="space-y-4">

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
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Bonus Talepleri ({pendingRequests?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests?.map((request) => {
                  const config = BONUS_TYPES[request.bonus_type as keyof typeof BONUS_TYPES];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-full ${config.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{config.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              Kullanıcı ID: {request.user_id} • {new Date(request.created_at).toLocaleDateString('tr-TR')}
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                              {request.requested_amount && (
                                <div>
                                  <span className="font-medium">Talep: </span>
                                  {request.requested_amount} TL
                                </div>
                              )}
                              {request.loss_amount && (
                                <div>
                                  <span className="font-medium">Kayıp: </span>
                                  {request.loss_amount} TL
                                </div>
                              )}
                              {request.deposit_amount && (
                                <div>
                                  <span className="font-medium">Yatırım: </span>
                                  {request.deposit_amount} TL
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setApproveDialog({ open: true, requestId: request.id })}
                            size="sm"
                            variant="default"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Onayla
                          </Button>
                          <Button
                            onClick={() => setRejectDialog({ open: true, requestId: request.id })}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reddet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
                {(!pendingRequests || pendingRequests.length === 0) && (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Bekleyen bonus talebi bulunmuyor.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BonusFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleModalSave}
        bonus={editingBonus}
        mode={editingBonus ? 'edit' : 'create'}
      />

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open })} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bonus Talebini Onayla</DialogTitle>
            <DialogDescription>
              Bu bonus talebini onaylamak istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-note">Admin Notu (Opsiyonel)</Label>
              <Textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Onay ile ilgili notunuz..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1">
                Onayla
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setApproveDialog({ open: false })}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bonus Talebini Reddet</DialogTitle>
            <DialogDescription>
              Bu bonus talebini reddetmek için bir sebep belirtmelisiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Red Sebebi *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reddedilme sebebini açıklayın..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="admin-note-reject">Admin Notu (Opsiyonel)</Label>
              <Textarea
                id="admin-note-reject"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ek notlar..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleReject} 
                variant="destructive"
                className="flex-1"
                disabled={!rejectionReason.trim()}
              >
                Reddet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRejectDialog({ open: false })}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBonuses;