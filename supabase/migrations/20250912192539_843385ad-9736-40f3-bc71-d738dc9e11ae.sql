-- Ensure all users have consistent balance data in profiles table
-- This will sync any missing balance data from wallets to profiles

-- First, update profiles table with balance data from wallets where profiles balance is null or 0
UPDATE public.profiles 
SET 
  balance = COALESCE(w.balance, 0),
  bonus_balance = COALESCE(bw.balance, 0)
FROM public.wallets w
LEFT JOIN public.bonus_wallets bw ON bw.user_id = w.user_id AND bw.type = 'bonus'
WHERE profiles.id = w.user_id 
  AND w.type = 'main'
  AND (profiles.balance IS NULL OR profiles.balance = 0);

-- Ensure all profiles have balance fields set (set to 0 if null)
UPDATE public.profiles 
SET 
  balance = COALESCE(balance, 0),
  bonus_balance = COALESCE(bonus_balance, 0)
WHERE balance IS NULL OR bonus_balance IS NULL;