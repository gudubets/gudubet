import React, { useState } from 'react';
import { GameProviderManager } from '@/components/games/GameProviderManager';
import { ProviderGamesList } from '@/components/games/ProviderGamesList';
import { useGameProviders } from '@/hooks/useGameProviders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings, TestTube, Activity, AlertTriangle, List, Play, Key } from 'lucide-react';
import { toast } from 'sonner';
import { GameProviderStatusBadge } from '@/components/admin/GameProviderStatusBadge';

interface ProviderFormData {
  name: string;
  slug: string;
  provider_type: 'external' | 'custom';
  api_endpoint: string;
  api_key: string;
  status: 'active' | 'inactive' | 'maintenance';
  logo_url: string;
  website_url: string;
  is_active: boolean;
  sort_order: number;
}

interface ProviderConfig {
  demo_mode: boolean;
  supported_currencies: string[];
  supported_languages: string[];
  webhook_url: string;
  return_url: string;
}

const AdminGameProviders = () => {
  const { 
    providers, 
    loading, 
    addProvider, 
    updateProvider, 
    testProvider,
    getProviderGames,
    launchProviderGame,
    getProviderConfig,
    updateProviderConfig
  } = useGameProviders();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isGamesDialogOpen, setIsGamesDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [providerGames, setProviderGames] = useState<any[]>([]);

  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    slug: '',
    provider_type: 'external',
    api_endpoint: '',
    api_key: '',
    status: 'active',
    logo_url: '',
    website_url: '',
    is_active: true,
    sort_order: 0
  });

  const [configData, setConfigData] = useState<ProviderConfig>({
    demo_mode: true,
    supported_currencies: ['USD', 'EUR', 'TRY'],
    supported_languages: ['tr', 'en'],
    webhook_url: '',
    return_url: ''
  });

  const handleAddProvider = async () => {
    if (!formData.name || !formData.provider_type) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    // Generate slug from name if not provided
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    setIsSubmitting(true);
    try {
      await addProvider({
        ...formData,
        slug
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        slug: '',
        provider_type: 'external',
        api_endpoint: '',
        api_key: '',
        status: 'active',
        logo_url: '',
        website_url: '',
        is_active: true,
        sort_order: 0
      });
    } catch (error) {
      console.error('Provider add error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfigureProvider = async (providerId: string) => {
    setSelectedProviderId(providerId);
    
    // Load existing config
    try {
      const config = await getProviderConfig(providerId);
      if (config) {
        setConfigData({
          demo_mode: config.demo_mode,
          supported_currencies: config.supported_currencies,
          supported_languages: config.supported_languages,
          webhook_url: config.webhook_url || '',
          return_url: config.return_url || ''
        });
      }
    } catch (error) {
      console.error('Config load error:', error);
    }
    
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedProviderId) return;

    setIsSubmitting(true);
    try {
      await updateProviderConfig(selectedProviderId, configData);
      setIsConfigDialogOpen(false);
      setSelectedProviderId(null);
    } catch (error) {
      console.error('Config save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setIsTesting(providerId);
    try {
      await testProvider(providerId);
    } catch (error) {
      console.error('Provider test error:', error);
    } finally {
      setIsTesting(null);
    }
  };

  const handleGetProviderGames = async (providerId: string) => {
    setIsLoadingGames(true);
    setSelectedProviderId(providerId);
    try {
      const games = await getProviderGames(providerId);
      setProviderGames(games);
      setIsGamesDialogOpen(true);
    } catch (error) {
      console.error('Get games error:', error);
      setProviderGames([]);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const handleCloseGamesDialog = () => {
    setIsGamesDialogOpen(false);
    setSelectedProviderId(null);
    setProviderGames([]);
  };

  const handleLaunchGame = async (providerId: string, gameId: string) => {
    return await launchProviderGame(providerId, gameId);
  };

  const getProviderStats = () => {
    const stats = {
      total: providers.length,
      active: providers.filter(p => p.status === 'active').length,
      external: providers.filter(p => p.provider_type === 'external').length,
      custom: providers.filter(p => p.provider_type === 'custom').length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Sağlayıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const stats = getProviderStats();
  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Oyun Sağlayıcı Yönetimi</h1>
          <p className="text-muted-foreground">Harici ve özel oyun sağlayıcılarını yönetin</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sağlayıcı
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Oyun Sağlayıcısı Ekle</DialogTitle>
              <DialogDescription>
                Yeni bir oyun sağlayıcısı eklemek için bilgileri doldurun.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Sağlayıcı Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Pragmatic Play"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Sağlayıcı Türü</Label>
                <Select 
                  value={formData.provider_type} 
                  onValueChange={(value: 'external' | 'custom') => 
                    setFormData(prev => ({ ...prev, provider_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">Harici Sağlayıcı</SelectItem>
                    <SelectItem value="custom">Özel Sağlayıcı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
                  placeholder="https://api.provider.com"
                />
              </div>
              
              <div>
                <Label htmlFor="api_key">API Anahtarı</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="API anahtarı"
                />
              </div>
              
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://provider-website.com"
                  />
                </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddProvider} disabled={isSubmitting}>
                {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sağlayıcı</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Harici</CardTitle>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.external}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Özel</CardTitle>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.custom}</div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Grid */}
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
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {provider.provider_type === 'external' ? 'Harici' : 'Özel'} Sağlayıcı
                    </CardDescription>
                  </div>
                </div>
                <GameProviderStatusBadge 
                  status={provider.status as 'active' | 'inactive' | 'maintenance'}
                  hasApiKey={!!(provider.api_key && provider.api_key.trim())}
                />
              </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Key className="w-4 h-4" />
                  <span className="font-medium">API Key:</span> 
                  <span className={provider.api_key && provider.api_key.trim() ? 'text-green-600' : 'text-yellow-600'}>
                    {provider.api_key && provider.api_key.trim() ? 'Yapılandırıldı' : 'Demo Modu'}
                  </span>
                </div>
                
                {provider.api_endpoint && (
                  <div className="text-sm text-muted-foreground truncate">
                    <span className="font-medium">API:</span> {provider.api_endpoint}
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestProvider(provider.id)}
                    disabled={isTesting === provider.id}
                    className="w-full"
                  >
                    {isTesting === provider.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span className="sr-only">Test Et</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGetProviderGames(provider.id)}
                    disabled={isLoadingGames}
                    className="w-full"
                  >
                    {isLoadingGames ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <List className="h-4 w-4" />
                    )}
                    <span className="sr-only">Oyunları Listele</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfigureProvider(provider.id)}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Yapılandır</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Henüz sağlayıcı yok</h3>
          <p className="text-muted-foreground mb-4">
            Oyun sağlayıcıları ekleyerek oyun portföyünüzü genişletin.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            İlk Sağlayıcıyı Ekle
          </Button>
        </div>
      )}

      {/* Provider Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Sağlayıcı Yapılandırması: {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Sağlayıcı ayarlarını ve entegrasyon parametrelerini düzenleyin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Demo Modu</Label>
                <p className="text-sm text-muted-foreground">
                  Test için demo oyunları etkinleştir
                </p>
              </div>
              <Switch
                checked={configData.demo_mode}
                onCheckedChange={(checked) => 
                  setConfigData(prev => ({ ...prev, demo_mode: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="currencies">Desteklenen Para Birimleri</Label>
              <Input
                id="currencies"
                value={configData.supported_currencies.join(', ')}
                onChange={(e) => 
                  setConfigData(prev => ({ 
                    ...prev, 
                    supported_currencies: e.target.value.split(',').map(c => c.trim()) 
                  }))
                }
                placeholder="USD, EUR, TRY"
              />
            </div>
            
            <div>
              <Label htmlFor="languages">Desteklenen Diller</Label>
              <Input
                id="languages"
                value={configData.supported_languages.join(', ')}
                onChange={(e) => 
                  setConfigData(prev => ({ 
                    ...prev, 
                    supported_languages: e.target.value.split(',').map(l => l.trim()) 
                  }))
                }
                placeholder="tr, en, de"
              />
            </div>
            
            <div>
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                value={configData.webhook_url}
                onChange={(e) => 
                  setConfigData(prev => ({ ...prev, webhook_url: e.target.value }))
                }
                placeholder="https://yourdomain.com/webhook/provider"
              />
            </div>
            
            <div>
              <Label htmlFor="return_url">Dönüş URL'si</Label>
              <Input
                id="return_url"
                value={configData.return_url}
                onChange={(e) => 
                  setConfigData(prev => ({ ...prev, return_url: e.target.value }))
                }
                placeholder="https://yourdomain.com/casino"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveConfig} disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provider Games Dialog */}
      <Dialog open={isGamesDialogOpen} onOpenChange={handleCloseGamesDialog}>
        <DialogContent className="max-w-6xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Sağlayıcı Oyunları: {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Sağlayıcıdan alınan oyun listesi ve test başlatma
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {selectedProviderId && (
              <ProviderGamesList
                providerId={selectedProviderId}
                providerName={selectedProvider?.name || ''}
                games={providerGames}
                onLaunchGame={handleLaunchGame}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGameProviders;