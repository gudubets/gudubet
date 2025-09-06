-- Add VIP category promotions and update some existing ones
INSERT INTO public.promotions (title, description, detailed_description, image_url, category, bonus_percentage, min_deposit, max_bonus, wagering_requirement, promo_code, terms_conditions, start_date, end_date, max_participants) VALUES
('VIP Platin Bonusu', '%200 VIP Platin Üyelik Bonusu', 'Sadece VIP Platin üyelerimiz için özel %200 hoş geldin bonusu. Sınırsız yatırım bonusu ve özel turnuva davetleri dahil.', '/api/placeholder/400/250', 'special', 200, 500, 5000, 35, 'VIPPLATIN200', 'Sadece VIP Platin üyeler katılabilir. Minimum 500 TL yatırım gereklidir. 35x çevrim şartı vardır.', now(), now() + interval '14 days', 50),

('Mega Jackpot Bonusu', '₺10.000 Mega Jackpot Şansı', 'Bu ayın mega jackpot promosyonu! Her 100 TL yatırımda bir çekiliş hakkı kazanın ve 10.000 TL mega jackpotu kazanma şansı yakalayın.', '/api/placeholder/400/250', 'special', NULL, 100, NULL, 1, 'MEGAJACKPOT', 'Her 100 TL yatırımda 1 çekiliş hakkı. 31 Ocak gecesi çekiliş yapılacak. Çevrim şartı yoktur.', now(), now() + interval '7 days', 1000),

('Hızlı Yatırım Bonusu', '%75 Ekspres Bonus - 30 Dakika', 'İlk 30 dakikada yatırım yapanlara özel %75 bonus! Hızlı karar verenlere özel fırsat.', '/api/placeholder/400/250', 'deposit', 75, 50, 750, 20, 'HIZLI75', 'Promosyon başlangıcından 30 dakika içinde geçerli. 20x çevrim şartı vardır.', now(), now() + interval '30 minutes', 100),

('Weekend Casino Bonusu', 'Hafta Sonu %100 Casino Bonusu', 'Cumartesi ve Pazar günleri casino oyunlarında %100 bonus kazanın. Canlı casino dahil!', '/api/placeholder/400/250', 'deposit', 100, 100, 1000, 25, 'WEEKEND100', 'Sadece hafta sonu geçerli. Casino ve canlı casino oyunlarında kullanılabilir.', now(), now() + interval '2 days', 200);

-- Update existing promotions to add promo codes
UPDATE public.promotions 
SET promo_code = 'HOSGELDIN100'
WHERE title = 'Hoş Geldin Bonusu';

UPDATE public.promotions 
SET promo_code = 'YATIRIM50', max_participants = 500, current_participants = 127
WHERE title = 'Yatırım Bonusu';

UPDATE public.promotions 
SET promo_code = 'FREEBET10', max_participants = 1000, current_participants = 834
WHERE title = '10 TL Freebet';

UPDATE public.promotions 
SET max_participants = 300, current_participants = 89
WHERE title = '%10 Cashback';