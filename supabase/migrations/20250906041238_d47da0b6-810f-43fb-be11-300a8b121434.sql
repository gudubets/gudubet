-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view themselves" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admins" ON public.admins;

-- Create security definer functions to avoid infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_admin_role()
RETURNS admin_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role_type FROM public.admins WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND role_type = 'super_admin'
  );
$$;

-- Create new policies using security definer functions
CREATE POLICY "Admins can view themselves"
ON public.admins
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Super admins can manage all admins"
ON public.admins
FOR ALL
USING (public.is_current_user_super_admin());

-- Update admin_permissions policies to use the new function
DROP POLICY IF EXISTS "Admins can view permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;

CREATE POLICY "Admins can view permissions"
ON public.admin_permissions
FOR SELECT
USING (public.get_current_admin_role() IN ('super_admin', 'admin'));

CREATE POLICY "Super admins can manage permissions"
ON public.admin_permissions
FOR ALL
USING (public.is_current_user_super_admin());