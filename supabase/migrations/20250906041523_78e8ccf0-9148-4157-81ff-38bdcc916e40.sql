-- Super admin kullanıcısını admins tablosuna ekle
INSERT INTO public.admins (id, email, role_type, password_hash)
VALUES (
  '42a6f23b-5fef-460b-b3b2-c04b14d0d079',
  'superadmin@casino.com',
  'super_admin',
  'hashed_password' -- Bu sadece placeholder, gerçek auth Supabase Auth'ta
)
ON CONFLICT (id) DO UPDATE SET
  role_type = 'super_admin',
  email = 'superadmin@casino.com';