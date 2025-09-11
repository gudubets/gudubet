import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBonusProgress } from '@/hooks/useBonuses';
import { Clock, TrendingUp, Gift, CheckCircle, AlertCircle } from 'lucide-react';
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

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!bonusProgress) {
    return null;
  }

  const progressPercentage = bonusProgress.progress_percentage || 0;
  const timeRemaining = bonusProgress.expires_at 
    ? Math.max(0, Math.ceil((new Date(bonusProgress.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus Detayları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Durum
                  <Badge variant={
                    bonusProgress.status === 'active' ? 'default' :
                    bonusProgress.status === 'completed' ? 'secondary' :
                    'destructive'
                  }>
                    {BONUS_STATUS_LABELS[bonusProgress.status]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verilen Miktar:</span>
                    <span className="font-medium">{bonusProgress.granted_amount} {bonusProgress.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tamamlanma:</span>
                    <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  </div>
                  {timeRemaining && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Kalan Süre:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeRemaining} gün
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Çevrim İlerlemesi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tamamlanan</p>
                      <p className="font-medium">{bonusProgress.progress} {bonusProgress.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kalan</p>
                      <p className="font-medium">{bonusProgress.remaining_rollover} {bonusProgress.currency}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bonus Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bonus Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Bonus detayları ve kuralları burada görüntülenecek.
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
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {bonusProgress.recent_events?.map((event, index) => (
                    <div key={event.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {event.type === 'bonus_granted' && <Gift className="h-4 w-4 text-green-500" />}
                        {event.type === 'wager_placed' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                        {event.type === 'bonus_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {event.type === 'manual_review_triggered' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {event.type === 'bonus_granted' && 'Bonus Verildi'}
                            {event.type === 'wager_placed' && 'Bahis Yapıldı'}
                            {event.type === 'bonus_progressed' && 'İlerleme Kaydedildi'}
                            {event.type === 'bonus_completed' && 'Bonus Tamamlandı'}
                            {event.type === 'manual_review_triggered' && 'Manuel İnceleme Gerekli'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(event.occurred_at), 'dd MMM HH:mm', { locale: tr })}
                          </span>
                        </div>
                        {event.payload && Object.keys(event.payload).length > 0 && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {(event.payload as any)?.amount && (
                              <span>Miktar: {(event.payload as any).amount} {bonusProgress.currency}</span>
                            )}
                            {(event.payload as any)?.contribution && (
                              <span> • Katkı: {(event.payload as any).contribution} {bonusProgress.currency}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!bonusProgress.recent_events || bonusProgress.recent_events.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>Henüz aktivite bulunmuyor</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};