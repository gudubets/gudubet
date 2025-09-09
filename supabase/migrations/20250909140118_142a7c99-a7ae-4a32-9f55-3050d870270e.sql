-- Admin role türü problemini düzelt
-- Önce admin_role türünü kaldır ve admin_role_new'i ana tür yap

-- Mevcut admin_role türünü düşür (eğer varsa)
DROP TYPE IF EXISTS public.admin_role CASCADE;

-- admin_role_new'i admin_role olarak yeniden adlandır
ALTER TYPE public.admin_role_new RENAME TO admin_role;

-- Fonksiyonları yeniden oluştur - doğru türle
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role_type FROM public.admins WHERE id = auth.uid();
$$;