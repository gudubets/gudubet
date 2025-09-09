import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play, Settings } from 'lucide-react';

interface GameProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  gameCount: number;
  provider_type: 'external' | 'custom';
  api_endpoint?: string;
  logo_url?: string;
}

interface GameProviderManagerProps {
  providers: GameProvider[];
  onConfigureProvider: (providerId: string) => void;
  onTestProvider: (providerId: string) => void;
}

export const GameProviderManager: React.FC<GameProviderManagerProps> = ({
  providers,
  onConfigureProvider,
  onTestProvider
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'maintenance': return 'Bakımda';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Oyun Sağlayıcı Yönetimi</h2>
        <Button>
          <ExternalLink className="mr-2 h-4 w-4" />
          Yeni Sağlayıcı Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {provider.logo_url && (
                    <img 
                      src={provider.logo_url} 
                      alt={provider.name}
                      className="w-8 h-8 rounded"
                    />
                  )}
                  <CardTitle className="text-lg">{provider.name}</CardTitle>
                </div>
                <Badge 
                  className={`${getStatusColor(provider.status)} text-white`}
                >
                  {getStatusText(provider.status)}
                </Badge>
              </div>
              <CardDescription>
                {provider.gameCount} oyun • {provider.provider_type === 'external' ? 'Harici' : 'Özel'} Sağlayıcı
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {provider.api_endpoint && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">API:</span> {provider.api_endpoint}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTestProvider(provider.id)}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Test Et
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigureProvider(provider.id)}
                    className="flex-1"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <ExternalLink className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz sağlayıcı yok</h3>
            <p>Oyun sağlayıcıları ekleyerek oyun portföyünüzü genişletin.</p>
          </div>
        </div>
      )}
    </div>
  );
};