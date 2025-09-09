-- Insert a test super admin user
-- Note: Replace 'superadmin@example.com' with your preferred super admin email
-- The password hash is for 'admin123' - you should change this in production

INSERT INTO public.admins (
  id,
  email,
  password_hash,
  role_type,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'superadmin@gudubet.com',
  '$2b$10$5Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7O',  -- This is a placeholder hash
  'super_admin',
  true,
  now(),
  now()
) 
ON CONFLICT (email) DO UPDATE SET
  role_type = 'super_admin',
  is_active = true,
  updated_at = now();