-- Create user records for existing authenticated users who don't have entries in the users table
-- This is a one-time fix for users who signed up before the trigger was updated

INSERT INTO public.users (
  auth_user_id,
  email,
  username,
  first_name,
  last_name,
  phone,
  country,
  date_of_birth,
  balance,
  bonus_balance,
  status,
  kyc_status,
  email_verified,
  phone_verified
)
SELECT DISTINCT
  p.user_id,
  au.email,
  COALESCE(p.first_name, split_part(au.email, '@', 1)),
  p.first_name,
  p.last_name,
  p.phone,
  p.country,
  p.date_of_birth,
  0.00,
  0.00,
  'active',
  'pending',
  TRUE,
  p.phone_verified
FROM auth.users au
INNER JOIN public.profiles p ON p.user_id = au.id
LEFT JOIN public.users u ON u.auth_user_id = au.id
WHERE u.auth_user_id IS NULL;