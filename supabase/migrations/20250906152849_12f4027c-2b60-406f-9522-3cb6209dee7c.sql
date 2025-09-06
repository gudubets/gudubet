-- Fix function search path security issue
-- Update existing functions to include SET search_path = public

CREATE OR REPLACE FUNCTION public.is_super_admin(_admin_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = _admin_id AND role_type = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_admin_permission(_admin_id uuid, _permission character varying)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT is_granted 
     FROM public.admin_permissions 
     WHERE admin_id = _admin_id AND permission_name = _permission),
    false
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_current_admin_role()
 RETURNS admin_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role_type FROM public.admins WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND role_type = 'super_admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_captcha_tokens()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  DELETE FROM public.captcha_tokens 
  WHERE expires_at < now();
$function$;