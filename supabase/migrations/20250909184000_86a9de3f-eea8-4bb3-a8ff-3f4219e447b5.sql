-- Create fraud detection tables and enhance risk management system

-- IP Analysis table for tracking IP reputation and VPN detection
CREATE TABLE public.ip_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL UNIQUE,
  country_code TEXT,
  city TEXT,
  region TEXT,
  timezone TEXT,
  is_vpn BOOLEAN DEFAULT false,
  is_proxy BOOLEAN DEFAULT false,
  is_tor BOOLEAN DEFAULT false,
  is_datacenter BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  threat_level TEXT DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  provider_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User behavior tracking for anomaly detection
CREATE TABLE public.user_behavior_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'login', 'deposit', 'withdrawal', 'bet', 'game_session'
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  session_id TEXT,
  amount DECIMAL(15,2),
  currency TEXT DEFAULT 'TRY',
  metadata JSONB DEFAULT '{}',
  risk_flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fraud alerts table for tracking suspicious activities
CREATE TABLE public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL, -- 'velocity', 'geo_anomaly', 'device_change', 'vpn_usage', 'pattern_anomaly'
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID, -- admin_id
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Device fingerprinting table
CREATE TABLE public.device_fingerprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  browser_info JSONB DEFAULT '{}',
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  usage_count INTEGER DEFAULT 1,
  is_trusted BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Risk scoring profiles for users
CREATE TABLE public.user_risk_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  overall_risk_score INTEGER DEFAULT 0 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  kyc_risk_score INTEGER DEFAULT 0,
  behavioral_risk_score INTEGER DEFAULT 0,
  payment_risk_score INTEGER DEFAULT 0,
  geo_risk_score INTEGER DEFAULT 0,
  device_risk_score INTEGER DEFAULT 0,
  velocity_risk_score INTEGER DEFAULT 0,
  last_assessment_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assessment_history JSONB DEFAULT '[]',
  automated_actions JSONB DEFAULT '{}', -- restrictions, limits, flags
  manual_overrides JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced fraud rules with more sophisticated conditions
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS rule_category TEXT DEFAULT 'general';
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS time_window_hours INTEGER DEFAULT 24;
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS threshold_count INTEGER DEFAULT 1;
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS auto_action TEXT; -- 'flag', 'block', 'review', 'limit'

-- Update existing fraud rules
UPDATE public.fraud_rules SET rule_category = 'velocity' WHERE rule_type = 'velocity';
UPDATE public.fraud_rules SET rule_category = 'amount' WHERE rule_type = 'amount_threshold';
UPDATE public.fraud_rules SET rule_category = 'user_profile' WHERE rule_type = 'new_user';

-- Insert new fraud rules for comprehensive detection
INSERT INTO public.fraud_rules (name, rule_type, rule_category, conditions, risk_score_impact, auto_action, time_window_hours, threshold_count, is_active) VALUES
('VPN Usage Detection', 'ip_analysis', 'geo', '{"check_vpn": true, "block_vpn": false}', 30, 'flag', 24, 1, true),
('High Risk Country', 'geo_location', 'geo', '{"high_risk_countries": ["AF", "KP", "IR"], "block_countries": []}', 50, 'review', 24, 1, true),
('Device Change Frequency', 'device_analysis', 'behavioral', '{"max_devices_per_day": 3, "max_devices_per_week": 5}', 25, 'flag', 24, 3, true),
('Rapid Fire Deposits', 'velocity', 'velocity', '{"transaction_type": "deposit", "max_count": 5, "time_window": 1}', 40, 'review', 1, 5, true),
('Large Withdrawal After Deposit', 'pattern', 'behavioral', '{"deposit_to_withdrawal_ratio": 0.9, "time_window": 2}', 35, 'review', 2, 1, true),
('Night Time Activity', 'time_pattern', 'behavioral', '{"night_hours": {"start": 2, "end": 6}, "max_transactions": 3}', 20, 'flag', 24, 3, true),
('Proxy/Tor Usage', 'ip_analysis', 'geo', '{"check_proxy": true, "check_tor": true}', 60, 'block', 24, 1, true),
('Datacenter IP Usage', 'ip_analysis', 'geo', '{"check_datacenter": true}', 45, 'review', 24, 1, true);

