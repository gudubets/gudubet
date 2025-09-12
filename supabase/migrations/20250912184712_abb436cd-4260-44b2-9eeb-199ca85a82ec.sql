-- Insert missing user record with correct kyc_status
INSERT INTO public.users (id, auth_user_id, email, username, kyc_level, kyc_status)
SELECT 
  au.id,
  au.id,
  au.email,
  'user_' || substring(au.id::text, 1, 8),
  'level_2',
  'pending'
FROM auth.users au 
WHERE au.id = '18af9be5-9862-41df-b3a7-e084a0d84ed4'
ON CONFLICT (id) DO UPDATE SET
  kyc_level = EXCLUDED.kyc_level,
  kyc_status = EXCLUDED.kyc_status;