-- Super admin kullanıcısı için users tablosuna kayıt ekle
-- Bu, auth.users tablosundaki kullanıcı ile bağlantı kurar

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
) VALUES (
  '42a6f23b-5fef-460b-b3b2-c04b14d0d079',  -- superadmin@casino.com'un auth.users ID'si
  'superadmin@casino.com',
  'superadmin',
  'Super',
  'Admin',
  1000.00,  -- Başlangıç bakiyesi
  0.00,
  'active',
  'verified',
  true,
  false
) ON CONFLICT (auth_user_id) DO UPDATE SET
  email = EXCLUDED.email,
  status = 'active',
  kyc_status = 'verified',
  email_verified = true;