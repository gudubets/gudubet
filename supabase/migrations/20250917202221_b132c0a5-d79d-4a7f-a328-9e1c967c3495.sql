-- Test admin kullanıcısı oluştur (eğer yoksa)
INSERT INTO public.admins (
  id, 
  email, 
  password_hash, 
  role_type, 
  is_active
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Test UUID
  'admin@gudubet.com',
  '$2a$10$test.hash.for.development.only', -- Placeholder hash
  'super_admin',
  true
) ON CONFLICT (id) DO NOTHING;

-- Alternatif olarak mevcut bir Supabase auth kullanıcısını admin yapmak için:
-- 1. Önce auth.users tablosundan bir kullanıcı ID'si alın
-- 2. O ID'yi admins tablosuna ekleyin

-- Mevcut auth kullanıcılarını görmek için (sadece kontrol amaçlı):
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;