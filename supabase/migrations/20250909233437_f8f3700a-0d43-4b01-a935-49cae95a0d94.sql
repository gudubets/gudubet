-- Navigation ve UI çevirileri ekliyoruz
INSERT INTO public.translations (language_code, namespace, key, value) VALUES
-- Türkçe navigation items
('tr', 'common', 'sports', 'SPOR'),
('tr', 'common', 'live_betting', 'CANLI BAHİS'),
('tr', 'common', 'casino', 'CASİNO'),
('tr', 'common', 'live_casino', 'CANLI CASİNO'),
('tr', 'common', 'bonuses', 'BONUSLAR'),
('tr', 'common', 'vip_program', 'VIP PROGRAMI'),
('tr', 'common', 'login_button', 'GİRİŞ'),
('tr', 'common', 'register_button', 'ÜYE OL'),

-- İngilizce navigation items  
('en', 'common', 'sports', 'SPORTS'),
('en', 'common', 'live_betting', 'LIVE BETTING'),
('en', 'common', 'casino', 'CASINO'),
('en', 'common', 'live_casino', 'LIVE CASINO'),
('en', 'common', 'bonuses', 'BONUSES'),
('en', 'common', 'vip_program', 'VIP PROGRAM'),
('en', 'common', 'login_button', 'LOGIN'),
('en', 'common', 'register_button', 'SIGN UP')
ON CONFLICT (language_code, namespace, key) DO UPDATE SET
value = EXCLUDED.value,
updated_at = now();