-- Create default casino categories first
INSERT INTO public.casino_categories (name, slug, description, sort_order) 
VALUES 
('Slots', 'slots', 'En popüler slot oyunları', 1),
('Jackpot Oyunları', 'jackpot', 'Büyük jackpot kazanç fırsatları', 2),
('Masa Oyunları', 'table-games', 'Klasik casino masa oyunları', 3),
('Canlı Casino', 'live-casino', 'Gerçek krupiyeler ile oyun', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample casino games with explicit IDs
WITH category_ref AS (
  SELECT id as category_id FROM public.casino_categories WHERE slug = 'slots' LIMIT 1
),
provider_refs AS (
  SELECT 
    p1.id as pragmatic_id,
    p2.id as gudubet_id, 
    p3.id as evolution_id
  FROM 
    (SELECT id FROM public.game_providers WHERE name ILIKE '%Pragmatic%' LIMIT 1) p1
  CROSS JOIN
    (SELECT id FROM public.game_providers WHERE name ILIKE '%Gudubet%' LIMIT 1) p2  
  CROSS JOIN
    (SELECT id FROM public.game_providers WHERE name ILIKE '%Evolution%' LIMIT 1) p3
)
INSERT INTO public.casino_games (
  name, slug, category_id, provider_id, thumbnail_url, rtp_percentage, 
  volatility, min_bet, max_bet, has_demo, is_featured, is_new, is_popular, play_count, jackpot_amount
) 
SELECT * FROM (
  VALUES 
    ('Sweet Bonanza', 'sweet-bonanza', (SELECT category_id FROM category_ref), (SELECT pragmatic_id FROM provider_refs), '/images/games/sweet-bonanza.jpg', 96.48, 'high', 0.20, 100.00, true, true, false, true, 15420, 125000.00),
    ('Big Bass Bonanza', 'big-bass-bonanza', (SELECT category_id FROM category_ref), (SELECT pragmatic_id FROM provider_refs), '/images/games/big-bass-bonanza.jpg', 96.71, 'high', 0.10, 250.00, true, true, false, true, 12890, NULL),
    ('The Dog House', 'the-dog-house', (SELECT category_id FROM category_ref), (SELECT pragmatic_id FROM provider_refs), '/images/games/the-dog-house.jpg', 96.51, 'high', 0.20, 100.00, true, false, false, true, 9876, NULL),
    ('Gates of Olympus', 'gates-of-olympus', (SELECT category_id FROM category_ref), (SELECT pragmatic_id FROM provider_refs), '/images/games/gates-of-olympus.jpg', 96.50, 'high', 0.20, 125.00, true, true, false, true, 18756, NULL),
    ('Fruit Party', 'fruit-party', (SELECT category_id FROM category_ref), (SELECT pragmatic_id FROM provider_refs), '/images/games/fruit-party.jpg', 96.50, 'high', 0.20, 100.00, true, false, true, false, 5432, NULL),
    ('Gudubet Mega', 'gudubet-mega', (SELECT category_id FROM category_ref), (SELECT gudubet_id FROM provider_refs), '/images/games/gudubet-mega.jpg', 97.20, 'medium', 0.10, 50.00, true, false, true, false, 1234, 75000.00),
    ('Turkish Delight', 'turkish-delight', (SELECT category_id FROM category_ref), (SELECT gudubet_id FROM provider_refs), '/images/games/turkish-delight.jpg', 96.85, 'low', 0.05, 25.00, true, false, true, false, 892, NULL),
    ('Book of Tut', 'book-of-tut', (SELECT category_id FROM category_ref), (SELECT evolution_id FROM provider_refs), '/images/games/book-of-tut.jpg', 96.28, 'high', 0.10, 100.00, true, false, false, false, 7654, NULL)
) AS game_data(name, slug, category_id, provider_id, thumbnail_url, rtp_percentage, volatility, min_bet, max_bet, has_demo, is_featured, is_new, is_popular, play_count, jackpot_amount)
WHERE NOT EXISTS (
  SELECT 1 FROM public.casino_games WHERE slug = game_data.slug
);