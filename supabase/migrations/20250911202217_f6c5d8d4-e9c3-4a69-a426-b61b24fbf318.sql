-- Fix the admin_list_users function to work with the correct admin table
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_q text DEFAULT NULL::text, 
  p_limit integer DEFAULT 100, 
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  email text, 
  role text, 
  banned_until timestamp with time zone, 
  last_login_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check admin permissions using the admins table
  IF NOT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  ) THEN
    RAISE EXCEPTION 'Forbidden: Admin access required';
  END IF;

  RETURN QUERY
    SELECT 
      u.id, 
      u.email::text, 
      COALESCE(a.role_type::text, 'user')::text as role, 
      p.banned_until, 
      u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN public.admins a ON a.id = u.id
    WHERE p_q IS NULL OR u.email ILIKE ('%' || p_q || '%')
    ORDER BY u.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END $function$