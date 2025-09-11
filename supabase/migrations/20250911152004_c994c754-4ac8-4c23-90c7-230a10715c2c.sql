-- Drop and recreate views without SECURITY DEFINER to fix security issues
DROP VIEW IF EXISTS public.admin_users CASCADE;
DROP VIEW IF EXISTS public.v_bonus_costs CASCADE;
DROP VIEW IF EXISTS public.v_bonus_kpis CASCADE;
DROP VIEW IF EXISTS public.v_payments_daily CASCADE;

-- Recreate views without SECURITY DEFINER (standard views)
CREATE VIEW public.admin_users AS
SELECT id, role, created_at, updated_at
FROM profiles p
WHERE role = 'admin';

CREATE VIEW public.v_bonus_costs AS
SELECT 
    b.name AS bonus_name,
    count(ubt.id) AS times_granted,
    sum(ubt.granted_amount) AS total_cost,
    avg(ubt.granted_amount) AS avg_cost_per_grant,
    count(*) FILTER (WHERE ubt.status = 'completed') AS completed_count
FROM bonuses_new b
LEFT JOIN user_bonus_tracking ubt ON b.id = ubt.bonus_id
GROUP BY b.id, b.name
ORDER BY sum(ubt.granted_amount) DESC;

CREATE VIEW public.v_bonus_kpis AS
SELECT 
    date(created_at) AS bonus_date,
    count(*) AS total_bonuses,
    count(*) FILTER (WHERE status = 'active') AS active_bonuses,
    count(*) FILTER (WHERE status = 'completed') AS completed_bonuses,
    sum(granted_amount) AS total_bonus_amount,
    sum(granted_amount) FILTER (WHERE status = 'completed') AS completed_bonus_amount
FROM user_bonus_tracking
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;

CREATE VIEW public.v_payments_daily AS
SELECT 
    date(created_at) AS payment_date,
    count(*) AS transaction_count,
    sum(amount) AS total_amount,
    count(*) FILTER (WHERE status = 'completed') AS successful_count,
    sum(amount) FILTER (WHERE status = 'completed') AS successful_amount,
    avg(amount) AS avg_amount
FROM payments
WHERE payment_method != 'withdrawal'
GROUP BY date(created_at)
ORDER BY date(created_at) DESC;