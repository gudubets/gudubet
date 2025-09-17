import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CasinoGame {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  provider_id?: string;
  external_game_id?: string;
  thumbnail_url?: string;
  background_url?: string;
  description?: string;
  game_url?: string;
  rtp_percentage?: number;
  volatility?: string; // Will be cast to union type
  min_bet: number;
  max_bet: number;
  has_demo: boolean;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  play_count: number;
  jackpot_amount?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Added fields from joins
  category?: string;
  provider?: string;
}

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

export const useCasinoGames = () => {
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<CasinoGame[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = async () => {
    try {
      setLoading(true);
      
      // Load casino games with related data
      const { data: gamesData, error: gamesError } = await supabase
        .from('casino_games')
        .select(`
          *,
          casino_categories(name, slug),
          game_providers(name)
        `)
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (gamesError) throw gamesError;

      // Load site images for game thumbnails
      const { data: siteImages, error: imagesError } = await supabase
        .from('site_images')
        .select('*')
        .eq('category', 'game-images')
        .eq('is_active', true);

      if (imagesError) {
        console.warn('Error loading site images:', imagesError);
      }

      // Create a map of site images by name for quick lookup
      const imageMap = new Map();
      (siteImages || []).forEach(img => {
        imageMap.set(img.name.toLowerCase(), img.image_url);
      });

      // Transform the data to match our interface
      const transformedGames: CasinoGame[] = (gamesData || []).map(game => {
        // Try to find matching site image by game name
        const matchingSiteImage = imageMap.get(game.name.toLowerCase());
        
        return {
          ...game,
          category: game.casino_categories?.name || 'Unknown',
          provider: game.game_providers?.name || 'Unknown',
          volatility: game.volatility as string,
          created_at: game.created_at || new Date().toISOString(),
          updated_at: game.updated_at || new Date().toISOString(),
          description: game.description || undefined,
          background_url: game.background_url || undefined,
          external_game_id: game.external_game_id || undefined,
          game_url: game.game_url || undefined,
          // Use site image if available, otherwise use original thumbnail_url
          thumbnail_url: matchingSiteImage || game.thumbnail_url || undefined,
          rtp_percentage: game.rtp_percentage || undefined,
          jackpot_amount: game.jackpot_amount || undefined
        };
      });

      setGames(transformedGames);
      setFilteredGames(transformedGames);

      // Extract unique categories and providers
      const uniqueCategories = [...new Set(transformedGames.map(g => g.category).filter(Boolean))];
      const uniqueProviders = [...new Set(transformedGames.map(g => g.provider).filter(Boolean))];
      
      setCategories(uniqueCategories);
      setProviders(uniqueProviders);

    } catch (err: any) {
      setError(err.message);
      toast.error('Oyunlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const filterGames = (searchTerm: string, filters: FilterOptions, favorites: string[] = []) => {
    let filtered = [...games];

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchLower) ||
        (game.provider && game.provider.toLowerCase().includes(searchLower)) ||
        (game.description && game.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(game => game.category === filters.category);
    }

    // Provider filter
    if (filters.provider && filters.provider !== 'all') {
      filtered = filtered.filter(game => game.provider === filters.provider);
    }

    // Volatility filter
    if (filters.volatility && filters.volatility !== 'all') {
      filtered = filtered.filter(game => game.volatility === filters.volatility);
    }

    // Boolean filters
    if (filters.showFeatured) {
      filtered = filtered.filter(game => game.is_featured);
    }

    if (filters.showNew) {
      filtered = filtered.filter(game => game.is_new);
    }

    if (filters.showPopular) {
      filtered = filtered.filter(game => game.is_popular);
    }

    if (filters.showFavorites) {
      filtered = filtered.filter(game => favorites.includes(game.id));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
        filtered.sort((a, b) => b.play_count - a.play_count);
        break;
      case 'rtp':
        filtered.sort((a, b) => (b.rtp_percentage || 0) - (a.rtp_percentage || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'jackpot':
        filtered.sort((a, b) => (b.jackpot_amount || 0) - (a.jackpot_amount || 0));
        break;
      default:
        // Keep original sort order (by sort_order, then name)
        break;
    }

    setFilteredGames(filtered);
    return filtered;
  };

  const incrementPlayCount = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('casino_games')
        .update({ play_count: games.find(g => g.id === gameId)?.play_count + 1 || 1 })
        .eq('id', gameId);

      if (error) throw error;

      // Update local state
      setGames(prev => prev.map(game => 
        game.id === gameId 
          ? { ...game, play_count: game.play_count + 1 }
          : game
      ));
    } catch (err: any) {
      console.error('Error incrementing play count:', err);
    }
  };

  const getGameBySlug = (slug: string) => {
    return games.find(game => game.slug === slug);
  };

  const getGamesByCategory = (category: string, limit?: number) => {
    let categoryGames = games.filter(game => game.category === category);
    if (limit) {
      categoryGames = categoryGames.slice(0, limit);
    }
    return categoryGames;
  };

  const getFeaturedGames = (limit?: number) => {
    let featured = games.filter(game => game.is_featured);
    if (limit) {
      featured = featured.slice(0, limit);
    }
    return featured;
  };

  const getPopularGames = (limit?: number) => {
    let popular = games
      .filter(game => game.is_popular)
      .sort((a, b) => b.play_count - a.play_count);
    
    if (limit) {
      popular = popular.slice(0, limit);
    }
    return popular;
  };

  const getNewGames = (limit?: number) => {
    let newGames = games
      .filter(game => game.is_new)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    if (limit) {
      newGames = newGames.slice(0, limit);
    }
    return newGames;
  };

  useEffect(() => {
    loadGames();
    
    // Real-time subscriptions for updates
    const casinoGamesChannel = supabase
      .channel('casino_games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'casino_games'
        },
        (payload) => {
          console.log('Casino games updated:', payload);
          // Reload games when changes occur
          loadGames();
        }
      )
      .subscribe();

    const siteImagesChannel = supabase
      .channel('site_images_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_images'
        },
        (payload) => {
          console.log('Site images updated:', payload);
          // Reload games to get updated images
          loadGames();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(casinoGamesChannel);
      supabase.removeChannel(siteImagesChannel);
    };
  }, []);

  return {
    games,
    filteredGames,
    categories,
    providers,
    loading,
    error,
    loadGames,
    filterGames,
    incrementPlayCount,
    getGameBySlug,
    getGamesByCategory,
    getFeaturedGames,
    getPopularGames,
    getNewGames
  };
};
