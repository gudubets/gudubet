-- Create comprehensive RBAC system for casino admin panel

-- Create admin roles enum (updated)
CREATE TYPE admin_role_new AS ENUM ('super_admin', 'finance', 'crm', 'support', 'moderator');

-- Create admin permissions enum
CREATE TYPE admin_permission AS ENUM (
  'user_management',
  'user_ban',
  'user_kyc',
  'finance_approval',
  'deposit_approval', 
  'withdrawal_approval',
  'bonus_create',
  'bonus_manage',
  'bonus_delete',
  'game_management',
  'game_publish',
  'game_unpublish',
  'category_management',
  'report_access',
  'financial_reports',
  'user_reports',
  'game_reports',
  'admin_management',
  'system_settings',
  'audit_logs'
);

-- Update admins table to use new role type
ALTER TABLE public.admins 
DROP COLUMN IF EXISTS role,
ADD COLUMN IF NOT EXISTS department VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.admins(id);

-- Update role_type to use new enum (backup old data first)
ALTER TABLE public.admins ALTER COLUMN role_type DROP DEFAULT;
ALTER TABLE public.admins ALTER COLUMN role_type TYPE TEXT;
UPDATE public.admins SET role_type = 'super_admin' WHERE role_type = 'admin';
ALTER TABLE public.admins ALTER COLUMN role_type TYPE admin_role_new USING role_type::admin_role_new;
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

-- Update RLS policies for admins table
DROP POLICY IF EXISTS "Admins can view themselves" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON public.admins;

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

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission, granted_by) VALUES
-- Super Admin - all permissions
('super_admin', 'user_management', NULL),
('super_admin', 'user_ban', NULL),
('super_admin', 'user_kyc', NULL),
('super_admin', 'finance_approval', NULL),
('super_admin', 'deposit_approval', NULL),
('super_admin', 'withdrawal_approval', NULL),
('super_admin', 'bonus_create', NULL),
('super_admin', 'bonus_manage', NULL),
('super_admin', 'bonus_delete', NULL),
('super_admin', 'game_management', NULL),
('super_admin', 'game_publish', NULL),
('super_admin', 'game_unpublish', NULL),
('super_admin', 'category_management', NULL),
('super_admin', 'report_access', NULL),
('super_admin', 'financial_reports', NULL),
('super_admin', 'user_reports', NULL),
('super_admin', 'game_reports', NULL),
('super_admin', 'admin_management', NULL),
('super_admin', 'system_settings', NULL),
('super_admin', 'audit_logs', NULL),

-- Finance - financial operations
('finance', 'finance_approval', NULL),
('finance', 'deposit_approval', NULL),
('finance', 'withdrawal_approval', NULL),
('finance', 'financial_reports', NULL),
('finance', 'report_access', NULL),
('finance', 'user_kyc', NULL),

-- CRM - customer relations  
('crm', 'user_management', NULL),
('crm', 'user_ban', NULL),
('crm', 'user_kyc', NULL),
('crm', 'bonus_create', NULL),
('crm', 'bonus_manage', NULL),
('crm', 'report_access', NULL),
('crm', 'user_reports', NULL),

-- Support - customer support
('support', 'user_management', NULL),
('support', 'report_access', NULL),
('support', 'user_reports', NULL),

-- Moderator - basic monitoring
('moderator', 'report_access', NULL),
('moderator', 'user_reports', NULL);

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.check_admin_permission(
  _admin_id UUID,
  _permission admin_permission
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_role admin_role_new;
BEGIN
  -- Get admin role
  SELECT role_type INTO _admin_role
  FROM public.admins 
  WHERE id = _admin_id AND is_active = true;
  
  IF _admin_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Super admin has all permissions
  IF _admin_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions 
    WHERE role = _admin_role AND permission = _permission
  );
END;
$$;

-- Create function to get admin permissions
CREATE OR REPLACE FUNCTION public.get_admin_permissions(_admin_id UUID)
RETURNS admin_permission[]
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  _admin_role admin_role_new;
  _permissions admin_permission[];
BEGIN
  -- Get admin role
  SELECT role_type INTO _admin_role
  FROM public.admins 
  WHERE id = _admin_id AND is_active = true;
  
  IF _admin_role IS NULL THEN
    RETURN ARRAY[]::admin_permission[];
  END IF;
  
  -- Super admin has all permissions
  IF _admin_role = 'super_admin' THEN
    SELECT ARRAY(
      SELECT unnest(enum_range(NULL::admin_permission))
    ) INTO _permissions;
    RETURN _permissions;
  END IF;
  
  -- Get role-specific permissions
  SELECT ARRAY(
    SELECT permission 
    FROM public.role_permissions 
    WHERE role = _admin_role
  ) INTO _permissions;
  
  RETURN COALESCE(_permissions, ARRAY[]::admin_permission[]);
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admins_role_type ON public.admins(role_type);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);

-- Update existing admin to super_admin if needed
UPDATE public.admins 
SET role_type = 'super_admin'::admin_role_new,
    is_active = true,
    department = 'Management'
WHERE email IN ('superadmin@casino.com', 'admin@example.com');