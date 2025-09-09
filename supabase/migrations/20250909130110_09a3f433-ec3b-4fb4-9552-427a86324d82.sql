-- Continue building the RBAC system

-- Update admins table structure
ALTER TABLE public.admins 
ADD COLUMN IF NOT EXISTS department VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Update role_type column to use new enum
ALTER TABLE public.admins ALTER COLUMN role_type DROP DEFAULT;
UPDATE public.admins SET role_type = 'super_admin' WHERE role_type::text IN ('admin', 'super_admin');
ALTER TABLE public.admins ALTER COLUMN role_type TYPE admin_role_new USING 'super_admin'::admin_role_new;
ALTER TABLE public.admins ALTER COLUMN role_type SET DEFAULT 'moderator'::admin_role_new;

-- Create role permissions mapping table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role admin_role_new NOT NULL,
  permission admin_permission NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES public.admins(id),
  UNIQUE(role, permission)
);

-- Create admin sessions table for better session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on new tables
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Recreate admin policies with new enum type
CREATE POLICY "Admins can view themselves and same level" ON public.admins
  FOR SELECT USING (
    id = auth.uid() OR 
    (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type IN ('super_admin', 'crm')))
  );

CREATE POLICY "Super admins can manage all admins" ON public.admins
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin')
  );

CREATE POLICY "CRM can manage lower level admins" ON public.admins
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'crm') AND
    role_type NOT IN ('super_admin', 'crm')
  );

-- Recreate admin activities policy
CREATE POLICY "Admins can view activities" ON public.admin_activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type IN ('super_admin', 'crm'))
  );

CREATE POLICY "System can insert activities" ON public.admin_activities
  FOR INSERT WITH CHECK (true);

-- Recreate notifications policy  
CREATE POLICY "Admins can manage notifications" ON public.notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type IN ('super_admin', 'crm'))
  );

CREATE POLICY "Users can view active notifications for them or global" ON public.notifications
  FOR SELECT USING (
    (is_active = true) AND 
    ((expires_at IS NULL) OR (expires_at > now())) AND 
    ((target_user_id IS NULL) OR (target_user_id = auth.uid()))
  );

-- RLS policies for role_permissions
CREATE POLICY "Admins can view role permissions" ON public.role_permissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type IN ('super_admin', 'crm'))
  );

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin')
  );

-- RLS policies for admin_sessions  
CREATE POLICY "Admins can view their own sessions" ON public.admin_sessions
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Super admins can view all sessions" ON public.admin_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin')
  );

CREATE POLICY "System can manage sessions" ON public.admin_sessions
  FOR ALL USING (true);