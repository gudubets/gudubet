-- Admins tablosu için RLS politikalarını ekle
-- Bu olmadan useAdminAccess hook'u çalışmaz

-- RLS'yi etkinleştir
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi admin kaydını görebilir
CREATE POLICY "Users can view their own admin record"
ON public.admins
FOR SELECT
USING (auth.uid() = id);

-- Super adminler tüm adminleri görebilir
CREATE POLICY "Super admins can view all admins"
ON public.admins
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND role_type = 'super_admin' AND is_active = true
  )
);

-- Super adminler yeni adminler oluşturabilir
CREATE POLICY "Super admins can create admins"
ON public.admins
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND role_type = 'super_admin' AND is_active = true
  )
);

-- Super adminler adminleri güncelleyebilir
CREATE POLICY "Super admins can update admins"
ON public.admins
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND role_type = 'super_admin' AND is_active = true
  )
);