-- Fix security definer views by removing SECURITY DEFINER property
-- First, let's see what views exist
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public' AND definition ILIKE '%security definer%';

-- Fix function search paths for remaining functions without them
ALTER FUNCTION public.fn_validate_withdrawal_details() SET search_path TO 'public';
ALTER FUNCTION public.update_payment_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.get_withdrawal_stats(date) SET search_path TO 'public';
ALTER FUNCTION public.check_admin_permission(uuid, admin_permission) SET search_path TO 'public';
ALTER FUNCTION public.get_current_admin_role() SET search_path TO 'public';
ALTER FUNCTION public.validate_withdrawal_kyc() SET search_path TO 'public';
ALTER FUNCTION public.update_withdrawal_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_withdrawal_status_change() SET search_path TO 'public';
ALTER FUNCTION public.validate_withdrawal_kyc_enhanced() SET search_path TO 'public';
ALTER FUNCTION public.update_user_ltv(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_dashboard_kpis(integer) SET search_path TO 'public';
ALTER FUNCTION public.validate_withdrawal_status_transition() SET search_path TO 'public';
ALTER FUNCTION public.update_bonus_wallet_balance() SET search_path TO 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.current_user_id() SET search_path TO 'public';
ALTER FUNCTION public.fn_update_wallet_balance() SET search_path TO 'public';
ALTER FUNCTION public.create_user_notifications() SET search_path TO 'public';
ALTER FUNCTION public.calculate_daily_metrics(date) SET search_path TO 'public';
ALTER FUNCTION public.is_current_user_admin() SET search_path TO 'public';
ALTER FUNCTION public.user_exists(uuid) SET search_path TO 'public';
ALTER FUNCTION public.fn_guard_wallet_debit() SET search_path TO 'public';
ALTER FUNCTION public.fn_bonus_is_eligible(uuid, uuid, numeric, timestamp with time zone) SET search_path TO 'public';
ALTER FUNCTION public.fn_touch_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.fn_risk_compute_payment(uuid, numeric, inet) SET search_path TO 'public';
ALTER FUNCTION public.fn_risk_on_payment() SET search_path TO 'public';
ALTER FUNCTION public.is_super_admin(uuid) SET search_path TO 'public';
ALTER FUNCTION public.has_admin_permission(uuid, character varying) SET search_path TO 'public';
ALTER FUNCTION public.is_current_user_super_admin() SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_captcha_tokens() SET search_path TO 'public';