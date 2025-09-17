-- Create storage bucket for site images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for site images storage
CREATE POLICY "Anyone can view site images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);

CREATE POLICY "Admins can update site images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'site-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);

CREATE POLICY "Admins can delete site images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'site-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);