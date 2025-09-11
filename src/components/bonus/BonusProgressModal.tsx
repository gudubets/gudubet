import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Target, TrendingUp } from 'lucide-react';
import { useBonusProgress } from '@/hooks/useBonuses';
import { BONUS_STATUS_LABELS } from '@/lib/types/bonus';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface BonusProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBonusId: string;
}

export const BonusProgressModal: React.FC<BonusProgressModalProps> = ({
  isOpen,
  onClose,
  userBonusId
}) => {
  const { data: bonusProgress, isLoading } = useBonusProgress(userBonusId);
  
  // Type assertion to handle missing TypeScript definitions
  const progress = bonusProgress as any;

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!progress) {
    return null;
  }

  const progressPercentage = progress.progress_percentage || 0;
  const timeRemaining = progress.expires_at 
    ? Math.max(0, Math.ceil((new Date(progress.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {progress.bonuses_new?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Bonus Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Durum</span>
                    <Badge variant={progress.status === 'active' ? 'default' : 'secondary'}>
                      {BONUS_STATUS_LABELS[progress.status] || progress.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verilen Miktar</span>
                    <p className="font-medium">{progress.granted_amount} {progress.currency}</p>
                  </div>

                  {timeRemaining !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Kalan Süre
                      </span>
                      <p className="font-medium">{timeRemaining} gün</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  İlerleme Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tamamlanan</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tamamlanan</p>
                      <p className="font-medium">{progress.progress || 0} {progress.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kalan</p>
                      <p className="font-medium">{progress.remaining_rollover} {progress.currency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bonus Rules - Simplified to avoid type errors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bonus Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Bonus Türü</p>
                  <p className="font-medium">{progress.bonuses_new?.type || 'Bilinmiyor'}</p>
                </div>
                
                {progress.bonuses_new?.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Açıklama</p>
                    <p className="text-sm">{progress.bonuses_new.description}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Çevrim Şartı</p>
                  <p className="font-medium">{progress.bonuses_new?.rollover_multiplier || 0}x</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Son Aktiviteler</CardTitle>
            </CardHeader>
            <CardContent>
              {progress.recent_events && progress.recent_events.length > 0 ? (
                <div className="space-y-2">
                  {progress.recent_events.slice(0, 5).map((event: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{event.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.occurred_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz aktivite bulunmuyor</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};