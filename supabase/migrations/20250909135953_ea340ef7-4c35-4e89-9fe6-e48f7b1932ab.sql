-- Super admin olarak superadmin@casino.com email adresini ekle
-- Not: Bu email adresi ile kayıt olduğunuzda otomatik olarak super admin olacaksınız

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
  'superadmin@casino.com',
  '$2b$10$placeholder_hash_for_manual_admin',  -- Placeholder hash - kullanıcı normal kayıt işlemi yapacak
  'super_admin',
  true,
  now(),
  now()
) 
ON CONFLICT (email) DO UPDATE SET
  role_type = 'super_admin',
  is_active = true,
  updated_at = now();