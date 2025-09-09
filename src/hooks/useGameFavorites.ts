import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameFavorite {
  id: string;
  user_id: string;
  game_id: string;
  game_type: 'slot' | 'casino' | 'live' | 'sports';
  created_at: string;
}

export const useGameFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setFavorites([]);
        return;
      }

      // For now, we'll store favorites in localStorage since we don't have the table
      // In a real app, you'd query from a favorites table
      const storedFavorites = localStorage.getItem(`game_favorites_${user.id}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (gameId: string, gameType: 'slot' | 'casino' | 'live' | 'sports' = 'slot') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Favorilere eklemek için giriş yapmalısınız');
        return false;
      }

      if (favorites.includes(gameId)) {
        return true; // Already in favorites
      }

      const updatedFavorites = [...favorites, gameId];
      setFavorites(updatedFavorites);
      
      // Store in localStorage
      localStorage.setItem(`game_favorites_${user.id}`, JSON.stringify(updatedFavorites));
      
      // In a real app, you'd also store in database:
      // await supabase.from('game_favorites').insert({
      //   user_id: user.id,
      //   game_id: gameId,
      //   game_type: gameType
      // });

      return true;
    } catch (err: any) {
      toast.error('Favorilere eklenirken hata oluştu');
      console.error('Error adding favorite:', err);
      return false;
    }
  };

  const removeFavorite = async (gameId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updatedFavorites = favorites.filter(id => id !== gameId);
      setFavorites(updatedFavorites);
      
      // Update localStorage
      localStorage.setItem(`game_favorites_${user.id}`, JSON.stringify(updatedFavorites));
      
      // In a real app, you'd also remove from database:
      // await supabase.from('game_favorites').delete()
      //   .match({ user_id: user.id, game_id: gameId });

      return true;
    } catch (err: any) {
      toast.error('Favorilerden çıkarılırken hata oluştu');
      console.error('Error removing favorite:', err);
      return false;
    }
  };

  const toggleFavorite = async (gameId: string, gameType: 'slot' | 'casino' | 'live' | 'sports' = 'slot') => {
    if (favorites.includes(gameId)) {
      return await removeFavorite(gameId);
    } else {
      return await addFavorite(gameId, gameType);
    }
  };

  const isFavorite = (gameId: string) => {
    return favorites.includes(gameId);
  };

  const clearAllFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      setFavorites([]);
      localStorage.removeItem(`game_favorites_${user.id}`);
      
      toast.success('Tüm favoriler temizlendi');
      return true;
    } catch (err: any) {
      toast.error('Favoriler temizlenirken hata oluştu');
      return false;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadFavorites();
      } else if (event === 'SIGNED_OUT') {
        setFavorites([]);
      }
    });

    // Load favorites on mount
    loadFavorites();

    return () => subscription.unsubscribe();
  }, []);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    loadFavorites
  };
};