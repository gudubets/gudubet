import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameProvider {
  id: string;
  name: string;
  provider_type: 'external' | 'custom';
  api_endpoint?: string;
  api_key?: string;
  status: 'active' | 'inactive' | 'maintenance';
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface GameProviderConfig {
  demo_mode: boolean;
  supported_currencies: string[];
  supported_languages: string[];
  webhook_url?: string;
  return_url?: string;
}

export const useGameProviders = () => {
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Sağlayıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addProvider = async (providerData: Omit<GameProvider, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('game_providers')
        .insert(providerData)
        .select()
        .single();

      if (error) throw error;
      
      setProviders(prev => [...prev, data]);
      toast.success('Sağlayıcı başarıyla eklendi');
      return data;
    } catch (err: any) {
      toast.error('Sağlayıcı eklenirken hata oluştu');
      throw err;
    }
  };

  const updateProvider = async (id: string, updates: Partial<GameProvider>) => {
    try {
      const { data, error } = await supabase
        .from('game_providers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProviders(prev => prev.map(p => p.id === id ? data : p));
      toast.success('Sağlayıcı başarıyla güncellendi');
      return data;
    } catch (err: any) {
      toast.error('Sağlayıcı güncellenirken hata oluştu');
      throw err;
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('game_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProviders(prev => prev.filter(p => p.id !== id));
      toast.success('Sağlayıcı başarıyla silindi');
    } catch (err: any) {
      toast.error('Sağlayıcı silinirken hata oluştu');
      throw err;
    }
  };

  const testProvider = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('test-game-provider', {
        body: { providerId: id }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Sağlayıcı testi başarılı');
      } else {
        toast.error(`Sağlayıcı testi başarısız: ${data.error}`);
      }
      
      return data;
    } catch (err: any) {
      toast.error('Sağlayıcı test edilirken hata oluştu');
      throw err;
    }
  };

  const getProviderConfig = async (id: string): Promise<GameProviderConfig | null> => {
    try {
      const { data, error } = await supabase
        .from('game_provider_configs')
        .select('*')
        .eq('provider_id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err: any) {
      console.error('Config fetch error:', err);
      return null;
    }
  };

  const updateProviderConfig = async (providerId: string, config: GameProviderConfig) => {
    try {
      const { data, error } = await supabase
        .from('game_provider_configs')
        .upsert({
          provider_id: providerId,
          ...config
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Sağlayıcı yapılandırması güncellendi');
      return data;
    } catch (err: any) {
      toast.error('Yapılandırma güncellenirken hata oluştu');
      throw err;
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  return {
    providers,
    loading,
    error,
    loadProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    testProvider,
    getProviderConfig,
    updateProviderConfig
  };
};