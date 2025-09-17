import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Settings, Globe } from 'lucide-react';

interface GameProviderStatusBadgeProps {
  status: 'active' | 'inactive' | 'maintenance';
  connectionStatus?: 'demo_mode' | 'connected' | 'failed' | 'unknown';
  hasApiKey?: boolean;
}

export const GameProviderStatusBadge: React.FC<GameProviderStatusBadgeProps> = ({
  status,
  connectionStatus,
  hasApiKey = false
}) => {
  const getStatusConfig = () => {
    // First check connection status if available
    if (connectionStatus) {
      switch (connectionStatus) {
        case 'demo_mode':
          return {
            variant: 'secondary' as const,
            text: 'Demo Modu',
            icon: <Settings className="w-3 h-3" />,
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
          };
        case 'connected':
          return {
            variant: 'default' as const,
            text: 'Bağlı',
            icon: <Wifi className="w-3 h-3" />,
            className: 'bg-green-100 text-green-800 border-green-200'
          };
        case 'failed':
          return {
            variant: 'destructive' as const,
            text: 'Bağlantı Hatası',
            icon: <WifiOff className="w-3 h-3" />,
            className: 'bg-red-100 text-red-800 border-red-200'
          };
      }
    }

    // Fall back to general status
    switch (status) {
      case 'active':
        return {
          variant: hasApiKey ? 'default' as const : 'secondary' as const,
          text: hasApiKey ? 'Aktif' : 'Demo',
          icon: hasApiKey ? <Globe className="w-3 h-3" /> : <Settings className="w-3 h-3" />,
          className: hasApiKey 
            ? 'bg-green-100 text-green-800 border-green-200'
            : 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'maintenance':
        return {
          variant: 'secondary' as const,
          text: 'Bakımda',
          icon: <Settings className="w-3 h-3" />,
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'inactive':
      default:
        return {
          variant: 'destructive' as const,
          text: 'Pasif',
          icon: <WifiOff className="w-3 h-3" />,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 ${config.className}`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
};