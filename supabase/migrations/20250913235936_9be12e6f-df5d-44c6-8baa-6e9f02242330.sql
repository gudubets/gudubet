INSERT INTO bonuses_new (
  name, 
  type, 
  amount_type, 
  amount_value, 
  min_deposit, 
  max_cap, 
  rollover_multiplier, 
  code, 
  description, 
  is_active,
  valid_from,
  valid_to
) VALUES (
  'VIP Exclusive Bonus', 
  'RELOAD', 
  'percent', 
  50, 
  1000, 
  5000, 
  15, 
  'VIP50', 
  'Sadece VIP üyeler için özel bonus', 
  true,
  NOW(),
  NOW() + INTERVAL '30 days'
);