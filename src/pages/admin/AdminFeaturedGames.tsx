import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, TrendingUp, Sparkles, Search, Eye, Play, Settings, Upload } from 'lucide-react';
import { useCasinoGames } from '@/hooks/useCasinoGames';
import { supabase } from '@/integrations/supabase/client';
import GameImageUpload from '@/components/admin/GameImageUpload';
import { toast } from 'sonner';

const AdminFeaturedGames = () => {
  const { games, loading, loadGames } = useCasinoGames();
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<string[]>([]);

  const featuredGames = games.filter(game => game.is_featured);
  const popularGames = games.filter(game => game.is_popular);
  const newGames = games.filter(game => game.is_new);
  
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (game.provider && game.provider.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateGameStatus = async (gameId: string, field: 'is_featured' | 'is_popular' | 'is_new', value: boolean) => {
    setUpdating(prev => [...prev, gameId]);
    
    try {
      const { error } = await supabase
        .from('casino_games')
        .update({ [field]: value })
        .eq('id', gameId);

      if (error) throw error;
      
      toast.success(`Oyun başarıyla ${value ? 'eklendi' : 'kaldırıldı'}`);
      await loadGames(); // Reload games to get updated data
    } catch (error: any) {
      toast.error('İşlem sırasında hata oluştu: ' + error.message);
    } finally {
      setUpdating(prev => prev.filter(id => id !== gameId));
    }
  };

  const GameCard = ({ game, showControls = true }: { game: any, showControls?: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        <div 
          className="aspect-video bg-cover bg-center bg-no-repeat rounded-t-lg"
          style={{ 
            backgroundImage: game.thumbnail_url 
              ? `url(${game.thumbnail_url})` 
              : 'linear-gradient(135deg, #1f2937, #374151)' 
          }}
        >
          {!game.thumbnail_url && (
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-50">
              🎰
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {game.is_featured && (
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                <Star className="w-3 h-3 mr-1" />
                Öne Çıkan
              </Badge>
            )}
            {game.is_popular && (
              <Badge variant="secondary" className="bg-blue-500 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popüler
              </Badge>
            )}
            {game.is_new && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Yeni
              </Badge>
            )}
          </div>

          {game.jackpot_amount && game.jackpot_amount > 0 && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full font-bold">
              💰 ₺{game.jackpot_amount.toLocaleString()}
            </div>
          )}

          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="sm" variant="secondary" className="bg-white/90 text-black">
              <Play className="w-4 h-4 mr-1" />
              Önizleme
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm truncate">{game.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{game.provider}</p>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Oynandı: {game.play_count}</span>
              {game.rtp_percentage && <span>RTP: {game.rtp_percentage}%</span>}
            </div>

            {showControls && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Öne Çıkan</span>
                  <Switch
                    checked={game.is_featured}
                    onCheckedChange={(checked) => updateGameStatus(game.id, 'is_featured', checked)}
                    disabled={updating.includes(game.id)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Popüler</span>
                  <Switch
                    checked={game.is_popular}
                    onCheckedChange={(checked) => updateGameStatus(game.id, 'is_popular', checked)}
                    disabled={updating.includes(game.id)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">Yeni</span>
                  <Switch
                    checked={game.is_new}
                    onCheckedChange={(checked) => updateGameStatus(game.id, 'is_new', checked)}
                    disabled={updating.includes(game.id)}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Oyunlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Öne Çıkan Oyunlar</h1>
        <p className="text-muted-foreground">Öne çıkan, popüler ve yeni oyunları yönetin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öne Çıkan Oyunlar</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{featuredGames.length}</div>
            <p className="text-xs text-muted-foreground">Ana sayfada gösteriliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popüler Oyunlar</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popularGames.length}</div>
            <p className="text-xs text-muted-foreground">En çok oynanan oyunlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yeni Oyunlar</CardTitle>
            <Sparkles className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newGames.length}</div>
            <p className="text-xs text-muted-foreground">Yeni eklenen oyunlar</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tüm Oyunlar</TabsTrigger>
          <TabsTrigger value="featured">Öne Çıkanlar</TabsTrigger>
          <TabsTrigger value="popular">Popüler</TabsTrigger>
          <TabsTrigger value="new">Yeni</TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Oyun ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Oyunlar ({filteredGames.length})</CardTitle>
              <CardDescription>Oyun durumlarını hızlı bir şekilde değiştirin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Öne Çıkan Oyunlar ({featuredGames.length})
              </CardTitle>
              <CardDescription>Ana sayfada gösterilen oyunlar</CardDescription>
            </CardHeader>
            <CardContent>
              {featuredGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featuredGames.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz öne çıkan oyun yok</p>
                  <p className="text-sm">Tüm oyunlar sekmesinden oyunları öne çıkarabilirsiniz</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                Popüler Oyunlar ({popularGames.length})
              </CardTitle>
              <CardDescription>En çok oynanan ve beğenilen oyunlar</CardDescription>
            </CardHeader>
            <CardContent>
              {popularGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {popularGames.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz popüler oyun yok</p>
                  <p className="text-sm">Tüm oyunlar sekmesinden oyunları popüler olarak işaretleyebilirsiniz</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-green-500" />
                Yeni Oyunlar ({newGames.length})
              </CardTitle>
              <CardDescription>Yeni eklenen ve güncel oyunlar</CardDescription>
            </CardHeader>
            <CardContent>
              {newGames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {newGames.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Henüz yeni oyun yok</p>
                  <p className="text-sm">Tüm oyunlar sekmesinden oyunları yeni olarak işaretleyebilirsiniz</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFeaturedGames;