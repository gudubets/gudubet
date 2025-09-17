import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useI18n } from '@/hooks/useI18n';

const NotificationPermissionBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const { isSupported, permissionStatus, requestPermissions } = usePushNotifications();
  const { currentLanguage } = useI18n();

  // Don't show if not supported, already granted, or dismissed
  if (!isSupported || permissionStatus.receive === 'granted' || dismissed) {
    return null;
  }

  const handleRequestPermissions = async () => {
    await requestPermissions();
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification-banner-dismissed', 'true');
  };

  // Check if previously dismissed
  React.useEffect(() => {
    const wasDismissed = localStorage.getItem('notification-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none border-b">
      <Bell className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="mr-4">
          {currentLanguage === 'tr' 
            ? 'Bonus ve promosyon bildirimlerini kaçırmayın! Bildirimleri etkinleştirin.'
            : 'Don\'t miss bonus and promotion notifications! Enable notifications.'
          }
        </span>
        <div className="flex space-x-2">
          <Button 
            onClick={handleRequestPermissions}
            size="sm"
            variant="default"
          >
            {currentLanguage === 'tr' ? 'Etkinleştir' : 'Enable'}
          </Button>
          <Button 
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NotificationPermissionBanner;