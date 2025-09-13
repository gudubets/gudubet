import { useState } from "react";
import { useAdminBonusRequests, useApproveBonusRequest, useRejectBonusRequest, useUpdateVIPLevel } from "../../../hooks/useBonusRequests";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Calendar, HandHeart, Coins, Trophy, CreditCard, Check, X, Crown } from "lucide-react";

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

const VIP_LEVELS = {
  bronze: { label: "Bronze", color: "bg-orange-600" },
  silver: { label: "Silver", color: "bg-slate-400" },
  gold: { label: "Gold", color: "bg-yellow-500" },
  platinum: { label: "Platinum", color: "bg-purple-500" },
  diamond: { label: "Diamond", color: "bg-blue-500" }
};

export default function BonusRequests() {
  const [selectedTab, setSelectedTab] = useState("pending");
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; requestId?: string }>({ open: false });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId?: string }>({ open: false });
  const [vipDialog, setVipDialog] = useState<{ open: boolean; userId?: string }>({ open: false });
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedVipLevel, setSelectedVipLevel] = useState<string>("");

  const { toast } = useToast();
  const { data: requests, isLoading } = useAdminBonusRequests(
    selectedTab === "all" ? undefined : selectedTab as 'pending' | 'approved' | 'rejected'
  );
  const approveRequest = useApproveBonusRequest();
  const rejectRequest = useRejectBonusRequest();
  const updateVipLevel = useUpdateVIPLevel();

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

  const handleVipUpdate = async () => {
    if (!vipDialog.userId || !selectedVipLevel) return;

    try {
      await updateVipLevel.mutateAsync({
        userId: vipDialog.userId,
        vipLevel: selectedVipLevel as any
      });
      
      toast({
        title: "Başarılı",
        description: "VIP seviyesi güncellendi.",
      });

      setVipDialog({ open: false });
      setSelectedVipLevel("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "VIP seviyesi güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bonus Talepleri Yönetimi</h1>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">Bekleyen ({requests?.filter(r => r.status === 'pending').length || 0})</TabsTrigger>
          <TabsTrigger value="approved">Onaylanan</TabsTrigger>
          <TabsTrigger value="rejected">Reddedilen</TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {requests?.map((request) => {
            const config = BONUS_TYPES[request.bonus_type as keyof typeof BONUS_TYPES];
            const Icon = config.icon;
            
            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${config.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                        <CardDescription>
                          Kullanıcı ID: {request.user_id} • {new Date(request.created_at).toLocaleDateString('tr-TR')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[request.status]}>
                        {STATUS_LABELS[request.status]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                    {request.requested_amount && (
                      <div>
                        <span className="font-medium">Talep Edilen:</span>
                        <p>{request.requested_amount} TL</p>
                      </div>
                    )}
                    {request.loss_amount && (
                      <div>
                        <span className="font-medium">Kayıp Miktarı:</span>
                        <p>{request.loss_amount} TL</p>
                      </div>
                    )}
                    {request.deposit_amount && (
                      <div>
                        <span className="font-medium">Yatırım Miktarı:</span>
                        <p>{request.deposit_amount} TL</p>
                      </div>
                    )}
                  </div>
                  
                  {request.admin_note && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <span className="font-medium">Admin Not:</span>
                      <p className="text-sm mt-1">{request.admin_note}</p>
                    </div>
                  )}
                  
                  {request.rejection_reason && (
                    <div className="mb-4 p-3 bg-destructive/10 rounded-lg">
                      <span className="font-medium text-destructive">Red Sebebi:</span>
                      <p className="text-sm mt-1">{request.rejection_reason}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
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
                      <Button
                        onClick={() => setVipDialog({ open: true, userId: request.user_id })}
                        size="sm"
                        variant="outline"
                      >
                        <Crown className="h-4 w-4 mr-1" />
                        VIP Güncelle
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {requests?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Bu kategoride bonus talebi bulunmuyor.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open })}>
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

      {/* VIP Level Update Dialog */}
      <Dialog open={vipDialog.open} onOpenChange={(open) => setVipDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>VIP Seviyesi Güncelle</DialogTitle>
            <DialogDescription>
              Kullanıcının VIP seviyesini değiştirin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="vip-level">VIP Seviyesi</Label>
              <Select value={selectedVipLevel} onValueChange={setSelectedVipLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="VIP seviyesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VIP_LEVELS).map(([level, config]) => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVipUpdate} 
                className="flex-1"
                disabled={!selectedVipLevel}
              >
                Güncelle
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setVipDialog({ open: false })}
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
}