-- Remove all policies that might depend on role_type
DROP POLICY IF EXISTS "Admins can view activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can view themselves" ON public.admins;
DROP POLICY IF EXISTS "Admins can view permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;

-- Create new admin role enum
DROP TYPE IF EXISTS admin_role_new CASCADE;
CREATE TYPE admin_role_new AS ENUM ('super_admin', 'finance', 'crm', 'support', 'moderator');

-- Create admin permission enum  
DROP TYPE IF EXISTS admin_permission CASCADE;
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