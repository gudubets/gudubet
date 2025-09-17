-- Storage bucket'larını kontrol et ve oluştur
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (eğer eksikse)
CREATE POLICY IF NOT EXISTS "Anyone can view site images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'site-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload site images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Anyone can view game images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'game-images');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload game images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'game-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admins can update site images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'site-images' AND (
  SELECT get_current_user_admin_status.is_admin 
  FROM get_current_user_admin_status()
));

CREATE POLICY IF NOT EXISTS "Admins can delete site images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'site-images' AND (
  SELECT get_current_user_admin_status.is_admin 
  FROM get_current_user_admin_status()
));

CREATE POLICY IF NOT EXISTS "Admins can update game images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'game-images' AND (
  SELECT get_current_user_admin_status.is_admin 
  FROM get_current_user_admin_status()
));

CREATE POLICY IF NOT EXISTS "Admins can delete game images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'game-images' AND (
  SELECT get_current_user_admin_status.is_admin 
  FROM get_current_user_admin_status()
));