-- Mevcut storage politikalarını sil ve yeniden oluştur
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;
DROP POLICY IF EXISTS "Site images are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;

-- Yeni ve daha basit politikalar oluştur
CREATE POLICY "Admin upload site images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin update site images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Admin delete site images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Public view site images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images');