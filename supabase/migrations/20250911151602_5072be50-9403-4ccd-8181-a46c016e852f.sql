-- Create a secure admin validation function with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS TABLE(is_admin boolean, is_super_admin boolean, role_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN a.id IS NOT NULL AND a.is_active THEN true ELSE false END as is_admin,
    CASE WHEN a.role_type = 'super_admin' AND a.is_active THEN true ELSE false END as is_super_admin,
    a.role_type::text
  FROM public.admins a
  WHERE a.id = auth.uid() AND a.is_active = true;
  
  -- If no record found, return false values
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, null::text;
  END IF;
END;
$$;

-- Create RLS policy using the secure function
DROP POLICY IF EXISTS "Admin dashboard access" ON public.admin_activities;
CREATE POLICY "Admin dashboard access" ON public.admin_activities
FOR ALL USING (
  (SELECT is_admin FROM public.get_current_user_admin_status())
);

-- Secure the admin functions table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read their own data" ON public.admins;
CREATE POLICY "Admins can read their own data" ON public.admins
FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Super admins can manage all admins" ON public.admins;
CREATE POLICY "Super admins can manage all admins" ON public.admins
FOR ALL USING (
  (SELECT is_super_admin FROM public.get_current_user_admin_status())
);

-- Add proper search path to existing functions
ALTER FUNCTION public.check_user_admin_status(uuid) SET search_path TO 'public';
ALTER FUNCTION public.calculate_payment_risk_score(uuid, numeric, character varying, inet, text) SET search_path TO 'public';
ALTER FUNCTION public.get_required_kyc_documents(kyc_level) SET search_path TO 'public';
ALTER FUNCTION public.get_required_kyc_documents(text) SET search_path TO 'public';
ALTER FUNCTION public.check_kyc_withdrawal_limit(uuid, numeric) SET search_path TO 'public';
ALTER FUNCTION public.get_admin_permissions(uuid) SET search_path TO 'public';