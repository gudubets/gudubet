-- Önce admin_permissions'dan super admin'in kayıtlarını sil
DELETE FROM public.admin_permissions 
WHERE admin_id = 'f366e9cd-9e46-4fea-846e-57eb22f3b0df';

-- Sonra admins tablosundaki ID'yi güncelle
UPDATE public.admins 
SET id = '42a6f23b-5fef-460b-b3b2-c04b14d0d079'
WHERE email = 'superadmin@casino.com';