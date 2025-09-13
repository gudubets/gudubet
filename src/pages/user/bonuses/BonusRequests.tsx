import { useState } from "react";
import { useMyBonusRequests, useCreateBonusRequest, useBonusEligibility } from "../../../hooks/useBonusRequests";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Calendar, HandHeart, Coins, Trophy, CreditCard } from "lucide-react";

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

export default function BonusRequests() {
  const [selectedBonusType, setSelectedBonusType] = useState<string | null>(null);
  const [requestAmount, setRequestAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { data: requests, isLoading } = useMyBonusRequests();
  const createRequest = useCreateBonusRequest();
  const eligibility = useBonusEligibility();

  const handleCreateRequest = async () => {
    if (!selectedBonusType) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Get user profile to get user_id from profiles table (users yerine profiles)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id) // auth user id ile profile id aynı
        .single();

      if (!profile) throw new Error("Kullanıcı profili bulunamadı");

      let requestData: any = {
        user_id: profile.id,
        bonus_type: selectedBonusType
      };

      // Add specific data based on bonus type
      if (selectedBonusType === 'cashback') {
        const losses = await eligibility.calculateUserLosses(profile.id);
        requestData.loss_amount = losses;
      }

      if (['freebet', 'deposit'].includes(selectedBonusType) && depositAmount) {
        requestData.deposit_amount = parseFloat(depositAmount);
      }

      if (requestAmount) {
        requestData.requested_amount = parseFloat(requestAmount);
      }

      await createRequest.mutateAsync(requestData);
      
      toast({
        title: "Başarılı",
        description: "Bonus talebiniz gönderildi.",
      });

      setIsDialogOpen(false);
      setSelectedBonusType(null);
      setRequestAmount("");
      setDepositAmount("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Bonus talebi gönderilirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bonus Talepleri</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Bonus Talebi</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bonus Talebi Oluştur</DialogTitle>
              <DialogDescription>
                Hangi bonus türü için talepte bulunmak istiyorsunuz?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(BONUS_TYPES).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <Card 
                      key={type}
                      className={`cursor-pointer transition-colors ${
                        selectedBonusType === type ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedBonusType(type)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{config.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedBonusType && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amount">Talep Edilen Miktar (TL)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="Bonus miktarı"
                    />
                  </div>

                  {['freebet', 'deposit'].includes(selectedBonusType) && (
                    <div>
                      <Label htmlFor="deposit">Yatırım Miktarı (TL)</Label>
                      <Input
                        id="deposit"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Son yatırım miktarı"
                      />
                    </div>
                  )}

                  <Button onClick={handleCreateRequest} className="w-full">
                    Talebi Gönder
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
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
                        {new Date(request.created_at).toLocaleDateString('tr-TR')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[request.status]}>
                    {STATUS_LABELS[request.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <span className="font-medium">Admin Not:</span>
                    <p className="text-sm mt-1">{request.admin_note}</p>
                  </div>
                )}
                
                {request.rejection_reason && (
                  <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                    <span className="font-medium text-destructive">Red Sebebi:</span>
                    <p className="text-sm mt-1">{request.rejection_reason}</p>
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
              <p className="text-muted-foreground">Henüz bonus talebiniz bulunmuyor.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}