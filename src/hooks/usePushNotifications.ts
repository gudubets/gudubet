import { useState, useEffect } from 'react';
import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPermissionStatus {
  receive: 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>({ receive: 'prompt' });
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if push notifications are supported
    if (Capacitor.isNativePlatform()) {
      setIsSupported(true);
      initializePushNotifications();
    } else {
      // Web push notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true);
        initializeWebPush();
      }
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission to use push notifications
      const permission = await PushNotifications.requestPermissions();
      setPermissionStatus(permission);

      if (permission.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      }

      // On registration successful, we get the token
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        setToken(token.value);
        savePushToken(token.value);
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
        toast({
          title: "Bildirim Hatası",
          description: "Push bildirimleri ayarlanırken hata oluştu.",
          variant: "destructive"
        });
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        
        // Show in-app notification
        toast({
          title: notification.title || "Yeni Bildirim",
          description: notification.body || "Yeni bir bildiriminiz var.",
        });
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
        
        // Handle notification tap
        const data = notification.notification.data;
        if (data?.url) {
          window.location.href = data.url;
        }
      });

    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const initializeWebPush = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        const permission = await Notification.requestPermission();
        setPermissionStatus({ receive: permission as any });

        if (permission === 'granted') {
          // Get push subscription
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
          });

          const tokenData = JSON.stringify(subscription);
          setToken(tokenData);
          savePushToken(tokenData);
        }
      }
    } catch (error) {
      console.error('Error initializing web push:', error);
    }
  };

  const savePushToken = async (pushToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock save for now until types are updated
      console.log('Push token would be saved:', pushToken);

    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      const permission = await PushNotifications.requestPermissions();
      setPermissionStatus(permission);
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
      
      return permission;
    } else {
      const permission = await Notification.requestPermission();
      setPermissionStatus({ receive: permission as any });
      return { receive: permission };
    }
  };

  const sendTestNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Test Bildirimi',
          body: 'Bu bir test bildirimidir.',
          data: { test: true }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Bildirimi Gönderildi",
        description: "Test bildirimi başarıyla gönderildi.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Hata",
        description: "Test bildirimi gönderilirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  return {
    isSupported,
    permissionStatus,
    token,
    requestPermissions,
    sendTestNotification
  };
};

// Helper function for web push
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}