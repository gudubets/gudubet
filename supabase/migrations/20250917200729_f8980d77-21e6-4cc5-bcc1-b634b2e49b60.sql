-- Mevcut casino oyunlarının resimlerini site_images tablosuna ekle
INSERT INTO public.site_images (category, name, description, image_url, alt_text, sort_order)
SELECT 
  'games' as category,
  cg.name as name,
  COALESCE(cg.description, 'Oyun resmi') as description,
  COALESCE(cg.thumbnail_url, cg.background_url, '') as image_url,
  cg.name as alt_text,
  ROW_NUMBER() OVER (ORDER BY cg.created_at) as sort_order
FROM public.casino_games cg
WHERE cg.is_active = true 
  AND (cg.thumbnail_url IS NOT NULL OR cg.background_url IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM public.site_images si 
    WHERE si.category = 'games' AND si.name = cg.name
  );