-- Add is_live field to games table for live casino support
ALTER TABLE public.games 
ADD COLUMN is_live boolean DEFAULT false;

-- Add comment to clarify the field purpose
COMMENT ON COLUMN public.games.is_live IS 'Indicates if this is a live casino game with real dealers';

-- Create index for better performance when filtering live games
CREATE INDEX idx_games_is_live ON public.games(is_live) WHERE is_live = true;

-- Insert some sample live casino game providers if they don't exist
INSERT INTO public.game_providers (name, slug, logo_url, website_url, is_active, sort_order) 
VALUES 
  ('Evolution Gaming', 'evolution-gaming', '/placeholder.svg', 'https://evolution.com', true, 1),
  ('Pragmatic Play Live', 'pragmatic-live', '/placeholder.svg', 'https://pragmaticplay.com', true, 2),
  ('Ezugi', 'ezugi', '/placeholder.svg', 'https://ezugi.com', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample live casino games
WITH providers AS (
  SELECT id, name FROM public.game_providers 
  WHERE slug IN ('evolution-gaming', 'pragmatic-live', 'ezugi')
)
INSERT INTO public.games (
  provider_id, 
  name, 
  slug,
  category, 
  game_type,
  thumbnail_url, 
  is_live, 
  is_active,
  is_featured,
  description,
  min_bet,
  max_bet
) 
SELECT 
  p.id,
  game_data.name,
  game_data.slug,
  game_data.category,
  'live_casino',
  '/placeholder.svg',
  true,
  true,
  game_data.is_featured,
  game_data.description,
  game_data.min_bet,
  game_data.max_bet
FROM providers p
CROSS JOIN (
  VALUES 
    ('Lightning Roulette', 'lightning-roulette', 'roulette', true, 'High-energy roulette with multiplied payouts', 0.20, 5000.00),
    ('Live Blackjack', 'live-blackjack', 'blackjack', true, 'Classic blackjack with professional dealers', 1.00, 5000.00),
    ('Baccarat Squeeze', 'baccarat-squeeze', 'baccarat', false, 'Traditional baccarat with card squeeze action', 1.00, 10000.00),
    ('Crazy Time', 'crazy-time', 'show', true, 'Interactive game show with bonus rounds', 0.10, 2000.00),
    ('Live Texas Holdem', 'live-texas-holdem', 'poker', false, 'Professional poker against the house', 2.00, 1000.00),
    ('Monopoly Live', 'monopoly-live', 'show', true, 'Board game inspired live casino game', 0.10, 2000.00),
    ('European Roulette', 'european-roulette', 'roulette', false, 'Classic European roulette wheel', 0.50, 5000.00),
    ('Live Baccarat', 'live-baccarat', 'baccarat', false, 'Traditional baccarat with multiple camera angles', 1.00, 10000.00)
) AS game_data(name, slug, category, is_featured, description, min_bet, max_bet)
WHERE p.name = CASE 
  WHEN game_data.name IN ('Lightning Roulette', 'Live Blackjack', 'Crazy Time', 'Monopoly Live') THEN 'Evolution Gaming'
  WHEN game_data.name IN ('Baccarat Squeeze', 'European Roulette') THEN 'Pragmatic Play Live'
  ELSE 'Ezugi'
END
ON CONFLICT (slug) DO NOTHING;