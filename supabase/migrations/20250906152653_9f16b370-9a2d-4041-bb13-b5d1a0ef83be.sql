-- Create casino categories table
CREATE TABLE public.casino_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name CHARACTER VARYING NOT NULL,
  slug CHARACTER VARYING NOT NULL UNIQUE,
  icon_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for casino_categories
ALTER TABLE public.casino_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for casino categories
CREATE POLICY "Casino categories are viewable by everyone" 
ON public.casino_categories 
FOR SELECT 
USING (true);

-- Create casino games table 
CREATE TABLE public.casino_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name CHARACTER VARYING NOT NULL,
  slug CHARACTER VARYING NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.casino_categories(id),
  provider_id UUID REFERENCES public.game_providers(id),
  thumbnail_url TEXT,
  background_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  has_demo BOOLEAN DEFAULT true,
  min_bet NUMERIC DEFAULT 0.01,
  max_bet NUMERIC DEFAULT 10000.00,
  rtp_percentage NUMERIC,
  volatility CHARACTER VARYING, -- low, medium, high
  jackpot_amount NUMERIC DEFAULT 0.00,
  play_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  external_game_id CHARACTER VARYING,
  game_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for casino_games
ALTER TABLE public.casino_games ENABLE ROW LEVEL SECURITY;

-- Create policy for casino games
CREATE POLICY "Casino games are viewable by everyone" 
ON public.casino_games 
FOR SELECT 
USING (true);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.casino_games(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable RLS for user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_favorites
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites 
FOR SELECT 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = user_favorites.user_id));

CREATE POLICY "Users can add their own favorites" 
ON public.user_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = user_favorites.user_id));

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites 
FOR DELETE 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE users.id = user_favorites.user_id));

-- Create indexes for better performance
CREATE INDEX idx_casino_games_category_id ON public.casino_games(category_id);
CREATE INDEX idx_casino_games_is_active ON public.casino_games(is_active);
CREATE INDEX idx_casino_games_is_featured ON public.casino_games(is_featured);
CREATE INDEX idx_casino_games_is_new ON public.casino_games(is_new);
CREATE INDEX idx_casino_games_is_popular ON public.casino_games(is_popular);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_game_id ON public.user_favorites(game_id);

-- Create trigger for updated_at columns
CREATE TRIGGER update_casino_categories_updated_at
  BEFORE UPDATE ON public.casino_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_casino_games_updated_at
  BEFORE UPDATE ON public.casino_games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample casino categories
INSERT INTO public.casino_categories (name, slug, description, sort_order) VALUES
('Slot Oyunları', 'slots', 'En popüler slot oyunları', 1),
('Canlı Casino', 'live-casino', 'Gerçek krupiyerlerle canlı oyunlar', 2),
('Masa Oyunları', 'table-games', 'Klasik masa oyunları', 3),
('Jackpot', 'jackpot', 'Büyük ikramiyeli oyunlar', 4),
('Yeni Oyunlar', 'new-games', 'Son eklenen oyunlar', 5),
('Popüler', 'popular', 'En çok oynanan oyunlar', 6);

-- Insert sample casino games
INSERT INTO public.casino_games (name, slug, category_id, thumbnail_url, jackpot_amount, is_featured, is_new, is_popular, rtp_percentage, volatility) VALUES
('Sweet Bonanza', 'sweet-bonanza', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop', 0, true, false, true, 96.51, 'high'),
('Gates of Olympus', 'gates-of-olympus', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop', 0, true, false, true, 96.50, 'high'),
('Book of Dead', 'book-of-dead', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=300&h=200&fit=crop', 0, false, false, true, 96.21, 'high'),
('Starburst', 'starburst', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1514828260103-48ebcdf5188b?w=300&h=200&fit=crop', 0, false, false, true, 96.09, 'low'),
('Mega Moolah', 'mega-moolah', (SELECT id FROM casino_categories WHERE slug = 'jackpot'), 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=300&h=200&fit=crop', 15750000, true, false, true, 88.12, 'medium'),
('Lightning Roulette', 'lightning-roulette', (SELECT id FROM casino_categories WHERE slug = 'live-casino'), 'https://images.unsplash.com/photo-1541504791175-5c1f2502e621?w=300&h=200&fit=crop', 0, true, false, true, 97.30, 'low'),
('Blackjack Classic', 'blackjack-classic', (SELECT id FROM casino_categories WHERE slug = 'table-games'), 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop', 0, false, false, true, 99.28, 'low'),
('Crazy Time', 'crazy-time', (SELECT id FROM casino_categories WHERE slug = 'live-casino'), 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=300&h=200&fit=crop', 0, true, true, true, 96.08, 'high'),
('Reactoonz', 'reactoonz', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&h=200&fit=crop', 0, false, true, false, 96.51, 'high'),
('Fire Joker', 'fire-joker', (SELECT id FROM casino_categories WHERE slug = 'slots'), 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop', 0, false, true, false, 96.15, 'medium');