-- Enable RLS on new tables
ALTER TABLE public.ip_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for IP Analysis
CREATE POLICY "Admins can manage IP analysis" ON public.ip_analysis
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- RLS Policies for User Behavior Logs
CREATE POLICY "Users can view their own behavior logs" ON public.user_behavior_logs
FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "System can insert behavior logs" ON public.user_behavior_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all behavior logs" ON public.user_behavior_logs
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- RLS Policies for Fraud Alerts
CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- RLS Policies for Device Fingerprints
CREATE POLICY "Users can view their own device fingerprints" ON public.device_fingerprints
FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "System can manage device fingerprints" ON public.device_fingerprints
FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all device fingerprints" ON public.device_fingerprints
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- RLS Policies for User Risk Profiles
CREATE POLICY "Users can view their own risk profile" ON public.user_risk_profiles
FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "Admins can manage risk profiles" ON public.user_risk_profiles
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- Create indexes for performance
CREATE INDEX idx_ip_analysis_ip ON public.ip_analysis(ip_address);
CREATE INDEX idx_ip_analysis_risk_score ON public.ip_analysis(risk_score DESC);
CREATE INDEX idx_user_behavior_logs_user_id ON public.user_behavior_logs(user_id);
CREATE INDEX idx_user_behavior_logs_created_at ON public.user_behavior_logs(created_at DESC);
CREATE INDEX idx_user_behavior_logs_action_type ON public.user_behavior_logs(action_type);
CREATE INDEX idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_severity ON public.fraud_alerts(severity);
CREATE INDEX idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);
CREATE INDEX idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX idx_user_risk_profiles_user_id ON public.user_risk_profiles(user_id);
CREATE INDEX idx_user_risk_profiles_risk_level ON public.user_risk_profiles(risk_level);

-- Create triggers for updated_at columns
CREATE TRIGGER update_ip_analysis_updated_at
  BEFORE UPDATE ON public.ip_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fraud_alerts_updated_at
  BEFORE UPDATE ON public.fraud_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_fingerprints_updated_at
  BEFORE UPDATE ON public.device_fingerprints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_risk_profiles_updated_at
  BEFORE UPDATE ON public.user_risk_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhanced risk calculation function
