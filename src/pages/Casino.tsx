import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <Card className="group overflow-hidden bg-slate-800 border border-slate-700 hover:border-teal-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-0 relative">
          <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
            {game.thumbnail_url ? (
              <img
                src={game.thumbnail_url}
                alt={game.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12 text-white" />
              </div>
            )}

            {/* Overlay with buttons */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Oyna
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {game.is_new && (
                <Badge className="bg-green-600 text-white text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Yeni
                </Badge>
              )}
              {game.is_featured && (
                <Badge className="bg-yellow-600 text-white text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Öne Çıkan
                </Badge>
              )}
              {game.is_popular && (
                <Badge className="bg-red-600 text-white text-xs">
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
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(game.id);
              }}
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
                <Badge className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs">
                  <Trophy className="w-3 h-3 mr-1" />
                  ₺{game.jackpot_amount.toLocaleString()}
                </Badge>
              </div>
            )}
          </div>

          {/* Game info */}
          <div className="p-3">
            <h3 className="text-white font-semibold text-sm mb-1">{game.name}</h3>
            <div className="flex items-center justify-between text-xs text-slate-400">
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
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation - Casibom Style */}
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <a href="/" className="text-yellow-400 font-bold text-xl">
                casibom
              </a>
              
              {/* Main Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">ANA SAYFA</a>
                <a href="/sports-betting" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">SPOR</a>
                <a href="/live-betting" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">CANLI</a>
                <a href="/casino" className="text-yellow-400 border-b border-yellow-400 pb-1 text-sm">CASINO</a>
                <a href="/live-casino" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">CANLI CASINO</a>
                <a href="/promotions" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">PROMOSYONLAR</a>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-yellow-400">
                <span className="text-lg">💬</span>
              </Button>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 text-sm">
                GİRİŞ
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 text-sm">
                ÜYE OL
              </Button>
            </div>
          </div>
        </div>

        {/* Game Categories */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-8">
                <Button 
                  variant="ghost" 
                  className={`text-xs hover:bg-gray-800 transition-colors ${
                    selectedCategory === 'all' || selectedCategory === categories.find(c => c.slug === 'slots')?.id 
                      ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setSelectedCategory(categories.find(c => c.slug === 'slots')?.id || 'all')}
                >
                  🎰 SLOT OYUNLARI
                </Button>
                <Button 
                  variant="ghost" 
                  className={`text-xs hover:bg-gray-800 transition-colors ${
                    selectedCategory === categories.find(c => c.slug === 'table-games')?.id 
                      ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setSelectedCategory(categories.find(c => c.slug === 'table-games')?.id || 'all')}
                >
                  🃏 MASA OYUNLARI
                </Button>
                <Button 
                  variant="ghost" 
                  className={`text-xs hover:bg-gray-800 transition-colors ${
                    selectedCategory === categories.find(c => c.slug === 'live-casino')?.id 
                      ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setSelectedCategory(categories.find(c => c.slug === 'live-casino')?.id || 'all')}
                >
                  🎲 CANLI CASINO
                </Button>
                <Button 
                  variant="ghost" 
                  className={`text-xs hover:bg-gray-800 transition-colors ${
                    selectedCategory === categories.find(c => c.slug === 'jackpot')?.id 
                      ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setSelectedCategory(categories.find(c => c.slug === 'jackpot')?.id || 'all')}
                >
                  🎯 JACKPOT
                </Button>
                <Button 
                  variant="ghost" 
                  className={`text-xs hover:bg-gray-800 transition-colors ${
                    selectedCategory === 'new' 
                      ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => setSelectedCategory('new')}
                >
                  🆕 YENİ OYUNLAR
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Oyun ara..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-0">
        {/* Left Sidebar - Same structure as Index */}
        <div className="w-64 bg-gray-900 min-h-screen border-r border-gray-800">
          {/* Quick Links */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Hızlı Linkler</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-sm hover:bg-muted ${
                  selectedCategory === 'featured' ? 'bg-muted text-primary' : ''
                }`}
                onClick={() => setSelectedCategory('featured')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Öne Çıkan Oyunlar
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-sm hover:bg-muted ${
                  selectedCategory === 'new' ? 'bg-muted text-primary' : ''
                }`}
                onClick={() => setSelectedCategory('new')}
              >
                <Star className="h-4 w-4 mr-2" />
                Yeni Oyunlar
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-sm hover:bg-muted ${
                  selectedCategory === 'popular' ? 'bg-muted text-primary' : ''
                }`}
                onClick={() => setSelectedCategory('popular')}
              >
                <Zap className="h-4 w-4 mr-2" />
                Popüler Oyunlar
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-sm hover:bg-muted text-destructive ${
                  selectedCategory === categories.find(c => c.slug === 'jackpot')?.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedCategory(categories.find(c => c.slug === 'jackpot')?.id || 'all')}
              >
                <Gift className="h-4 w-4 mr-2" />
                Jackpot Oyunları
              </Button>
            </div>
          </div>

          {/* Game Categories */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Oyun Kategorileri</h3>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full justify-between text-sm hover:bg-muted text-muted-foreground ${
                  selectedCategory === 'all' ? 'bg-muted text-primary' : ''
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                <span className="flex items-center">
                  <span className="mr-2">🎲</span>
                  Tüm Oyunlar
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">{games.length}</span>
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category.id}
                  variant="ghost" 
                  className={`w-full justify-between text-sm hover:bg-muted text-muted-foreground ${
                    selectedCategory === category.id ? 'bg-muted text-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="flex items-center">
                    <span className="mr-2">
                      {category.slug === 'slots' ? '🎰' :
                       category.slug === 'live-casino' ? '🎲' :
                       category.slug === 'table-games' ? '🃏' :
                       category.slug === 'jackpot' ? '🎯' : '🎮'}
                    </span>
                    {category.name}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {games.filter(g => g.category_id === category.id).length}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div className="p-4">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Sağlayıcılar</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Pragmatic Play <span className="ml-auto text-xs">150</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Evolution Gaming <span className="ml-auto text-xs">85</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                NetEnt <span className="ml-auto text-xs">95</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-background min-h-screen">
          {/* Hero Banner - Same style as Index */}
          <div className="relative h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-orange-900 overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Casino Oyunları
                </h1>
                <p className="text-xl text-white mb-4">En Heyecan Verici Casino Deneyimi</p>
                <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  <Gift className="w-4 h-4 mr-2" />
                  Hoşgeldin Bonusu Al
                </Button>
              </div>
            </div>
          </div>

          {/* Games Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          </div>
        </div>

        {/* Right Sidebar - Promotions */}
        <div className="w-80 bg-muted/30 min-h-screen border-l">
          <div className="sticky top-0">
            {/* Promotions Header */}
            <div className="bg-destructive text-destructive-foreground p-4">
              <h3 className="font-semibold">Aktif Promosyonlar</h3>
            </div>

            {/* Promotions Content */}
            <div className="p-4 space-y-4">
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5" />
                    <span className="font-semibold">Hoşgeldin Bonusu</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">%100 Bonus + 100 Freespin</p>
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
                    Bonus Al
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Günlük Cashback</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">%10 Kayıp İadesi</p>
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Detaylar
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">Haftalık Turnuva</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">₺50,000 Ödül Havuzu</p>
                  <Button className="w-full bg-white text-red-600 hover:bg-gray-100">
                    Katıl
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Mega Jackpot</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">₺15,750,000</p>
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">
                    Şansını Dene
                  </Button>
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