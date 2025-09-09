import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Heart, Star, Users, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { ExternalGameFrame } from '@/components/games/ExternalGameFrame';
import { useCasinoGames } from '@/hooks/useCasinoGames';
import { useGameFavorites } from '@/hooks/useGameFavorites';
import { toast } from 'sonner';

const Game = () => {
  const { gameSlug } = useParams<{ gameSlug: string }>();
  const navigate = useNavigate();
  const { getGameBySlug, incrementPlayCount } = useCasinoGames();
  const { favorites, toggleFavorite } = useGameFavorites();
  
  const [game, setGame] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameSlug) {
      const foundGame = getGameBySlug(gameSlug);
      if (foundGame) {
        setGame(foundGame);
      } else {
        toast.error('Oyun bulunamadı');
        navigate('/casino');
      }
    }
    setLoading(false);
  }, [gameSlug, getGameBySlug, navigate]);

  const handlePlayGame = async () => {
    if (!game) return;
    
    setIsPlaying(true);
    
    try {
      await incrementPlayCount(game.id);
      
      // For slot games, redirect to slot game page
      if (game.category === 'Slots' || game.category === 'slots') {
        navigate(`/slot/${game.slug}`);
        return;
      }
      
      // For other games, show in external frame or redirect
      toast.success('Oyun başlatılıyor...');
    } catch (error) {
      toast.error('Oyun başlatılırken hata oluştu');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!game) return;
    await toggleFavorite(game.id, 'casino');
  };

  const getVolatilityColor = (volatility?: string) => {
    switch (volatility) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getVolatilityText = (volatility?: string) => {
    switch (volatility) {
      case 'low': return 'Düşük Risk';
      case 'medium': return 'Orta Risk';
      case 'high': return 'Yüksek Risk';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Oyun yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Oyun Bulunamadı</h2>
          <Link to="/casino">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Casino'ya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/casino">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Casino'ya Dön
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-t-lg">
                  {game.thumbnail_url ? (
                    <img 
                      src={game.thumbnail_url} 
                      alt={game.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-white/60" />
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-lg">
                    <Button 
                      size="lg"
                      onClick={handlePlayGame}
                      disabled={isPlaying}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPlaying ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      ) : (
                        <Play className="w-6 h-6 mr-2" />
                      )}
                      Oynat
                    </Button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {game.is_featured && (
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Öne Çıkan
                      </Badge>
                    )}
                    {game.is_new && (
                      <Badge className="bg-green-500">Yeni</Badge>
                    )}
                    {game.is_popular && (
                      <Badge className="bg-blue-500">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Popüler
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                    onClick={handleFavoriteToggle}
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>

                  {/* Jackpot */}
                  {game.jackpot_amount && (
                    <div className="absolute bottom-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded font-bold">
                      💰 Jackpot: {game.jackpot_amount.toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Info Sidebar */}
          <div className="space-y-6">
            {/* Game Details */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-xl">{game.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {game.provider} • {game.category}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Play Stats */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Oynama Sayısı:</span>
                  <div className="flex items-center gap-1 text-white">
                    <Users className="w-4 h-4" />
                    {game.play_count.toLocaleString('tr-TR')}
                  </div>
                </div>

                {/* RTP */}
                {game.rtp_percentage && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">RTP:</span>
                    <span className="text-green-400 font-semibold">
                      {game.rtp_percentage}%
                    </span>
                  </div>
                )}

                {/* Volatility */}
                {game.volatility && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Seviyesi:</span>
                    <Badge className={`${getVolatilityColor(game.volatility)} text-white`}>
                      {getVolatilityText(game.volatility)}
                    </Badge>
                  </div>
                )}

                {/* Bet Range */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bahis Aralığı:</span>
                  <span className="text-white">
                    {game.min_bet} - {game.max_bet} ₺
                  </span>
                </div>

                {/* Demo Available */}
                {game.has_demo && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Demo Modu:</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Mevcut
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 space-y-4">
                <Button 
                  onClick={handlePlayGame}
                  disabled={isPlaying}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isPlaying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Gerçek Para ile Oyna
                </Button>

                {game.has_demo && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.info('Demo modu yakında aktif olacak')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Demo Oyna
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={handleFavoriteToggle}
                  className={`w-full ${favorites.includes(game.id) ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${favorites.includes(game.id) ? 'fill-current' : ''}`} />
                  {favorites.includes(game.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Information Tabs */}
        <div className="mt-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="info" className="data-[state=active]:bg-gray-700">
                <Info className="w-4 h-4 mr-2" />
                Oyun Bilgisi
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-gray-700">
                Kurallar
              </TabsTrigger>
              <TabsTrigger value="strategy" className="data-[state=active]:bg-gray-700">
                Strateji
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Oyun Hakkında</h3>
                  <div className="text-gray-300 space-y-2">
                    {game.description ? (
                      <p>{game.description}</p>
                    ) : (
                      <p>
                        {game.name}, {game.provider} tarafından geliştirilen popüler bir casino oyunudur. 
                        {game.rtp_percentage && ` %${game.rtp_percentage} RTP oranı ile`} eğlenceli 
                        ve kazançlı bir oyun deneyimi sunar.
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Teknik Özellikler</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>Sağlayıcı: {game.provider}</li>
                          <li>Kategori: {game.category}</li>
                          {game.rtp_percentage && <li>RTP: %{game.rtp_percentage}</li>}
                          {game.volatility && <li>Risk: {getVolatilityText(game.volatility)}</li>}
                          <li>Min Bahis: {game.min_bet} ₺</li>
                          <li>Max Bahis: {game.max_bet} ₺</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">Oyun İstatistikleri</h4>
                        <ul className="space-y-1 text-sm text-gray-400">
                          <li>Toplam Oynanma: {game.play_count.toLocaleString('tr-TR')}</li>
                          {game.is_featured && <li>⭐ Öne Çıkan Oyun</li>}
                          {game.is_popular && <li>🔥 Popüler Oyun</li>}
                          {game.is_new && <li>✨ Yeni Oyun</li>}
                          {game.has_demo && <li>🎮 Demo Modu Mevcut</li>}
                          {game.jackpot_amount && <li>💰 Jackpot: {game.jackpot_amount.toLocaleString('tr-TR')} ₺</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="rules" className="mt-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Oyun Kuralları</h3>
                  <div className="text-gray-300 space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Temel Kurallar</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Oyuna başlamak için bahis miktarınızı belirleyin</li>
                        <li>Minimum bahis: {game.min_bet} ₺, Maksimum bahis: {game.max_bet} ₺</li>
                        <li>Oyun sonucu tamamen şansa dayalıdır</li>
                        <li>Kazançlarınız otomatik olarak bakiyenize eklenir</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Ödeme Kuralları</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Kazançlar bahis miktarı ile çarpılarak hesaplanır</li>
                        <li>Ödemeler oyun bitiminde otomatik yapılır</li>
                        <li>Bonus özellikler ek kazanç sağlayabilir</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="strategy" className="mt-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Oyun Stratejisi</h3>
                  <div className="text-gray-300 space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Genel Tavsiyeler</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Oyun bütçenizi önceden belirleyin ve aşmayın</li>
                        <li>Küçük bahislerle başlayın, oyunu öğrenin</li>
                        <li>Demo modu varsa önce demo ile pratik yapın</li>
                        <li>Duygusal kararlardan kaçının, soğukkanlı kalın</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Risk Yönetimi</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Kaybetmeyi göze alamayacağınız miktarlarla oynamayın</li>
                        <li>Kazandığınızda kar elde ederken oynamayı bırakın</li>
                        <li>Kaybetme serileri yaşadığınızda mola verin</li>
                        <li>Sorumlu oyun kurallarına uyun</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Game;