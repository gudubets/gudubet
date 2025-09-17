-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('game-images', 'game-images', true);

-- Create RLS policies for game images storage
CREATE POLICY "Anyone can view game images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'game-images');

CREATE POLICY "Admins can upload game images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'game-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);

CREATE POLICY "Admins can update game images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'game-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);

CREATE POLICY "Admins can delete game images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'game-images' AND
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);