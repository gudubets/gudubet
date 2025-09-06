-- Admin aktivitelerini kaydetmek için tablo oluştur
CREATE TABLE public.admin_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type varchar NOT NULL,
  description text NOT NULL,
  target_id varchar,
  target_type varchar,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT admin_activities_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE
);

-- RLS politikaları
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Adminler kendi ve diğer admin aktivitelerini görebilir
CREATE POLICY "Admins can view activities"
ON public.admin_activities
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() 
    AND role_type IN ('super_admin', 'admin')
  )
);

-- Sadece super adminler aktivite kaydı ekleyebilir (sistem için)
CREATE POLICY "System can insert activities"
ON public.admin_activities
FOR INSERT
WITH CHECK (true);

-- İndeks oluştur
CREATE INDEX idx_admin_activities_admin_id ON public.admin_activities(admin_id);
CREATE INDEX idx_admin_activities_created_at ON public.admin_activities(created_at DESC);
CREATE INDEX idx_admin_activities_action_type ON public.admin_activities(action_type);