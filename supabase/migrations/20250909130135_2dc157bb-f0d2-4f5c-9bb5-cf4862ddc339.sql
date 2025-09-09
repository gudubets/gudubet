-- Complete RBAC system part 2: Permissions and functions

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
('moderator', 'user_reports', NULL)

ON CONFLICT (role, permission) DO NOTHING;

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

-- Update existing admin to super_admin
UPDATE public.admins 
SET role_type = 'super_admin'::admin_role_new,
    is_active = true,
    department = 'Management'
WHERE email IN ('superadmin@casino.com', 'admin@example.com');