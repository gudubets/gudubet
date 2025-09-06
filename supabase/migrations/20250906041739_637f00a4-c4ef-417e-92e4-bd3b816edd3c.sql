-- Super admin kullanıcısının ID'sini Supabase Auth'taki ID ile eşleştir
UPDATE public.admins 
SET id = '42a6f23b-5fef-460b-b3b2-c04b14d0d079'
WHERE email = 'superadmin@casino.com';