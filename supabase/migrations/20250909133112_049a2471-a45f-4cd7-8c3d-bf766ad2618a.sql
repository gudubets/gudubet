-- Insert sample casino games data
INSERT INTO public.casino_games (
  name, slug, category_id, provider_id, thumbnail_url, rtp_percentage, 
  volatility, min_bet, max_bet, has_demo, is_featured, is_new, is_popular, 
  play_count, jackpot_amount
) VALUES 
-- Get the first category and provider IDs for references
((
  SELECT 
    'Sweet Bonanza' as name,
    'sweet-bonanza' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Pragmatic%' LIMIT 1) as provider_id,
    '/images/games/sweet-bonanza.jpg' as thumbnail_url,
    96.48 as rtp_percentage,
    'high' as volatility,
    0.20 as min_bet,
    100.00 as max_bet,
    true as has_demo,
    true as is_featured,
    false as is_new,
    true as is_popular,
    15420 as play_count,
    125000.00 as jackpot_amount
)),
((
  SELECT 
    'Big Bass Bonanza' as name,
    'big-bass-bonanza' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Pragmatic%' LIMIT 1) as provider_id,
    '/images/games/big-bass-bonanza.jpg' as thumbnail_url,
    96.71 as rtp_percentage,
    'high' as volatility,
    0.10 as min_bet,
    250.00 as max_bet,
    true as has_demo,
    true as is_featured,
    false as is_new,
    true as is_popular,
    12890 as play_count,
    null as jackpot_amount
)),
((
  SELECT 
    'The Dog House' as name,
    'the-dog-house' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Pragmatic%' LIMIT 1) as provider_id,
    '/images/games/the-dog-house.jpg' as thumbnail_url,
    96.51 as rtp_percentage,
    'high' as volatility,
    0.20 as min_bet,
    100.00 as max_bet,
    true as has_demo,
    false as is_featured,
    false as is_new,
    true as is_popular,
    9876 as play_count,
    null as jackpot_amount
)),
((
  SELECT 
    'Gates of Olympus' as name,
    'gates-of-olympus' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Pragmatic%' LIMIT 1) as provider_id,
    '/images/games/gates-of-olympus.jpg' as thumbnail_url,
    96.50 as rtp_percentage,
    'high' as volatility,
    0.20 as min_bet,
    125.00 as max_bet,
    true as has_demo,
    true as is_featured,
    false as is_new,
    true as is_popular,
    18756 as play_count,
    null as jackpot_amount
)),
((
  SELECT 
    'Fruit Party' as name,
    'fruit-party' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Pragmatic%' LIMIT 1) as provider_id,
    '/images/games/fruit-party.jpg' as thumbnail_url,
    96.50 as rtp_percentage,
    'high' as volatility,
    0.20 as min_bet,
    100.00 as max_bet,
    true as has_demo,
    false as is_featured,
    true as is_new,
    false as is_popular,
    5432 as play_count,
    null as jackpot_amount
)),
((
  SELECT 
    'Gudubet Mega' as name,
    'gudubet-mega' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Gudubet%' LIMIT 1) as provider_id,
    '/images/games/gudubet-mega.jpg' as thumbnail_url,
    97.20 as rtp_percentage,
    'medium' as volatility,
    0.10 as min_bet,
    50.00 as max_bet,
    true as has_demo,
    false as is_featured,
    true as is_new,
    false as is_popular,
    1234 as play_count,
    75000.00 as jackpot_amount
)),
((
  SELECT 
    'Turkish Delight' as name,
    'turkish-delight' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Gudubet%' LIMIT 1) as provider_id,
    '/images/games/turkish-delight.jpg' as thumbnail_url,
    96.85 as rtp_percentage,
    'low' as volatility,
    0.05 as min_bet,
    25.00 as max_bet,
    true as has_demo,
    false as is_featured,
    true as is_new,
    false as is_popular,
    892 as play_count,
    null as jackpot_amount
)),
((
  SELECT 
    'Book of Tut' as name,
    'book-of-tut' as slug,
    (SELECT id FROM public.casino_categories LIMIT 1) as category_id,
    (SELECT id FROM public.game_providers WHERE name LIKE '%Evolution%' LIMIT 1) as provider_id,
    '/images/games/book-of-tut.jpg' as thumbnail_url,
    96.28 as rtp_percentage,
    'high' as volatility,
    0.10 as min_bet,
    100.00 as max_bet,
    true as has_demo,
    false as is_featured,
    false as is_new,
    false as is_popular,
    7654 as play_count,
    null as jackpot_amount
));

-- Create some default casino categories if they don't exist
INSERT INTO public.casino_categories (name, slug, description, sort_order) 
VALUES 
('Slots', 'slots', 'En popüler slot oyunları', 1),
('Jackpot Oyunları', 'jackpot', 'Büyük jackpot kazanç fırsatları', 2),
('Masa Oyunları', 'table-games', 'Klasik casino masa oyunları', 3),
('Canlı Casino', 'live-casino', 'Gerçek krupiyeler ile oyun', 4)
ON CONFLICT (slug) DO NOTHING;