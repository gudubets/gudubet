-- Create a user record for the current authenticated user
-- This will allow the balance system to work for existing users

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
  email_verified,
  phone_verified
)
VALUES (
  'fe6ab42f-de75-42d5-b1cb-cbfd61fca157',
  'ugurcan212334@gmail.com',
  'delici',
  'delici',
  'demir',
  100.00,  -- Give some initial balance for testing
  50.00,   -- Give some initial bonus balance for testing
  'active',
  'pending',
  TRUE,
  FALSE
)
ON CONFLICT (auth_user_id) DO NOTHING;