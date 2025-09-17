import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { GameGrid } from '@/components/games/GameGrid';
import { GameFilters } from '@/components/games/GameFilters';
import { useCasinoGames } from '@/hooks/useCasinoGames';
import { useGameFavorites } from '@/hooks/useGameFavorites';
import { Play, Star, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FilterOptions {
  category: string;
  provider: string;
  volatility: string;
  sortBy: string;
  showFavorites: boolean;
  showNew: boolean;
  showPopular: boolean;
  showFeatured: boolean;
}

const Casino = () => {
  const navigate = useNavigate();
  
  const {
    games,
    filteredGames,
    categories,
    providers,
    loading,
    filterGames,
    incrementPlayCount,
    getFeaturedGames,
    getPopularGames,
    getNewGames
  } = useCasinoGames();

  const { favorites, toggleFavorite } = useGameFavorites();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    provider: 'all',
    volatility: 'all',
    sortBy: '',
    showFavorites: false,
    showNew: false,
    showPopular: false,
    showFeatured: false
  });

  // Filter games whenever search term or filters change
  useEffect(() => {
    filterGames(searchTerm, filters, favorites);
  }, [searchTerm, filters, favorites, filterGames]);

  const handleFavoriteToggle = async (gameId: string, isFavorite: boolean) => {
    const result = await toggleFavorite(gameId, 'casino');
    if (result) {
      // Re-filter games to update the view
      filterGames(searchTerm, filters, favorites);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.provider && filters.provider !== 'all') count++;
    if (filters.volatility && filters.volatility !== 'all') count++;
    if (filters.showFavorites) count++;
    if (filters.showNew) count++;
    if (filters.showPopular) count++;
    if (filters.showFeatured) count++;
    return count;
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      provider: 'all',
      volatility: 'all',
      sortBy: '',
      showFavorites: false,
      showNew: false,
      showPopular: false,
      showFeatured: false
    });
    setSearchTerm('');
  };

  const featuredGames = getFeaturedGames(6);
  const popularGames = getPopularGames(6);
  const newGames = getNewGames(6);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-gaming font-bold mb-4">
                🎰 Casino
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90">
                En iyi slot oyunları ve casino deneyimi
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-yellow-500 text-black">
                  <Star className="w-3 h-3 mr-1" />
                  {featuredGames.length} Öne Çıkan Oyun
                </Badge>
                <Badge className="bg-green-500">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {newGames.length} Yeni Oyun
                </Badge>
                <Badge className="bg-blue-500">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {popularGames.length} Popüler Oyun
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Games Section */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500/20 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">🎮 Demo Oyunlar</h2>
                  <p className="text-gray-300">NetEnt, EGT ve Pragmatic Play oyunlarını ücretsiz deneyin</p>
                </div>
                <Button 
                  onClick={() => navigate('/demo-games')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Tüm Demo Oyunlar
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Categories */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card 
              className="group cursor-pointer hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 bg-gray-900 border-gray-700" 
              onClick={() => setFilters({...filters, showFeatured: true})}
            >
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white">Öne Çıkan</h3>
                <p className="text-sm text-gray-400">{featuredGames.length} oyun</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 bg-gray-900 border-gray-700"
              onClick={() => setFilters({...filters, showPopular: true})}
            >
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white">Popüler</h3>
                <p className="text-sm text-gray-400">{popularGames.length} oyun</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 bg-gray-900 border-gray-700"
              onClick={() => setFilters({...filters, showNew: true})}
            >
              <CardContent className="p-6 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white">Yeni Oyunlar</h3>
                <p className="text-sm text-gray-400">{newGames.length} oyun</p>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 bg-gray-900 border-gray-700"
              onClick={() => setFilters({...filters, showFavorites: true})}
            >
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white">Favorilerim</h3>
                <p className="text-sm text-gray-400">{favorites.length} oyun</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Game Filters */}
        <section className="mb-8">
          <GameFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            categories={categories}
            providers={providers}
            activeFiltersCount={getActiveFiltersCount()}
            onClearFilters={clearFilters}
          />
        </section>

        {/* Games Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {searchTerm ? `"${searchTerm}" için sonuçlar` : 'Tüm Oyunlar'}
              </h2>
              <p className="text-gray-400">
                {filteredGames.length} oyun bulundu
              </p>
            </div>
            
            {getActiveFiltersCount() > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Filtreleri Temizle ({getActiveFiltersCount()})
              </Button>
            )}
          </div>

          <GameGrid
            games={filteredGames.map(game => ({
              id: game.id,
              name: game.name,
              slug: game.slug,
              provider: game.provider || 'Unknown',
              category: game.category || 'slot',
              thumbnail_url: game.thumbnail_url,
              rtp_percentage: game.rtp_percentage,
              volatility: game.volatility as 'low' | 'medium' | 'high',
              min_bet: game.min_bet,
              max_bet: game.max_bet,
              is_featured: game.is_featured,
              is_new: game.is_new,
              is_popular: game.is_popular,
              play_count: game.play_count,
              jackpot_amount: game.jackpot_amount,
              updated_at: game.updated_at
            }))}
            loading={loading}
            onFavoriteToggle={handleFavoriteToggle}
            favorites={favorites}
            viewMode={viewMode}
          />
        </section>

        {/* No games found */}
        {!loading && filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Play className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Oyun bulunamadı</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? `"${searchTerm}" aramanız için sonuç bulunamadı.`
                : 'Seçtiğiniz filtrelere uygun oyun bulunmuyor.'
              }
            </p>
            <Button onClick={clearFilters} variant="outline">
              Filtreleri Temizle
            </Button>
          </div>
        )}

        {/* Game Statistics */}
        {!loading && games.length > 0 && (
          <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">{games.length}</div>
                <div className="text-sm text-gray-400">Toplam Oyun</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">{providers.length}</div>
                <div className="text-sm text-gray-400">Oyun Sağlayıcısı</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">{featuredGames.length}</div>
                <div className="text-sm text-gray-400">Öne Çıkan Oyun</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">{favorites.length}</div>
                <div className="text-sm text-gray-400">Favori Oyunlarım</div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Casino;