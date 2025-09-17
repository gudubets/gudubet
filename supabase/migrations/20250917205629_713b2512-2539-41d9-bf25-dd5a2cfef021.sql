-- Storage bucket'larını kontrol et ve oluştur
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Mevcut policy'leri kontrol et ve sadece eksikse ekle
DO $$
BEGIN
  -- Anyone can view site images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Anyone can view site images'
  ) THEN
    CREATE POLICY "Anyone can view site images" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'site-images');
  END IF;

  -- Authenticated users can upload site images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload site images'
  ) THEN
    CREATE POLICY "Authenticated users can upload site images" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');
  END IF;

  -- Anyone can view game images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Anyone can view game images'
  ) THEN
    CREATE POLICY "Anyone can view game images" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'game-images');
  END IF;

  -- Authenticated users can upload game images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload game images'
  ) THEN
    CREATE POLICY "Authenticated users can upload game images" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'game-images' AND auth.role() = 'authenticated');
  END IF;

  -- Admins can update site images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Admins can update site images'
  ) THEN
    CREATE POLICY "Admins can update site images" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'site-images' AND (
      SELECT get_current_user_admin_status.is_admin 
      FROM get_current_user_admin_status()
    ));
  END IF;

  -- Admins can delete site images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Admins can delete site images'
  ) THEN
    CREATE POLICY "Admins can delete site images" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'site-images' AND (
      SELECT get_current_user_admin_status.is_admin 
      FROM get_current_user_admin_status()
    ));
  END IF;
END $$;