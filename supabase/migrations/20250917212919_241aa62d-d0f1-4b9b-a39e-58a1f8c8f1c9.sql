-- Insert demo game providers with Ubisoft and other major providers
INSERT INTO public.game_providers (name, slug, provider_type, api_endpoint, status, logo_url, website_url, is_active, sort_order) VALUES
('Pragmatic Play', 'pragmatic-play', 'external', 'https://api.pragmaticplay.net', 'active', '/placeholder.svg', 'https://www.pragmaticplay.com', true, 1),
('Evolution Gaming', 'evolution-gaming', 'external', 'https://api.evolution.com', 'active', '/placeholder.svg', 'https://www.evolution.com', true, 2),
('NetEnt', 'netent', 'external', 'https://api.netent.com', 'active', '/placeholder.svg', 'https://www.netent.com', true, 3),
('Microgaming', 'microgaming', 'external', 'https://api.microgaming.com', 'active', '/placeholder.svg', 'https://www.microgaming.co.uk', true, 4),
('Play''n GO', 'play-n-go', 'external', 'https://api.playngo.com', 'active', '/placeholder.svg', 'https://www.playngo.com', true, 5),
('Red Tiger Gaming', 'red-tiger', 'external', 'https://api.redtiger.com', 'active', '/placeholder.svg', 'https://www.redtiger.com', true, 6),
('Yggdrasil', 'yggdrasil', 'external', 'https://api.yggdrasil.com', 'active', '/placeholder.svg', 'https://www.yggdrasil.com', true, 7),
('Ubisoft', 'ubisoft', 'external', 'https://api.ubisoft.com', 'active', '/placeholder.svg', 'https://www.ubisoft.com', true, 8),
('Habanero', 'habanero', 'external', 'https://api.habanero.com', 'active', '/placeholder.svg', 'https://www.habanero.com', true, 9),
('Push Gaming', 'push-gaming', 'external', 'https://api.pushgaming.com', 'active', '/placeholder.svg', 'https://www.pushgaming.com', true, 10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  provider_type = EXCLUDED.provider_type,
  api_endpoint = EXCLUDED.api_endpoint,
  status = EXCLUDED.status,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Create demo games for each provider
INSERT INTO public.casino_games (name, slug, provider_id, category_id, thumbnail_url, game_url, rtp_percentage, min_bet, max_bet, volatility, is_new, is_popular, is_featured, is_active) 
SELECT 
  provider_name || ' ' || game_name as name,
  LOWER(REPLACE(provider_name || '-' || game_name, ' ', '-')) as slug,
  gp.id as provider_id,
  (SELECT id FROM casino_categories WHERE name = 'Slot' LIMIT 1) as category_id,
  '/placeholder.svg' as thumbnail_url,
  '/slot-game/' || LOWER(REPLACE(provider_name || '-' || game_name, ' ', '-')) as game_url,
  rtp,
  min_bet,
  max_bet,
  volatility,
  is_new,
  is_popular,
  is_featured,
  true as is_active
FROM (
  VALUES 
    -- Pragmatic Play Games
    ('Pragmatic Play', 'Sweet Bonanza', 96.51, 0.20, 100.00, 'high', true, true, true),
    ('Pragmatic Play', 'Wolf Gold', 96.01, 0.25, 125.00, 'medium', false, true, true),
    ('Pragmatic Play', 'The Dog House', 96.51, 0.20, 100.00, 'high', false, true, false),
    ('Pragmatic Play', 'Great Rhino Megaways', 96.58, 0.20, 100.00, 'high', true, false, true),
    
    -- Evolution Gaming
    ('Evolution Gaming', 'Lightning Roulette', 97.30, 1.00, 5000.00, 'low', false, true, true),
    ('Evolution Gaming', 'Crazy Time', 96.08, 0.10, 2500.00, 'high', true, true, true),
    ('Evolution Gaming', 'Monopoly Live', 96.23, 0.10, 2000.00, 'medium', false, true, false),
    
    -- NetEnt
    ('NetEnt', 'Starburst', 96.09, 0.10, 100.00, 'low', false, true, true),
    ('NetEnt', 'Gonzo''s Quest', 95.97, 0.20, 50.00, 'medium', false, true, false),
    ('NetEnt', 'Book of Dead', 96.21, 0.01, 100.00, 'high', false, false, true),
    
    -- Microgaming
    ('Microgaming', 'Mega Moolah', 88.12, 0.25, 6.25, 'high', false, true, true),
    ('Microgaming', 'Thunderstruck II', 96.65, 0.30, 15.00, 'medium', false, false, false),
    
    -- Play'n GO
    ('Play''n GO', 'Rich Wilde and the Book of Dead', 96.21, 0.01, 100.00, 'high', false, true, true),
    ('Play''n GO', 'Moon Princess', 96.50, 0.20, 100.00, 'high', true, false, false),
    
    -- Red Tiger Gaming
    ('Red Tiger Gaming', 'Pirates'' Plenty', 95.73, 0.20, 100.00, 'medium', false, false, true),
    ('Red Tiger Gaming', 'Dragon''s Luck', 96.29, 0.10, 500.00, 'medium', true, false, false),
    
    -- Yggdrasil
    ('Yggdrasil', 'Vikings Go Berzerk', 96.10, 0.25, 125.00, 'high', false, false, true),
    ('Yggdrasil', 'Valley of the Gods', 96.20, 0.10, 100.00, 'high', true, false, false),
    
    -- Ubisoft Games
    ('Ubisoft', 'Assassin''s Creed Slots', 96.30, 0.20, 100.00, 'medium', true, true, true),
    ('Ubisoft', 'Watch Dogs Casino', 95.80, 0.50, 200.00, 'high', true, false, true),
    ('Ubisoft', 'Far Cry Adventure', 96.15, 0.25, 150.00, 'medium', false, true, false),
    ('Ubisoft', 'Prince of Persia Treasures', 96.45, 0.30, 125.00, 'high', true, false, true),
    
    -- Habanero
    ('Habanero', 'Hot Hot Fruit', 96.67, 0.25, 5000.00, 'medium', false, false, false),
    ('Habanero', 'Mystic Fortune', 96.28, 0.30, 3000.00, 'high', true, false, false),
    
    -- Push Gaming
    ('Push Gaming', 'Razor Shark', 96.70, 0.20, 100.00, 'high', true, true, true),
    ('Push Gaming', 'Fat Rabbit', 96.45, 0.25, 100.00, 'high', false, true, false)
) AS demo_games(provider_name, game_name, rtp, min_bet, max_bet, volatility, is_new, is_popular, is_featured)
JOIN public.game_providers gp ON gp.name = demo_games.provider_name
ON CONFLICT (slug) DO NOTHING;