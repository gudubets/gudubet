-- Add Ubisoft as a new game provider
INSERT INTO public.game_providers (name, slug, logo_url, website_url, is_active, sort_order) 
VALUES 
  ('Ubisoft', 'ubisoft', '/placeholder.svg', 'https://ubisoft.com', true, 4)
ON CONFLICT (slug) DO NOTHING;