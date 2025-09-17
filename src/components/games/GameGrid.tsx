import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Heart, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { addSmartCacheBuster, getPlaceholderImage } from '@/utils/imageUtils';

interface Game {
  id: string;
  name: string;
  slug: string;
  provider: string;
  category: string;
  thumbnail_url?: string;
  rtp_percentage?: number;
  volatility?: 'low' | 'medium' | 'high';
  min_bet: number;
  max_bet: number;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  play_count: number;
  jackpot_amount?: number;
  updated_at?: string; // Add updated_at field
}

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  onFavoriteToggle?: (gameId: string, isFavorite: boolean) => void;
  favorites?: string[];
  viewMode?: 'grid' | 'list';
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  loading = false,
  onFavoriteToggle,
  favorites = [],
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  const handlePlayGame = async (game: Game) => {
    setLoadingGame(game.id);
    
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (game.category === 'slots') {
        navigate(`/slot/${game.slug}`);
      } else {
        // For other game types, we'll navigate to a generic game page
        navigate(`/game/${game.slug}`);
      }
    } catch (error) {
      toast.error('Oyun yüklenirken hata oluştu');
    } finally {
      setLoadingGame(null);
    }
  };

  const handleFavoriteToggle = (gameId: string) => {
    const isFavorite = favorites.includes(gameId);
    onFavoriteToggle?.(gameId, !isFavorite);
    
    if (!isFavorite) {
      toast.success('Oyun favorilere eklendi');
    } else {
      toast.success('Oyun favorilerden çıkarıldı');
    }
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
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Play className="mx-auto h-12 w-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Oyun bulunamadı</h3>
          <p>Arama kriterlerinize uygun oyun bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
      {games.map((game) => (
        <Card 
          key={game.id} 
          className={`overflow-hidden group hover:shadow-lg transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}
        >
          <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-64'}`}>
            {/* Game Thumbnail */}
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {game.thumbnail_url ? (
                <img 
                  src={addSmartCacheBuster(game.thumbnail_url, game.updated_at)} 
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = getPlaceholderImage(300, 200);
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${getPlaceholderImage(300, 200)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <Play className="w-12 h-12 text-primary/60" />
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {game.is_featured && (
                <Badge className="bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1" />
                  Öne Çıkan
                </Badge>
              )}
              {game.is_new && (
                <Badge className="bg-green-500">
                  Yeni
                </Badge>
              )}
              {game.is_popular && (
                <Badge className="bg-blue-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popüler
                </Badge>
              )}
            </div>


            {/* Jackpot Amount */}
            {game.jackpot_amount && (
              <div className="absolute bottom-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                💰 {game.jackpot_amount.toLocaleString('tr-TR')} ₺
              </div>
            )}

            {/* Play Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button 
                size="lg"
                onClick={() => handlePlayGame(game)}
                disabled={loadingGame === game.id}
                className="bg-primary hover:bg-primary/90"
              >
                {loadingGame === game.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Oynat
                  </>
                )}
              </Button>
            </div>
          </div>

          <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
            <div className="space-y-2">
              {/* Game Name & Provider with Favorite Button */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm line-clamp-1">{game.name}</h3>
                  <p className="text-xs text-muted-foreground">{game.provider}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8 hover:bg-muted/50"
                  onClick={() => handleFavoriteToggle(game.id)}
                >
                  <Heart 
                    className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`} 
                  />
                </Button>
              </div>

              {/* Game Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  {game.rtp_percentage && (
                    <span className="bg-muted px-2 py-1 rounded">
                      RTP: {game.rtp_percentage}%
                    </span>
                  )}
                  {game.volatility && (
                    <span className={`px-2 py-1 rounded text-white text-xs ${getVolatilityColor(game.volatility)}`}>
                      {getVolatilityText(game.volatility)}
                    </span>
                  )}
                </div>
              </div>

              {/* Bet Range */}
              <div className="text-xs text-muted-foreground">
                Bahis: {game.min_bet} - {game.max_bet} ₺
              </div>

              {/* Play Count */}
              {game.play_count > 0 && (
                <div className="text-xs text-muted-foreground">
                  {game.play_count.toLocaleString('tr-TR')} oynanma
                </div>
              )}

              {viewMode === 'list' && (
                <Button 
                  onClick={() => handlePlayGame(game)}
                  disabled={loadingGame === game.id}
                  className="w-full mt-2"
                >
                  {loadingGame === game.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Oynat
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};