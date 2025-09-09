-- Fix the role_type column issue by temporarily dropping policies

-- Drop policies that depend on role_type column
DROP POLICY IF EXISTS "Admins can view activities" ON public.admin_activities;
DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can view themselves" ON public.admins;

-- Create admin roles enum (updated)
DO $$ BEGIN
  CREATE TYPE admin_role_new AS ENUM ('super_admin', 'finance', 'crm', 'support', 'moderator');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create admin permissions enum
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update admins table structure
ALTER TABLE public.admins 
DROP COLUMN IF EXISTS role,
ADD COLUMN IF NOT EXISTS department VARCHAR(50),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Add foreign key constraint for created_by after adding the column
DO $$ BEGIN
  ALTER TABLE public.admins 
  ADD CONSTRAINT fk_admins_created_by 
  FOREIGN KEY (created_by) REFERENCES public.admins(id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update role_type column safely
ALTER TABLE public.admins ALTER COLUMN role_type DROP DEFAULT;
UPDATE public.admins SET role_type = 'super_admin' WHERE role_type::text IN ('admin', 'super_admin');
ALTER TABLE public.admins ALTER COLUMN role_type TYPE admin_role_new USING 
  CASE 
    WHEN role_type::text = 'super_admin' THEN 'super_admin'::admin_role_new
    WHEN role_type::text = 'admin' THEN 'super_admin'::admin_role_new
    ELSE 'moderator'::admin_role_new
  END;
ALTER TABLE public.admins ALTER COLUMN role_type SET DEFAULT 'moderator'::admin_role_new;