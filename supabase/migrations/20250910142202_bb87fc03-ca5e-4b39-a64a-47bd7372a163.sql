-- =========================
-- FINAL SECURITY FIXES (corrected)
-- =========================

-- Remove the security definer view and replace with regular view (fixed columns)
DROP VIEW IF EXISTS public.admin_users;

-- Create a regular view without security definer - only existing columns
CREATE VIEW public.admin_users AS
SELECT p.id, p.role, p.created_at, p.updated_at 
FROM public.profiles p 
WHERE p.role = 'admin';

-- Grant appropriate permissions
GRANT SELECT ON public.admin_users TO authenticated;

-- =========================
-- FIX REMAINING FUNCTION SEARCH PATHS
-- =========================

CREATE OR REPLACE FUNCTION public.get_withdrawal_stats(date_filter date)
RETURNS TABLE(total_pending integer, total_pending_amount numeric, total_approved_today integer, total_approved_amount_today numeric, high_risk_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE status = 'pending') as total_pending,
    (SELECT COALESCE(SUM(amount), 0) FROM public.withdrawals WHERE status = 'pending') as total_pending_amount,
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE status = 'approved' AND DATE(created_at) = date_filter) as total_approved_today,
    (SELECT COALESCE(SUM(amount), 0) FROM public.withdrawals WHERE status = 'approved' AND DATE(created_at) = date_filter) as total_approved_amount_today,
    (SELECT COUNT(*)::INTEGER FROM public.withdrawals WHERE amount >= 1000) as high_risk_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_daily_metrics(target_date date DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _dau INTEGER := 0;
  _new_registrations INTEGER := 0;
  _total_deposits NUMERIC := 0;
  _total_withdrawals NUMERIC := 0;
  _total_bets NUMERIC := 0;
  _total_wins NUMERIC := 0;
  _game_sessions INTEGER := 0;
  _avg_session_duration NUMERIC := 0;
  _ggr NUMERIC := 0;
  _ngr NUMERIC := 0;
BEGIN
  -- New registrations from profiles
  SELECT COUNT(*) INTO _new_registrations
  FROM public.profiles
  WHERE DATE(created_at) = target_date;

  -- Financial metrics
  SELECT COALESCE(SUM(amount), 0) INTO _total_deposits
  FROM public.payments
  WHERE DATE(created_at) = target_date 
    AND status = 'confirmed';

  -- Basic calculations
  _ggr := _total_bets - _total_wins;
  _ngr := _ggr - (_total_withdrawals * 0.1);

  -- Insert or update daily metrics
  INSERT INTO public.daily_metrics (
    metric_date, dau, new_registrations, total_deposits, total_withdrawals,
    ggr, ngr, total_bets, total_wins, game_sessions, avg_session_duration
  ) VALUES (
    target_date, _dau, _new_registrations, _total_deposits, _total_withdrawals,
    _ggr, _ngr, _total_bets, _total_wins, _game_sessions, _avg_session_duration
  ) ON CONFLICT (metric_date) DO UPDATE SET
    dau = EXCLUDED.dau,
    new_registrations = EXCLUDED.new_registrations,
    total_deposits = EXCLUDED.total_deposits,
    total_withdrawals = EXCLUDED.total_withdrawals,
    ggr = EXCLUDED.ggr,
    ngr = EXCLUDED.ngr,
    total_bets = EXCLUDED.total_bets,
    total_wins = EXCLUDED.total_wins,
    game_sessions = EXCLUDED.game_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration;
END;
$$;

-- =========================
-- SECURITY VERIFICATION
-- =========================

-- Ensure all critical bonus system tables have RLS enabled
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename LIKE '%bonus%'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    END LOOP;
END
$$;