-- =========================
-- FINAL SECURITY FIXES
-- =========================

-- Get all tables that have RLS enabled but no policies and add basic policies
DO $$
DECLARE
    table_rec RECORD;
BEGIN
    -- Find tables with RLS but no policies
    FOR table_rec IN 
        SELECT t.tablename 
        FROM pg_tables t
        WHERE t.schemaname = 'public' 
        AND EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE c.relname = t.tablename 
            AND n.nspname = 'public' 
            AND c.relrowsecurity = true
        )
        AND NOT EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.schemaname = 'public' 
            AND p.tablename = t.tablename
        )
    LOOP
        -- Add basic read policy for tables without any policies
        BEGIN
            EXECUTE format(
                'CREATE POLICY "System access" ON public.%I FOR ALL USING (auth.role() = ''service_role'')',
                table_rec.tablename
            );
        EXCEPTION 
            WHEN others THEN 
                -- If policy creation fails, continue
                NULL;
        END;
    END LOOP;
END
$$;

-- =========================
-- FIX REMAINING FUNCTION SEARCH PATHS
-- =========================

-- Update all functions to have proper search_path
CREATE OR REPLACE FUNCTION public.create_user_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If notification is for a specific user
  IF NEW.target_user_id IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, notification_id)
    VALUES (NEW.target_user_id, NEW.id);
  ELSE
    -- If notification is for all users, create records for all existing users
    INSERT INTO public.user_notifications (user_id, notification_id)
    SELECT au.id, NEW.id 
    FROM auth.users au
    WHERE au.email_confirmed_at IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_payment_risk_score(_user_id uuid, _amount numeric, _currency character varying, _ip_address inet DEFAULT NULL::inet, _device_fingerprint text DEFAULT NULL::text)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _risk_score INTEGER := 0;
  _rule RECORD;
  _user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    COUNT(*) as total_payments,
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as payments_24h,
    COALESCE(SUM(amount) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), 0) as amount_24h
  INTO _user_stats
  FROM public.payments 
  WHERE user_id = _user_id AND status IN ('confirmed');

  -- Apply fraud rules (simplified)
  FOR _rule IN SELECT * FROM public.fraud_rules WHERE is_active = true ORDER BY priority ASC LOOP
    
    -- Amount threshold check
    IF _rule.rule_type = 'amount_threshold' THEN
      IF _amount >= (_rule.conditions->>'threshold')::NUMERIC THEN
        _risk_score := _risk_score + _rule.risk_score_impact;
      END IF;
    END IF;
    
    -- Velocity check
    IF _rule.rule_type = 'velocity' THEN
      IF (_rule.conditions->>'transaction_type') = 'deposit' THEN
        IF _user_stats.amount_24h + _amount > (_rule.conditions->>'max_amount')::NUMERIC THEN
          _risk_score := _risk_score + _rule.risk_score_impact;
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- Ensure risk score is within bounds
  _risk_score := GREATEST(0, LEAST(100, _risk_score));
  
  RETURN _risk_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- ADD POLICIES FOR SYSTEM TABLES
-- =========================

-- Add policies for admin-related tables
CREATE POLICY "Admins can view admin activities" ON public.admin_activities
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can create admin activities" ON public.admin_activities
FOR INSERT WITH CHECK (true);

-- Add policies for analytics tables
CREATE POLICY "System can manage analytics" ON public.analytics_events
FOR ALL USING (auth.role() = 'service_role');

-- Add policies for daily metrics
CREATE POLICY "Admins can view metrics" ON public.daily_metrics
FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can manage metrics" ON public.daily_metrics
FOR ALL USING (auth.role() = 'service_role');

-- =========================
-- ENSURE CRITICAL TABLES HAVE PROPER POLICIES
-- =========================

-- Ensure all bonus-related tables have comprehensive policies
CREATE POLICY "Users can view active bonuses" ON public.bonuses_new
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all bonuses" ON public.bonuses_new
FOR ALL USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================
-- CREATE HELPER VIEW FOR ADMIN ACCESS
-- =========================
CREATE OR REPLACE VIEW public.admin_users AS
SELECT p.* FROM public.profiles p 
WHERE p.role = 'admin';

-- Grant appropriate permissions
GRANT SELECT ON public.admin_users TO authenticated;