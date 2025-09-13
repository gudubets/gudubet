import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Gift, TrendingUp, Percent } from "lucide-react";
import type { Bonus, UserBonus } from "@/lib/types/bonus";
import { BONUS_TYPE_LABELS, BONUS_STATUS_LABELS } from "@/lib/types/bonus";
import { cn } from "@/lib/utils";

interface BonusCardProps {
  bonus: Bonus;
  userBonus?: UserBonus;
  onClaim?: (bonusId: string) => void;
  onViewDetails?: (bonusId: string) => void;
  className?: string;
}

export const BonusCard: React.FC<BonusCardProps> = ({
  bonus,
  userBonus,
  onClaim,
  onViewDetails,
  className
}) => {
  const formatAmount = (amount: number, type: string) => {
    if (type === 'percent') {
      return `%${amount}`;
    }
    return `${amount} TL`;
  };

  const formatTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Süresi doldu";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  const getProgressPercentage = () => {
    if (!userBonus || userBonus.remaining_rollover <= 0) return 100;
    
    const total = userBonus.progress + userBonus.remaining_rollover;
    return (userBonus.progress / total) * 100;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'eligible':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-purple-500';
      case 'expired':
        return 'bg-gray-500';
      case 'forfeited':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'FIRST_DEPOSIT':
        return <Gift className="h-5 w-5" />;
      case 'RELOAD':
        return <TrendingUp className="h-5 w-5" />;
      case 'CASHBACK':
        return <Percent className="h-5 w-5" />;
      case 'FREEBET':
        return <Gift className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const timeRemaining = formatTimeRemaining(userBonus?.expires_at);
  const progressPercentage = getProgressPercentage();

  return (
    <Card className={cn("group hover:shadow-lg transition-shadow duration-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "p-2 rounded-lg",
              bonus.type === 'FIRST_DEPOSIT' && "bg-blue-100 text-blue-600",
              bonus.type === 'RELOAD' && "bg-green-100 text-green-600",
              bonus.type === 'CASHBACK' && "bg-orange-100 text-orange-600",
              bonus.type === 'FREEBET' && "bg-purple-100 text-purple-600"
            )}>
              {getBonusIcon(bonus.type)}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{bonus.name}</CardTitle>
              <CardDescription className="text-sm">
                {BONUS_TYPE_LABELS[bonus.type]}
              </CardDescription>
            </div>
          </div>
          
          {userBonus && (
            <Badge 
              variant="secondary" 
              className={cn("text-white", getStatusColor(userBonus.status))}
            >
              {BONUS_STATUS_LABELS[userBonus.status]}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bonus Amount */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Bonus Miktarı</span>
          <span className="text-lg font-bold text-primary">
            {formatAmount(bonus.amount_value, bonus.amount_type)}
            {bonus.max_cap && (
              <span className="text-sm text-muted-foreground ml-1">
                (Max: {bonus.max_cap} TL)
              </span>
            )}
          </span>
        </div>

        {/* Minimum Deposit */}
        {bonus.min_deposit > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span>Min. Yatırım</span>
            <span className="font-medium">{bonus.min_deposit} TL</span>
          </div>
        )}

        {/* Rollover Requirement */}
        {bonus.rollover_multiplier > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span>Çevrim Şartı</span>
            <span className="font-medium">{bonus.rollover_multiplier}x</span>
          </div>
        )}

        {/* Progress for active bonuses */}
        {userBonus && userBonus.status === 'active' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>İlerleme</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{userBonus.progress.toFixed(2)} TL</span>
              <span>{userBonus.remaining_rollover.toFixed(2)} TL kaldı</span>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        {timeRemaining && userBonus?.status === 'active' && (
          <div className="flex items-center space-x-2 text-sm text-orange-600">
            <Clock className="h-4 w-4" />
            <span>{timeRemaining}</span>
          </div>
        )}

        {/* Description */}
        {bonus.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bonus.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {!userBonus && onClaim && (
            <Button 
              onClick={() => onClaim(bonus.id)}
              className="flex-1"
              disabled={!bonus.is_active}
            >
              {bonus.requires_code ? 'Kodu Gir' : 'Talep Et'}
            </Button>
          )}
          
          {onViewDetails && (
            <Button 
              variant="outline" 
              onClick={() => onViewDetails(bonus.id)}
              className={cn(!userBonus && onClaim ? "flex-none" : "flex-1")}
            >
              Detaylar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};