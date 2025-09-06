-- Create role enum for different admin levels
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'finance_admin', 'support_admin');

-- Add role column to admins table
ALTER TABLE public.admins 
ADD COLUMN role_type admin_role DEFAULT 'admin';

-- Create admin permissions table
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id) ON DELETE CASCADE NOT NULL,
  permission_name VARCHAR NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES public.admins(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_permissions
CREATE POLICY "Admins can view permissions" 
ON public.admin_permissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND role_type IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Super admins can manage permissions" 
ON public.admin_permissions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND role_type = 'super_admin'
  )
);

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(_admin_id UUID, _permission VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_granted 
     FROM public.admin_permissions 
     WHERE admin_id = _admin_id AND permission_name = _permission),
    false
  );
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = _admin_id AND role_type = 'super_admin'
  );
$$;

-- Update admins RLS policy to allow role management
CREATE POLICY "Super admins can manage all admins" 
ON public.admins 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins admin_check
    WHERE admin_check.id = auth.uid() AND admin_check.role_type = 'super_admin'
  )
);

-- Create trigger for updating admin_permissions timestamps
CREATE TRIGGER update_admin_permissions_updated_at
BEFORE UPDATE ON public.admin_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();