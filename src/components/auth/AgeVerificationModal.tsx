import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, Phone } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerify: (isAdult: boolean) => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onVerify,
}) => {
  const { t } = useI18n();

  const handleAgeConfirm = (isAdult: boolean) => {
    if (!isAdult) {
      // Redirect away from site for minors
      window.location.href = 'https://www.google.com';
      return;
    }
    onVerify(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto bg-white border-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Yaş Doğrulama</DialogTitle>
        <DialogDescription className="sr-only">18 yaş üzeri doğrulama modalı</DialogDescription>
        {/* Header */}
        <div className="bg-white p-6 border-b border-border">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive mr-3" />
            <h2 className="text-xl font-bold text-destructive">
              {t('ageVerification.title', 'Yaş Doğrulama Gerekli')}
            </h2>
          </div>
          
          {/* 18+ Warning */}
          <div className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">18+</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('ageVerification.restriction', 'Bu site yalnızca 18 yaş ve üzeri kişiler içindir')}
              </p>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-8 w-8 text-orange-500" />
            <p className="text-sm text-muted-foreground">
              {t('ageVerification.description', 'Bu platform kumar ve bahis içeriği sunmaktadır. Devam etmek için 18 yaşında veya daha büyük olduğunuzu onaylamanız gerekmektedir.')}
            </p>
          </div>

          {/* Legal Warning */}
          <Card className="mb-4 p-4 bg-orange-50 border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">
              {t('ageVerification.legalWarning', 'Yasal Uyarı:')}
            </h3>
            <p className="text-sm text-orange-700">
              {t('ageVerification.legalText', 'Türkiye Cumhuriyeti yasalarına göre, 18 yaşından küçük kişilerin kumar oynaması yasaktır.')}
            </p>
          </Card>

          {/* Responsible Gambling */}
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">
              {t('ageVerification.responsibleGambling', 'Sorumlu Kumar')}
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              {t('ageVerification.responsibleText', 'Kumar bağımlılığı ciddi bir sorundur. Yardım almak için:')}
            </p>
            <div className="space-y-1 text-sm text-blue-600">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{t('ageVerification.helpline', 'Kumar Bağımlıları Anonim: 0212 123 45 67')}</span>
              </div>
              <p>• {t('ageVerification.healthMinistry', 'Sağlık Bakanlığı ALO 184')}</p>
              <p>• {t('ageVerification.supportCenters', 'Kumar bağımlılığı ile mücadele merkezleri')}</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleAgeConfirm(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              ✓ {t('ageVerification.confirmAdult', '18 yaşında veya daha büyüğüm')}
            </Button>
            
            <Button
              onClick={() => handleAgeConfirm(false)}
              variant="destructive"
              className="w-full"
            >
              ✗ {t('ageVerification.confirmMinor', '18 yaşından küçüğüm')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('ageVerification.footer', 'Bu siteye erişim, yasal yaşta olduğunuzu kabul ettiğiniz anlamına gelir.')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};