-- Create storage bucket for bonus images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bonus-images', 'bonus-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for bonus images
CREATE POLICY "Bonus images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bonus-images');

CREATE POLICY "Admins can upload bonus images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bonus-images');

CREATE POLICY "Admins can update bonus images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'bonus-images');

CREATE POLICY "Admins can delete bonus images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'bonus-images');

-- Update bonus_campaigns table with additional fields
ALTER TABLE public.bonus_campaigns 
ADD COLUMN IF NOT EXISTS bonus_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS bonus_amount_fixed NUMERIC,
ADD COLUMN IF NOT EXISTS min_deposit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS wagering_requirement INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS valid_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS applicable_games TEXT DEFAULT 'all', -- 'sports', 'casino', 'slots', 'all'
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT,
ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_limit_per_user INTEGER DEFAULT 1;