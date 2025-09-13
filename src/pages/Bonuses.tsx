import React from 'react';
import { useAvailableBonuses, useUserBonuses, useClaimBonus } from '@/hooks/useBonuses';
import { useMyBonusRequests } from '@/hooks/useBonusRequests';
import { BonusCard } from '@/components/bonus/BonusCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Gift, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BONUS_STATUS_LABELS } from '@/lib/types/bonus';

export const Bonuses: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [bonusCode, setBonusCode] = React.useState('');
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);
  
  const { data: availableBonuses, isLoading: loadingAvailable } = useAvailableBonuses();
  const { data: userBonuses, isLoading: loadingUserBonuses } = useUserBonuses(user?.id);
  const { data: bonusRequests, isLoading: loadingRequests } = useMyBonusRequests();
  const claimBonus = useClaimBonus();

    const handleClaimBonus = (bonusId: string, requiresCode: boolean = false) => {
      if (requiresCode && !bonusCode.trim()) {
        toast({
          title: "Hata",
          description: "Bonus kodu gereklidir.",
          variant: "destructive"
        });
        return;
      }

      claimBonus.mutate({
        bonus_id: bonusId,
        code: requiresCode ? bonusCode : undefined
      }, {
        onSuccess: () => {
          toast({
            title: "Başarılı",
            description: "Bonus talebi oluşturuldu. Admin onayı bekleniyor.",
          });
          setBonusCode('');
        },
        onError: (error: any) => {
          toast({
            title: "Hata",
            description: error.message || "Bonus talebi oluşturulurken bir hata oluştu.",
            variant: "destructive"
          });
        }
      });
    };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'forfeited':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Gift className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loadingAvailable || loadingUserBonuses || loadingRequests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bonuslar</h1>
        <p className="text-muted-foreground">
          Bonus taleplerini görüntüleyin ve talep edebileceğiniz bonusları keşfedin
        </p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Mevcut Bonuslar</TabsTrigger>
          <TabsTrigger value="requests">Taleplerим</TabsTrigger>
          <TabsTrigger value="my-bonuses">Aktif Bonuslar</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Bonus Kodu ile Al
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="bonus-code">Bonus Kodu</Label>
                    <Input
                      id="bonus-code"
                      placeholder="Bonus kodunuzu girin..."
                      value={bonusCode}
                      onChange={(e) => setBonusCode(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => {
                        // Find bonus by code and claim it
                        const bonusWithCode = availableBonuses?.find(b => 
                          b.requires_code && b.code?.toLowerCase() === bonusCode.toLowerCase()
                        );
                        if (bonusWithCode) {
                          handleClaimBonus(bonusWithCode.id, true);
                        } else {
                          toast({
                            title: "Hata",
                            description: "Geçersiz bonus kodu",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={!bonusCode.trim() || claimBonus.isPending}
                    >
                      {claimBonus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Talep Et'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBonuses?.filter(bonus => !bonus.requires_code).map((bonus) => (
                <BonusCard
                  key={bonus.id}
                  bonus={bonus}
                  onClaim={() => handleClaimBonus(bonus.id)}
                />
              ))}
            </div>

            {availableBonuses?.filter(bonus => !bonus.requires_code).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Şu anda mevcut bonus yok</h3>
                  <p className="text-muted-foreground">
                    Yeni bonus teklifleri için düzenli olarak kontrol edin
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Taleplerим</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bonusRequests?.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold capitalize">
                            {request.bonus_type.replace('_', ' ')} Bonusu
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'approved' ? 'default' : 'destructive'
                          }
                        >
                          {request.status === 'pending' ? 'Beklemede' :
                           request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </Badge>
                      </div>
                      
                      {request.requested_amount && (
                        <p className="text-sm">
                          <span className="font-medium">Talep Edilen:</span> {request.requested_amount} TL
                        </p>
                      )}
                      
                      {request.deposit_amount && (
                        <p className="text-sm">
                          <span className="font-medium">Yatırım Miktarı:</span> {request.deposit_amount} TL
                        </p>
                      )}
                      
                      {request.admin_note && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Admin Notu:</span> {request.admin_note}
                          </p>
                        </div>
                      )}
                      
                      {request.rejection_reason && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-destructive">
                            <span className="font-medium">Red Sebebi:</span> {request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {(!bonusRequests || bonusRequests.length === 0) && (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Henüz bonus talebi yapmadınız</h3>
                      <p className="text-muted-foreground mb-4">
                        Mevcut bonuslara göz atın ve talepte bulunun
                      </p>
                      <Button 
                        onClick={() => {
                          const availableTab = document.querySelector('[value="available"]') as HTMLElement;
                          availableTab?.click();
                        }}
                      >
                        Mevcut Bonuslara Bak
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-bonuses">
          <div className="space-y-6">
            {userBonuses && userBonuses.length > 0 ? (
              <div className="grid gap-6">
                {userBonuses.map((userBonus) => (
                  <Card key={userBonus.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getStatusIcon(userBonus.status)}
                          {userBonus.bonuses_new?.name}
                        </CardTitle>
                        <Badge variant={
                          userBonus.status === 'active' ? 'default' :
                          userBonus.status === 'completed' ? 'secondary' :
                          'destructive'
                        }>
                          {BONUS_STATUS_LABELS[userBonus.status]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Verilen Miktar</p>
                          <p className="text-lg font-semibold">{userBonus.granted_amount} {userBonus.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Kalan Çevrim</p>
                          <p className="text-lg font-semibold">{userBonus.remaining_rollover.toFixed(2)} {userBonus.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">İlerleme</p>
                          <p className="text-lg font-semibold">{userBonus.progress.toFixed(2)} {userBonus.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Son Güncelleme</p>
                          <p className="text-sm">{new Date(userBonus.updated_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>

                      {userBonus.status === 'active' && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Çevrim İlerlemesi</span>
                            <span>{((userBonus.progress / (userBonus.progress + userBonus.remaining_rollover)) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${((userBonus.progress / (userBonus.progress + userBonus.remaining_rollover)) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {userBonus.expires_at && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground">
                            Son Kullanma: {new Date(userBonus.expires_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Henüz bonus almadınız</h3>
                  <p className="text-muted-foreground mb-4">
                    Mevcut bonuslara göz atın ve size uygun olanları alın
                  </p>
                  <Button 
                    onClick={() => {
                      const availableTab = document.querySelector('[value="available"]') as HTMLElement;
                      availableTab?.click();
                    }}
                  >
                    Mevcut Bonuslara Bak
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};