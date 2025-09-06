import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Play, Star, TrendingUp, Zap, Trophy, Gift, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CasinoCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

interface CasinoGame {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  thumbnail_url?: string;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  jackpot_amount: number;
  rtp_percentage?: number;
  volatility?: string;
}

interface UserFavorite {
  game_id: string;
}

const Casino = () => {
  const [categories, setCategories] = useState<CasinoCategory[]>([]);
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch categories and games
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('casino_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (categoriesError) throw categoriesError;

        // Fetch games
        const { data: gamesData, error: gamesError } = await supabase
          .from('casino_games')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (gamesError) throw gamesError;

        setCategories(categoriesData || []);
        setGames(gamesData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching casino data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_favorites')
        .select('game_id')
        .eq('user_id', user.id);

      setFavorites(data || []);
    };

    fetchFavorites();
  }, []);

  // Filter games based on category and search
  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'featured' && game.is_featured) ||
      (selectedCategory === 'new' && game.is_new) ||
      (selectedCategory === 'popular' && game.is_popular) ||
      game.category_id === selectedCategory;

    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Toggle favorite
  const toggleFavorite = async (gameId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Giriş Gerekli",
        description: "Favorilere eklemek için giriş yapmanız gerekiyor.",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.some(fav => fav.game_id === gameId);

    if (isFavorite) {
      // Remove from favorites
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('game_id', gameId);

      setFavorites(favorites.filter(fav => fav.game_id !== gameId));
    } else {
      // Add to favorites
      await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, game_id: gameId });

      setFavorites([...favorites, { game_id: gameId }]);
    }
  };

  const GameCard = ({ game }: { game: CasinoGame }) => {
    const isFavorite = favorites.some(fav => fav.game_id === game.id);

    return (
      <Card className="group overflow-hidden bg-card hover:bg-muted/50 transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-0 relative">
          <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
            {game.thumbnail_url ? (
              <img
                src={game.thumbnail_url}
                alt={game.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Overlay with buttons */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Play className="w-4 h-4 mr-2" />
                Hemen Oyna
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {game.is_new && (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Yeni
                </Badge>
              )}
              {game.is_featured && (
                <Badge variant="secondary" className="bg-yellow-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Öne Çıkan
                </Badge>
              )}
              {game.is_popular && (
                <Badge variant="secondary" className="bg-red-600 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Popüler
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 w-8 h-8 p-0 bg-black/30 hover:bg-black/50"
              onClick={() => toggleFavorite(game.id)}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </Button>

            {/* Jackpot indicator */}
            {game.jackpot_amount > 0 && (
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  <Trophy className="w-3 h-3 mr-1" />
                  ₺{game.jackpot_amount.toLocaleString()}
                </Badge>
              </div>
            )}
          </div>

          {/* Game info */}
          <div className="p-4">
            <h3 className="font-semibold text-sm truncate mb-1">{game.name}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {game.rtp_percentage && (
                <span>RTP: %{game.rtp_percentage}</span>
              )}
              {game.volatility && (
                <span className="capitalize">{game.volatility}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Casino oyunları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-900 via-purple-900 to-orange-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Casino & Slot Oyunları
            </h1>
            <p className="text-lg md:text-xl mb-6">En heyecan verici casino oyunları sizi bekliyor!</p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Gift className="w-5 h-5 mr-2" />
              Hoşgeldin Bonusunu Al
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Oyun ara..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value="featured">Öne Çıkan</TabsTrigger>
                <TabsTrigger value="new">Yeni</TabsTrigger>
                <TabsTrigger value="popular">Popüler</TabsTrigger>
                {categories.slice(0, 2).map((category) => (
                  <TabsTrigger key={category.id} value={category.id} className="hidden lg:flex">
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                {/* Games Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>

                {filteredGames.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      {searchQuery ? 'Aradığınız oyun bulunamadı.' : 'Bu kategoride henüz oyun bulunmuyor.'}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-4 space-y-6">
              {/* Jackpot Pool */}
              <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-6 w-6" />
                    <h3 className="font-bold text-lg">Mega Jackpot</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">₺15.750.000</div>
                    <div className="text-sm opacity-90">Son kazanan: Ahmet K.</div>
                    <Button className="w-full mt-4 bg-white text-orange-600 hover:bg-gray-100">
                      Şansını Dene
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Games */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Önerilen Oyunlar
                  </h3>
                  <div className="space-y-3">
                    {games.filter(game => game.is_featured).slice(0, 4).map((game) => (
                      <div key={game.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                          <Play className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{game.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {game.rtp_percentage ? `RTP: %${game.rtp_percentage}` : 'Popüler'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category List for Mobile Alternative */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Kategoriler</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Casino;