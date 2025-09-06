-- Insert sample live casino game providers if they don't exist
INSERT INTO public.game_providers (name, slug, logo_url, website_url, is_active, sort_order) 
VALUES 
  ('Evolution Gaming', 'evolution-gaming', '/placeholder.svg', 'https://evolution.com', true, 1),
  ('Pragmatic Play Live', 'pragmatic-live', '/placeholder.svg', 'https://pragmaticplay.com', true, 2),
  ('Ezugi', 'ezugi', '/placeholder.svg', 'https://ezugi.com', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Update existing games to mark some as live casino games
UPDATE public.games 
SET is_live = true, 
    game_type = 'live_casino',
    category = CASE 
      WHEN name ILIKE '%roulette%' THEN 'roulette'
      WHEN name ILIKE '%blackjack%' THEN 'blackjack'
      WHEN name ILIKE '%baccarat%' THEN 'baccarat'
      WHEN name ILIKE '%poker%' OR name ILIKE '%holdem%' THEN 'poker'
      WHEN name ILIKE '%crazy%' OR name ILIKE '%monopoly%' THEN 'show'
      ELSE category
    END
WHERE name ILIKE '%live%' OR name ILIKE '%lightning%' OR name ILIKE '%crazy%' OR name ILIKE '%monopoly%';

-- Insert additional live casino games with proper categories
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
    ('Live Blackjack VIP', 'live-blackjack-vip', 'blackjack', true, 'VIP blackjack with professional dealers', 5.00, 10000.00),
    ('Speed Baccarat', 'speed-baccarat', 'baccarat', false, 'Fast-paced baccarat for quick players', 1.00, 5000.00),
    ('Crazy Time', 'crazy-time', 'show', true, 'Interactive game show with bonus rounds', 0.10, 2000.00),
    ('Casino Holdem', 'casino-holdem', 'poker', false, 'Professional poker against the house', 2.00, 1000.00),
    ('Monopoly Live', 'monopoly-live', 'show', true, 'Board game inspired live casino game', 0.10, 2000.00),
    ('Immersive Roulette', 'immersive-roulette', 'roulette', false, 'Multi-camera roulette experience', 0.50, 5000.00),
    ('Lightning Baccarat', 'lightning-baccarat', 'baccarat', false, 'Baccarat with multiplied payouts', 1.00, 10000.00)
) AS game_data(name, slug, category, is_featured, description, min_bet, max_bet)
WHERE p.name = CASE 
  WHEN game_data.name IN ('Lightning Roulette', 'Live Blackjack VIP', 'Crazy Time', 'Monopoly Live', 'Immersive Roulette', 'Lightning Baccarat') THEN 'Evolution Gaming'
  WHEN game_data.name IN ('Speed Baccarat') THEN 'Pragmatic Play Live'
  ELSE 'Ezugi'
END
ON CONFLICT (slug) DO NOTHING;