-- Fix infinite recursion in admin RLS policies
-- Drop the problematic policy that references itself
DROP POLICY IF EXISTS "Super admins can read all admin data" ON public.admins;

-- Create a simpler policy structure that doesn't cause recursion
-- Only allow users to see their own admin record
DROP POLICY IF EXISTS "Admins can read their own data" ON public.admins;
CREATE POLICY "Admins can read their own data" 
ON public.admins 
FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Allow service role (for our functions) to access everything
CREATE POLICY "Service role can access all admin data" 
ON public.admins 
FOR ALL 
TO service_role 
USING (true);

-- Update the security definer function to work without RLS issues
CREATE OR REPLACE FUNCTION public.check_user_admin_status(check_user_id uuid)
RETURNS TABLE(is_admin boolean, is_super_admin boolean, role_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS for this function
  SET LOCAL row_security = off;
  
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