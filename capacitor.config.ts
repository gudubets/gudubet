import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.db90054b9366405abba99d12e13c0672',
  appName: 'gudubet',
  webDir: 'dist',
  server: {
    url: 'https://db90054b-9366-405a-bba9-9d12e13c0672.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;