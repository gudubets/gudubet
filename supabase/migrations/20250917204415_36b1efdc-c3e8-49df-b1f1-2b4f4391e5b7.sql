-- Site images tablosunda real-time özelliklerini etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.casino_games;

-- Replica identity ayarları (real-time için gerekli)
ALTER TABLE public.site_images REPLICA IDENTITY FULL;
ALTER TABLE public.casino_games REPLICA IDENTITY FULL;

-- Index sayfası için örnek site image kayıtları ekle (eğer yoksa)
INSERT INTO public.site_images (
  category, 
  name, 
  description, 
  image_url, 
  alt_text, 
  is_active, 
  sort_order
) VALUES 
(
  'hero', 
  'welcome-bonus', 
  'Ana sayfa hoşgeldin bonusu banner resmi', 
  '/lovable-uploads/ea4401d0-dccf-4923-b1f3-c6fe9f5412a8.png', 
  'Gudubet Hoşgeldin Bonusu 500 TL', 
  true, 
  1
)
ON CONFLICT (category, name) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  updated_at = NOW();