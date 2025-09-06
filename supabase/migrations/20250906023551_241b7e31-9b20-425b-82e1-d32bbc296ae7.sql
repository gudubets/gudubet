-- Sports categories - insert sample data
INSERT INTO public.sports (name, slug, icon_url, is_active, sort_order) VALUES
('Futbol', 'futbol', 'https://example.com/football.svg', true, 1),
('Basketbol', 'basketbol', 'https://example.com/basketball.svg', true, 2),
('Tenis', 'tenis', 'https://example.com/tennis.svg', true, 3),
('E-Spor', 'e-spor', 'https://example.com/esports.svg', true, 4),
('Voleybol', 'voleybol', 'https://example.com/volleyball.svg', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Sample leagues
INSERT INTO public.leagues (sport_id, name, slug, country, logo_url, is_active, sort_order) VALUES
((SELECT id FROM public.sports WHERE slug = 'futbol'), 'Süper Lig', 'super-lig', 'TR', 'https://example.com/superlig.svg', true, 1),
((SELECT id FROM public.sports WHERE slug = 'futbol'), 'Premier League', 'premier-league', 'GB', 'https://example.com/premier.svg', true, 2),
((SELECT id FROM public.sports WHERE slug = 'futbol'), 'La Liga', 'la-liga', 'ES', 'https://example.com/laliga.svg', true, 3),
((SELECT id FROM public.sports WHERE slug = 'basketbol'), 'NBA', 'nba', 'US', 'https://example.com/nba.svg', true, 1),
((SELECT id FROM public.sports WHERE slug = 'basketbol'), 'EuroLeague', 'euroleague', 'EU', 'https://example.com/euroleague.svg', true, 2)
ON CONFLICT (slug) DO NOTHING;

-- Sample game providers
INSERT INTO public.game_providers (name, slug, logo_url, website_url, is_active, sort_order) VALUES
('Pragmatic Play', 'pragmatic-play', 'https://example.com/pragmatic.svg', 'https://pragmaticplay.com', true, 1),
('Evolution Gaming', 'evolution-gaming', 'https://example.com/evolution.svg', 'https://evolution.com', true, 2),
('NetEnt', 'netent', 'https://example.com/netent.svg', 'https://netent.com', true, 3),
('Microgaming', 'microgaming', 'https://example.com/microgaming.svg', 'https://microgaming.com', true, 4),
('Play\'n GO', 'playn-go', 'https://example.com/playngo.svg', 'https://playngo.com', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Sample casino games
INSERT INTO public.games (provider_id, name, slug, game_type, category, thumbnail_url, description, min_bet, max_bet, rtp_percentage, volatility, has_demo, is_featured, is_active, sort_order) VALUES
((SELECT id FROM public.game_providers WHERE slug = 'pragmatic-play'), 'Sweet Bonanza', 'sweet-bonanza', 'slot', 'fruit_slots', 'https://example.com/sweet-bonanza.jpg', 'Tatlı meyvelerle dolu slot oyunu', 0.20, 100.00, 96.51, 'high', true, true, true, 1),
((SELECT id FROM public.game_providers WHERE slug = 'pragmatic-play'), 'Gates of Olympus', 'gates-of-olympus', 'slot', 'mythology', 'https://example.com/gates-olympus.jpg', 'Zeus\'un kapılarında büyük kazançlar', 0.20, 125.00, 96.50, 'high', true, true, true, 2),
((SELECT id FROM public.game_providers WHERE slug = 'evolution-gaming'), 'Lightning Roulette', 'lightning-roulette', 'live_casino', 'roulette', 'https://example.com/lightning-roulette.jpg', 'Şimşekli rulet oyunu', 0.50, 5000.00, 97.30, 'medium', false, true, true, 3),
((SELECT id FROM public.game_providers WHERE slug = 'evolution-gaming'), 'Crazy Time', 'crazy-time', 'live_casino', 'game_show', 'https://example.com/crazy-time.jpg', 'Çılgın casino oyunu', 0.10, 2500.00, 96.08, 'high', false, true, true, 4),
((SELECT id FROM public.game_providers WHERE slug = 'netent'), 'Starburst', 'starburst', 'slot', 'classic', 'https://example.com/starburst.jpg', 'Klasik uzay temalı slot', 0.10, 100.00, 96.09, 'low', true, false, true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Sample bonus campaigns
INSERT INTO public.bonus_campaigns (name, slug, description, bonus_type, trigger_type, amount_type, amount_value, max_amount, min_deposit, wagering_requirement, valid_days, max_uses_per_user, is_active) VALUES
('Hoş Geldin Bonusu', 'hos-geldin-bonusu', 'Yeni üyelere özel %100 bonus', 'welcome', 'registration', 'percentage', 100.00, 1000.00, 50.00, 35, 30, 1, true),
('İlk Yatırım Bonusu', 'ilk-yatirim-bonusu', 'İlk yatırımınızda %50 bonus', 'deposit', 'deposit', 'percentage', 50.00, 500.00, 100.00, 25, 15, 1, true),
('Haftalık Cashback', 'haftalik-cashback', 'Haftalık %10 geri ödeme', 'cashback', 'manual', 'percentage', 10.00, 200.00, NULL, 1, 7, 1, true),
('Free Spin Bonusu', 'free-spin-bonusu', '50 adet bedava spin', 'free_spin', 'promotion_code', 'fixed', 50.00, NULL, 20.00, 30, 10, 1, true)
ON CONFLICT (slug) DO NOTHING;