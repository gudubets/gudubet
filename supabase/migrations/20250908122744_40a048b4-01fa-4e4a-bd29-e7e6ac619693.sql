-- Insert sample slot games
INSERT INTO public.slot_games (
  name,
  slug,
  provider,
  rtp,
  min_bet,
  max_bet,
  reels,
  rows,
  paylines,
  symbols,
  paytable,
  thumbnail_url,
  is_active
) VALUES
(
  'Gates of Olympus',
  'vs20olympgate',
  'Pragmatic Play',
  96.50,
  0.20,
  125.00,
  6,
  5,
  20,
  '["zeus", "crown", "hourglass", "ring", "chalice", "gem_blue", "gem_green", "gem_red", "gem_purple"]'::jsonb,
  '{"zeus": {"5": 50, "4": 12, "3": 5}, "crown": {"5": 25, "4": 10, "3": 2}, "hourglass": {"5": 10, "4": 5, "3": 1}, "ring": {"5": 5, "4": 2, "3": 0.8}, "chalice": {"5": 2.5, "4": 1, "3": 0.4}, "gem_blue": {"5": 1.5, "4": 0.6, "3": 0.3}, "gem_green": {"5": 1.2, "4": 0.5, "3": 0.25}, "gem_red": {"5": 1, "4": 0.4, "3": 0.2}, "gem_purple": {"5": 0.8, "4": 0.3, "3": 0.15}}'::jsonb,
  'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20olympgate.png',
  true
),
(
  'Sweet Bonanza',
  'vs20fruitsw',
  'Pragmatic Play',
  96.48,
  0.20,
  125.00,
  6,
  5,
  20,
  '["lollipop", "watermelon", "grape", "plum", "apple", "banana", "heart", "diamond", "square", "circle"]'::jsonb,
  '{"lollipop": {"5": 50, "4": 12, "3": 5}, "watermelon": {"5": 25, "4": 10, "3": 2}, "grape": {"5": 10, "4": 5, "3": 1}, "plum": {"5": 5, "4": 2, "3": 0.8}, "apple": {"5": 2.5, "4": 1, "3": 0.4}, "banana": {"5": 1.5, "4": 0.6, "3": 0.3}, "heart": {"5": 1.2, "4": 0.5, "3": 0.25}, "diamond": {"5": 1, "4": 0.4, "3": 0.2}, "square": {"5": 0.8, "4": 0.3, "3": 0.15}, "circle": {"5": 0.6, "4": 0.25, "3": 0.1}}'::jsonb,
  'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20fruitsw.png',
  true
),
(
  'Wolf Gold',
  'ws20wolfgold',
  'Pragmatic Play',
  96.01,
  0.25,
  125.00,
  5,
  3,
  25,
  '["wolf", "buffalo", "eagle", "horse", "cougar", "ace", "king", "queen", "jack", "ten", "wild", "scatter"]'::jsonb,
  '{"wolf": {"5": 200, "4": 50, "3": 20}, "buffalo": {"5": 150, "4": 40, "3": 15}, "eagle": {"5": 100, "4": 30, "3": 10}, "horse": {"5": 75, "4": 25, "3": 8}, "cougar": {"5": 50, "4": 20, "3": 5}, "ace": {"5": 25, "4": 10, "3": 2}, "king": {"5": 20, "4": 8, "3": 1.5}, "queen": {"5": 15, "4": 6, "3": 1}, "jack": {"5": 10, "4": 4, "3": 0.8}, "ten": {"5": 8, "4": 3, "3": 0.6}, "wild": {"multiplier": 2}, "scatter": {"bonus": true}}'::jsonb,
  'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/ws20wolfgold.png',
  true
),
(
  'Classic Slots',
  'classic-777',
  'Gudubet',
  95.00,
  0.10,
  50.00,
  3,
  3,
  5,
  '["seven", "bell", "bar", "cherry", "lemon", "orange", "plum", "watermelon", "wild"]'::jsonb,
  '{"seven": {"3": 100, "2": 10}, "bell": {"3": 50, "2": 5}, "bar": {"3": 25, "2": 2.5}, "cherry": {"3": 10, "2": 1, "1": 0.5}, "lemon": {"3": 8, "2": 0.8}, "orange": {"3": 6, "2": 0.6}, "plum": {"3": 4, "2": 0.4}, "watermelon": {"3": 2, "2": 0.2}, "wild": {"multiplier": 3}}'::jsonb,
  '/placeholder.svg',
  true
);

-- Insert sample users data to avoid balance issues (for testing purposes)
INSERT INTO public.users (
  auth_user_id,
  email,
  username,
  first_name,
  last_name,
  balance,
  bonus_balance,
  status,
  kyc_status,
  email_verified
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'test@example.com',
  'testuser',
  'Test',
  'User',
  1000.00,
  100.00,
  'active',
  'approved',
  true
) ON CONFLICT (auth_user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  bonus_balance = EXCLUDED.bonus_balance;