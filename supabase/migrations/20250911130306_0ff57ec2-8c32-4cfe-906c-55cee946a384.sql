-- Check if RLS is enabled on admins table and create proper policies
-- First, let's see what policies exist
-- \d+ admins;

-- Create RLS policy to allow admins to read their own records
DROP POLICY IF EXISTS "Admins can read their own data" ON public.admins;
CREATE POLICY "Admins can read their own data" 
ON public.admins 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Create RLS policy to allow super admins to read all admin data
DROP POLICY IF EXISTS "Super admins can read all admin data" ON public.admins;
CREATE POLICY "Super admins can read all admin data" 
ON public.admins 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() 
    AND role_type = 'super_admin' 
    AND is_active = true
  )
);

-- Make sure authenticated users can access their admin records
GRANT SELECT ON public.admins TO authenticated;

-- Also create a security definer function for checking admin access without RLS issues
CREATE OR REPLACE FUNCTION public.check_user_admin_status(check_user_id uuid)
RETURNS TABLE(is_admin boolean, is_super_admin boolean, role_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN a.id IS NOT NULL AND a.is_active THEN true ELSE false END as is_admin,
    CASE WHEN a.role_type = 'super_admin' AND a.is_active THEN true ELSE false END as is_super_admin,
    a.role_type::text
  FROM public.admins a
  WHERE a.id = check_user_id;
  
  -- If no record found, return false values
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, null::text;
  END IF;
END;
$$;