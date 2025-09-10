import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import { useKYC, KYCLimitCheck } from '@/hooks/useKYC';
import KYCVerificationModal from './KYCVerificationModal';
import { useI18n } from '@/hooks/useI18n';

interface WithdrawalLimitCheckProps {
  amount: number;
  onLimitCheck: (allowed: boolean, reason?: string) => void;
  className?: string;
}

const WithdrawalLimitCheck: React.FC<WithdrawalLimitCheckProps> = ({
  amount,
  onLimitCheck,
  className = ''
}) => {
  const { t } = useI18n();
  const { userKYCLevel, checkWithdrawalLimit, getKYCLevelName } = useKYC();
  const [limitCheck, setLimitCheck] = useState<KYCLimitCheck | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (amount > 0) {
      checkLimits();
    } else {
      setLimitCheck(null);
      onLimitCheck(true);
    }
  }, [amount]);

  const checkLimits = async () => {
    if (amount <= 0) return;
    
    setLoading(true);
    try {
      const result = await checkWithdrawalLimit(amount);
      setLimitCheck(result);
      
      if (result) {
        onLimitCheck(result.allowed, result.reason);
      }
    } catch (error) {
      console.error('Error checking withdrawal limits:', error);
      onLimitCheck(false, 'Error checking limits');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLimitMessage = (reason?: string) => {
    switch (reason) {
      case 'daily_limit_exceeded':
        return t('kyc.limits.dailyExceeded', 'Daily withdrawal limit exceeded');
      case 'monthly_limit_exceeded':
        return t('kyc.limits.monthlyExceeded', 'Monthly withdrawal limit exceeded');
      case 'yearly_limit_exceeded':
        return t('kyc.limits.yearlyExceeded', 'Yearly withdrawal limit exceeded');
      default:
        return t('kyc.limits.general', 'Withdrawal limit exceeded');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm">{t('kyc.checkingLimits', 'Checking limits...')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limitCheck || amount <= 0) return null;

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            {t('kyc.withdrawalLimits', 'Withdrawal Limits')} - {getKYCLevelName(limitCheck.kyc_level)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!limitCheck.allowed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {getLimitMessage(limitCheck.reason)}
              </AlertDescription>
            </Alert>
          )}

          {/* Daily Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>{t('kyc.dailyLimit', 'Daily Limit')}</span>
              <span>₺{limitCheck.daily_used.toLocaleString()} / ₺{limitCheck.daily_limit.toLocaleString()}</span>
            </div>
            <Progress 
              value={(limitCheck.daily_used / limitCheck.daily_limit) * 100}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {t('kyc.remaining', 'Remaining')}: ₺{limitCheck.daily_remaining.toLocaleString()}
            </div>
          </div>

          {/* Monthly Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>{t('kyc.monthlyLimit', 'Monthly Limit')}</span>
              <span>₺{limitCheck.monthly_used.toLocaleString()} / ₺{limitCheck.monthly_limit.toLocaleString()}</span>
            </div>
            <Progress 
              value={(limitCheck.monthly_used / limitCheck.monthly_limit) * 100}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {t('kyc.remaining', 'Remaining')}: ₺{limitCheck.monthly_remaining.toLocaleString()}
            </div>
          </div>

          {/* Yearly Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>{t('kyc.yearlyLimit', 'Yearly Limit')}</span>
              <span>₺{limitCheck.yearly_used.toLocaleString()} / ₺{limitCheck.yearly_limit.toLocaleString()}</span>
            </div>
            <Progress 
              value={(limitCheck.yearly_used / limitCheck.yearly_limit) * 100}
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {t('kyc.remaining', 'Remaining')}: ₺{limitCheck.yearly_remaining.toLocaleString()}
            </div>
          </div>

          {(userKYCLevel === 'level_0' || !limitCheck.allowed) && (
            <div className="pt-2 border-t">
              <Button
                onClick={() => setShowKYCModal(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {userKYCLevel === 'level_0' 
                  ? t('kyc.startVerification', 'Start KYC Verification')
                  : t('kyc.increaseLimits', 'Increase Limits')
                }
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <KYCVerificationModal 
        forceOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
      >
        <div />
      </KYCVerificationModal>
    </>
  );
};

export default WithdrawalLimitCheck;