import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface SiteImage {
  id: string;
  category: string;
  name: string;
  description?: string;
  image_url: string;
  alt_text?: string;
  is_active: boolean;
  sort_order: number;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

export const useSiteImages = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('site_images')
        .select('*')
        .order('category', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setImages(data || []);
    } catch (error: any) {
      console.error('Error loading site images:', error);
      setError(error.message);
      toast.error('Resimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addImage = async (imageData: {
    category: string;
    name: string;
    description?: string;
    image_url: string;
    alt_text?: string;
    metadata?: Json;
    sort_order?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from('site_images')
        .insert([{
          ...imageData,
          is_active: true,
          sort_order: imageData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setImages(prev => [...prev, data]);
      toast.success('Resim başarıyla eklendi');
      return data;
    } catch (error: any) {
      console.error('Error adding site image:', error);
      toast.error('Resim eklenirken hata oluştu');
      throw error;
    }
  };

  const updateImage = async (id: string, updates: Partial<SiteImage>) => {
    try {
      const { data, error } = await supabase
        .from('site_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setImages(prev => prev.map(img => img.id === id ? data : img));
      toast.success('Resim başarıyla güncellendi');
      return data;
    } catch (error: any) {
      console.error('Error updating site image:', error);
      toast.error('Resim güncellenirken hata oluştu');
      throw error;
    }
  };

  const deleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setImages(prev => prev.filter(img => img.id !== id));
      toast.success('Resim başarıyla silindi');
    } catch (error: any) {
      console.error('Error deleting site image:', error);
      toast.error('Resim silinirken hata oluştu');
      throw error;
    }
  };

  const getImagesByCategory = (category: string) => {
    return images.filter(img => img.category === category && img.is_active);
  };

  const getImageByName = (name: string, category?: string) => {
    return images.find(img => 
      img.name === name && 
      img.is_active && 
      (!category || img.category === category)
    );
  };

  useEffect(() => {
    loadImages();

    // Real-time subscription for site images updates
    const channel = supabase
      .channel('site_images_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_images'
        },
        (payload) => {
          console.log('Site images updated:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            setImages(prev => [...prev, payload.new as SiteImage]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setImages(prev => prev.map(img => 
              img.id === payload.new.id ? payload.new as SiteImage : img
            ));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setImages(prev => prev.filter(img => img.id !== payload.old.id));
          } else {
            // Full reload for complex changes
            loadImages();
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    images,
    loading,
    error,
    loadImages,
    addImage,
    updateImage,
    deleteImage,
    getImagesByCategory,
    getImageByName
  };
};