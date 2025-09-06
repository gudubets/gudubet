-- Mevcut admin kullanıcısının role_type'ını super_admin olarak güncelle
UPDATE public.admins 
SET role_type = 'super_admin'
WHERE email = 'superadmin@casino.com';