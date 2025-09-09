-- Create missing tables and complete RBAC setup

-- Create role permissions mapping table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role admin_role_new NOT NULL,
  permission admin_permission NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by UUID REFERENCES public.admins(id),
  UNIQUE(role, permission)
);

-- Create admin sessions table for better session management
CREATE TABLE public.admin_sessions (
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

-- Create RLS policies for role_permissions
CREATE POLICY "Admins can view role permissions" ON public.role_permissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type IN ('super_admin', 'crm'))
  );

CREATE POLICY "Super admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin')
  );

-- Create RLS policies for admin_sessions  
CREATE POLICY "Admins can view their own sessions" ON public.admin_sessions
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Super admins can view all sessions" ON public.admin_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role_type = 'super_admin')
  );

CREATE POLICY "System can manage sessions" ON public.admin_sessions
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);
CREATE INDEX idx_admins_role_type ON public.admins(role_type);
CREATE INDEX idx_admins_is_active ON public.admins(is_active);