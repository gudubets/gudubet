-- =========================
-- FINAL SIMPLIFIED SECURITY FIXES
-- =========================

-- Remove any potentially problematic views
DROP VIEW IF EXISTS public.admin_users CASCADE;

-- Recreate simple admin view
CREATE VIEW public.admin_users AS
SELECT p.id, p.role, p.created_at, p.updated_at 
FROM public.profiles p 
WHERE p.role = 'admin';

GRANT SELECT ON public.admin_users TO authenticated;

-- =========================
-- SIMPLIFY PROBLEMATIC FUNCTIONS
-- =========================

-- Replace problematic admin functions with simplified versions
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Simple helper for checking if user exists
CREATE OR REPLACE FUNCTION public.user_exists(user_uuid uuid)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_uuid
  );
$$;

-- =========================
-- CLEAN UP AND FINALIZE
-- =========================

-- Ensure all bonus tables have proper RLS
ALTER TABLE public.bonus_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonus_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_audit_logs ENABLE ROW LEVEL SECURITY;

-- Add final status comment
COMMENT ON SCHEMA public IS 'Bonus management system - fully configured with security policies';

-- Success message
SELECT 'Bonus system SQL setup completed successfully!' as final_status;