CREATE OR REPLACE FUNCTION public.calculate_comprehensive_risk_score(
  _user_id UUID,
  _amount DECIMAL DEFAULT NULL,
  _currency TEXT DEFAULT 'TRY',
  _ip_address INET DEFAULT NULL,
  _device_fingerprint TEXT DEFAULT NULL,
  _action_type TEXT DEFAULT 'general'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _base_risk_score INTEGER := 0;
  _ip_risk INTEGER := 0;
  _behavioral_risk INTEGER := 0;
  _velocity_risk INTEGER := 0;
  _device_risk INTEGER := 0;
  _geo_risk INTEGER := 0;
  _final_risk_score INTEGER := 0;
  _rule RECORD;
  _user_stats RECORD;
  _ip_info RECORD;
  _device_info RECORD;
BEGIN
  -- Get user statistics for behavioral analysis
  SELECT 
    COUNT(*) as total_transactions,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as transactions_24h,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as transactions_1h,
    COUNT(DISTINCT ip_address) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as unique_ips_7d,
    COUNT(DISTINCT device_fingerprint) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as unique_devices_7d
  INTO _user_stats
  FROM public.user_behavior_logs 
  WHERE user_id = _user_id;

  -- Analyze IP if provided
  IF _ip_address IS NOT NULL THEN
    SELECT * INTO _ip_info FROM public.ip_analysis WHERE ip_address = _ip_address;
    
    IF _ip_info.id IS NOT NULL THEN
      _ip_risk := _ip_info.risk_score;
      
      -- Additional IP-based risk factors
      IF _ip_info.is_vpn THEN _ip_risk := _ip_risk + 30; END IF;
      IF _ip_info.is_proxy THEN _ip_risk := _ip_risk + 40; END IF;
      IF _ip_info.is_tor THEN _ip_risk := _ip_risk + 60; END IF;
      IF _ip_info.is_datacenter THEN _ip_risk := _ip_risk + 45; END IF;
    END IF;
  END IF;

  -- Analyze device fingerprint if provided
  IF _device_fingerprint IS NOT NULL THEN
    SELECT * INTO _device_info FROM public.device_fingerprints 
    WHERE fingerprint_hash = _device_fingerprint AND user_id = _user_id;
    
    IF _device_info.id IS NOT NULL THEN
      _device_risk := _device_info.risk_score;
      
      -- New device risk
      IF _device_info.usage_count = 1 THEN
        _device_risk := _device_risk + 25;
      END IF;
    ELSE
      -- Completely new device
      _device_risk := 40;
    END IF;
  END IF;

  -- Velocity-based risk assessment
  IF _user_stats.transactions_1h > 5 THEN _velocity_risk := _velocity_risk + 30; END IF;
  IF _user_stats.transactions_24h > 20 THEN _velocity_risk := _velocity_risk + 20; END IF;
  IF _user_stats.unique_ips_7d > 5 THEN _velocity_risk := _velocity_risk + 25; END IF;
  IF _user_stats.unique_devices_7d > 3 THEN _velocity_risk := _velocity_risk + 20; END IF;

  -- Apply fraud rules
  FOR _rule IN SELECT * FROM public.fraud_rules WHERE is_active = true ORDER BY priority ASC LOOP
    
    -- Amount threshold rules
    IF _rule.rule_type = 'amount_threshold' AND _amount IS NOT NULL THEN
      IF _amount >= (_rule.conditions->>'threshold')::DECIMAL THEN
        _base_risk_score := _base_risk_score + _rule.risk_score_impact;
      END IF;
    END IF;
    
    -- Velocity rules
    IF _rule.rule_type = 'velocity' THEN
      IF (_rule.conditions->>'transaction_type') = _action_type THEN
        IF _user_stats.transactions_24h >= (_rule.conditions->>'max_count')::INTEGER THEN
          _velocity_risk := _velocity_risk + _rule.risk_score_impact;
        END IF;
      END IF;
    END IF;
    
    -- New user rules
    IF _rule.rule_type = 'new_user' AND _user_stats.total_transactions = 0 THEN
      _base_risk_score := _base_risk_score + _rule.risk_score_impact;
    END IF;
    
  END LOOP;

  -- Calculate final risk score with weighted components
  _final_risk_score := (
    _base_risk_score * 0.2 +
    _ip_risk * 0.25 +
    _behavioral_risk * 0.15 +
    _velocity_risk * 0.25 +
    _device_risk * 0.15
  )::INTEGER;

  -- Ensure risk score is within bounds
  _final_risk_score := GREATEST(0, LEAST(100, _final_risk_score));
  
  RETURN _final_risk_score;
END;
$$;

-- Function to create fraud alert
CREATE OR REPLACE FUNCTION public.create_fraud_alert(
  _user_id UUID,
  _alert_type TEXT,
  _severity TEXT,
  _description TEXT,
  _evidence JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _alert_id UUID;
BEGIN
  INSERT INTO public.fraud_alerts (
    user_id, alert_type, severity, description, evidence
  ) VALUES (
    _user_id, _alert_type, _severity, _description, _evidence
  ) RETURNING id INTO _alert_id;
  
  RETURN _alert_id;
END;
$$;