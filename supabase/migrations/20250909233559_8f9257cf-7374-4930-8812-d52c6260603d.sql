-- Hero section çevirilerini ekliyoruz
INSERT INTO public.translations (language_code, namespace, key, value) VALUES
-- Türkçe hero metinleri
('tr', 'hero', 'live_betting_casino', 'Canlı Bahis & Casino'),
('tr', 'hero', 'ready_to_win', 'Kazanmaya'),
('tr', 'hero', 'are_you_ready', 'Hazır mısın?'),
('tr', 'hero', 'description', 'Türkiye''nin en güvenilir bahis platformunda spor bahisleri, canlı casino ve slot oyunları ile büyük kazançlar seni bekliyor.'),
('tr', 'hero', 'start_now', 'Hemen Başla'),
('tr', 'hero', 'play_demo', 'Demo Oyna'),
('tr', 'hero', 'active_users', 'Aktif Kullanıcı'),
('tr', 'hero', 'daily_bets', 'Günlük Bahis'),
('tr', 'hero', 'win_rate', 'Kazanan Oranı'),
('tr', 'hero', 'featured_matches', 'Öne Çıkan Maçlar'),
('tr', 'hero', 'live', 'CANLI'),
('tr', 'hero', 'current', 'Güncel'),
('tr', 'hero', 'see_all_matches', 'Tüm Maçları Gör'),

-- İngilizce hero metinleri  
('en', 'hero', 'live_betting_casino', 'Live Betting & Casino'),
('en', 'hero', 'ready_to_win', 'Ready to'),
('en', 'hero', 'are_you_ready', 'Win?'),
('en', 'hero', 'description', 'Turkey''s most trusted betting platform with sports betting, live casino and slot games offering big wins awaiting you.'),
('en', 'hero', 'start_now', 'Get Started'),
('en', 'hero', 'play_demo', 'Play Demo'),
('en', 'hero', 'active_users', 'Active Users'),
('en', 'hero', 'daily_bets', 'Daily Bets'),
('en', 'hero', 'win_rate', 'Win Rate'),
('en', 'hero', 'featured_matches', 'Featured Matches'),
('en', 'hero', 'live', 'LIVE'),
('en', 'hero', 'current', 'Current'),
('en', 'hero', 'see_all_matches', 'See All Matches')
ON CONFLICT (language_code, namespace, key) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();