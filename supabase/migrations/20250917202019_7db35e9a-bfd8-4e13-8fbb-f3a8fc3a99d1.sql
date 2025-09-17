-- Site resimler için storage bucket'ı oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-images', 'site-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

-- Admin kullanıcılarının site-images bucket'ına dosya yüklemesi için RLS politikaları
CREATE POLICY "Admins can upload site images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'site-images' 
  AND auth.uid() IN (
    SELECT id FROM public.admins WHERE is_active = true
  )
);

CREATE POLICY "Admins can update site images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'site-images' 
  AND auth.uid() IN (
    SELECT id FROM public.admins WHERE is_active = true
  )
);

CREATE POLICY "Admins can delete site images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'site-images' 
  AND auth.uid() IN (
    SELECT id FROM public.admins WHERE is_active = true
  )
);

CREATE POLICY "Site images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images');

-- Herkesin site resimlerini görebilmesi için bucket erişim politikası
CREATE POLICY "Public access to site images bucket"
ON storage.buckets
FOR SELECT
USING (id = 'site-images');