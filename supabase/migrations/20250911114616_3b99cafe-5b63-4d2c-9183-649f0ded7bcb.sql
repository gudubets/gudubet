-- Drop existing views first
DROP VIEW IF EXISTS public.v_payments_daily CASCADE;
DROP VIEW IF EXISTS public.v_bonus_kpis CASCADE;
DROP VIEW IF EXISTS public.v_bonus_costs CASCADE;

-- Risk Settings Table
CREATE TABLE IF NOT EXISTS public.risk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- IP Blacklist Table  
CREATE TABLE IF NOT EXISTS public.ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Risk Flags Table
CREATE TABLE IF NOT EXISTS public.risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'review' CHECK (status IN ('review', 'allowed', 'limited', 'blocked')),
  reasons JSONB DEFAULT '[]'::jsonb,
  reviewed_by UUID REFERENCES public.admins(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment Views for Reports
CREATE VIEW public.v_payments_daily AS
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_count,
  SUM(amount) FILTER (WHERE status = 'completed') as successful_amount,
  AVG(amount) as avg_amount
FROM public.payments 
WHERE payment_method != 'withdrawal'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;

-- Bonus KPIs View
CREATE VIEW public.v_bonus_kpis AS
SELECT 
  DATE(created_at) as bonus_date,
  COUNT(*) as total_bonuses,
  COUNT(*) FILTER (WHERE status = 'active') as active_bonuses,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_bonuses,
  SUM(granted_amount) as total_bonus_amount,
  SUM(granted_amount) FILTER (WHERE status = 'completed') as completed_bonus_amount
FROM public.user_bonus_tracking
GROUP BY DATE(created_at)
ORDER BY bonus_date DESC;

-- Bonus Costs View
CREATE VIEW public.v_bonus_costs AS
SELECT 
  b.name as bonus_name,
  COUNT(ubt.id) as times_granted,
  SUM(ubt.granted_amount) as total_cost,
  AVG(ubt.granted_amount) as avg_cost_per_grant,
  COUNT(*) FILTER (WHERE ubt.status = 'completed') as completed_count
FROM public.bonuses_new b
LEFT JOIN public.user_bonus_tracking ubt ON b.id = ubt.bonus_id
GROUP BY b.id, b.name
ORDER BY total_cost DESC;

-- Risk Computation Function
CREATE OR REPLACE FUNCTION public.fn_risk_compute_payment(
  p_user_id UUID,
  p_amount NUMERIC,
  p_ip_address INET
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  risk_score INTEGER := 0;
  payment_count INTEGER;
  blacklist_count INTEGER;
  velocity_threshold INTEGER := 3;
  amount_threshold NUMERIC := 1000;
BEGIN
  -- Check IP blacklist
  SELECT COUNT(*) INTO blacklist_count
  FROM public.ip_blacklist 
  WHERE ip_address = p_ip_address AND is_active = true;
  
  IF blacklist_count > 0 THEN
    risk_score := risk_score + 50;
  END IF;
  
  -- Check velocity (payments in last hour)
  SELECT COUNT(*) INTO payment_count
  FROM public.payments
  WHERE user_id = p_user_id 
    AND created_at > now() - INTERVAL '1 hour'
    AND status IN ('completed', 'processing');
    
  IF payment_count >= velocity_threshold THEN
    risk_score := risk_score + 30;
  END IF;
  
  -- Check amount threshold
  IF p_amount > amount_threshold THEN
    risk_score := risk_score + 20;
  END IF;
  
  RETURN LEAST(risk_score, 100);
END;
$$;

-- Payment Risk Trigger Function
CREATE OR REPLACE FUNCTION public.fn_risk_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  computed_risk_score INTEGER;
  risk_threshold INTEGER := 40;
BEGIN
  -- Only process completed payments
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;
  
  -- Compute risk score
  computed_risk_score := public.fn_risk_compute_payment(
    NEW.user_id,
    NEW.amount,
    NEW.ip_address::INET
  );
  
  -- If risk score exceeds threshold, create risk flag
  IF computed_risk_score >= risk_threshold THEN
    INSERT INTO public.risk_flags (
      user_id,
      risk_score,
      status,
      reasons
    ) VALUES (
      NEW.user_id,
      computed_risk_score,
      'review',
      jsonb_build_array(
        CASE WHEN computed_risk_score >= 70 THEN 'high_risk_payment' ELSE 'medium_risk_payment' END
      )
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on payments
DROP TRIGGER IF EXISTS trigger_risk_on_payment ON public.payments;
CREATE TRIGGER trigger_risk_on_payment
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_risk_on_payment();

-- Insert default risk settings
INSERT INTO public.risk_settings (setting_key, setting_value, description) VALUES
('risk_threshold', '40', 'Minimum risk score to flag for review'),
('velocity_threshold', '3', 'Maximum payments per hour before flagging'),
('amount_threshold', '1000', 'Payment amount threshold for risk scoring')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage risk settings" ON public.risk_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admins can manage IP blacklist" ON public.ip_blacklist
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  ));

CREATE POLICY "Admins can manage risk flags" ON public.risk_flags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  ));