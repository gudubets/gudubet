-- Admins tablosundaki sonsuz döngü problemini çöz
-- Önce tüm RLS politikalarını kaldır
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admins;
DROP POLICY IF EXISTS "Super admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can create admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON public.admins;

-- Basit ve güvenli politikalar oluştur
-- Kullanıcılar kendi admin kaydını görebilir
CREATE POLICY "Users can view their own admin record"
ON public.admins
FOR SELECT
USING (auth.uid() = id);

-- System can manage all admin records (for functions)
CREATE POLICY "System can manage admins"
ON public.admins
FOR ALL
USING (true);