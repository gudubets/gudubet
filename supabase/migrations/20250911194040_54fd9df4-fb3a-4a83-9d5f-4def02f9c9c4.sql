-- Add the current registered user as an admin for testing
-- First, let's add the user who registered (hzrhzr20@gmail.com) as an admin
INSERT INTO public.admins (
  id,
  email,
  password_hash,
  role_type,
  is_active,
  department
) 
SELECT 
  id,
  'hzrhzr20@gmail.com',
  'managed_by_auth',
  'moderator'::admin_role,
  true,
  'Operations'
FROM auth.users 
WHERE email = 'hzrhzr20@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role_type = 'moderator'::admin_role,
  is_active = true;