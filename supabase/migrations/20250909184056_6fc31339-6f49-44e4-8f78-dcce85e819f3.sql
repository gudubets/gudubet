-- Fix fraud rules table and create fraud detection system

-- First, let's add the missing columns to fraud_rules without violating constraints
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS rule_category TEXT DEFAULT 'general';
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS time_window_hours INTEGER DEFAULT 24;
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS threshold_count INTEGER DEFAULT 1;
ALTER TABLE public.fraud_rules ADD COLUMN IF NOT EXISTS auto_action TEXT DEFAULT 'flag';

-- Update existing fraud rules to have proper actions and categories
UPDATE public.fraud_rules SET action = 'flag' WHERE action IS NULL;
UPDATE public.fraud_rules SET rule_category = 'velocity' WHERE rule_type = 'velocity';
UPDATE public.fraud_rules SET rule_category = 'amount' WHERE rule_type = 'amount_threshold';
UPDATE public.fraud_rules SET rule_category = 'user_profile' WHERE rule_type = 'new_user';

-- Create IP Analysis table for tracking IP reputation and VPN detection
CREATE TABLE IF NOT EXISTS public.ip_analysis (
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
CREATE TABLE IF NOT EXISTS public.user_behavior_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
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
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  assigned_to UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Device fingerprinting table
CREATE TABLE IF NOT EXISTS public.device_fingerprints (
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
CREATE TABLE IF NOT EXISTS public.user_risk_profiles (
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
  automated_actions JSONB DEFAULT '{}',
  manual_overrides JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert new comprehensive fraud rules
INSERT INTO public.fraud_rules (name, rule_type, rule_category, conditions, action, risk_score_impact, auto_action, time_window_hours, threshold_count, is_active) VALUES
('VPN Usage Detection', 'ip_analysis', 'geo', '{"check_vpn": true, "block_vpn": false}', 'flag', 30, 'flag', 24, 1, true),
('High Risk Country', 'geo_location', 'geo', '{"high_risk_countries": ["AF", "KP", "IR"], "block_countries": []}', 'review', 50, 'review', 24, 1, true),
('Device Change Frequency', 'device_analysis', 'behavioral', '{"max_devices_per_day": 3, "max_devices_per_week": 5}', 'flag', 25, 'flag', 24, 3, true),
('Rapid Fire Deposits', 'velocity', 'velocity', '{"transaction_type": "deposit", "max_count": 5, "time_window": 1}', 'review', 40, 'review', 1, 5, true),
('Large Withdrawal After Deposit', 'pattern', 'behavioral', '{"deposit_to_withdrawal_ratio": 0.9, "time_window": 2}', 'review', 35, 'review', 2, 1, true),
('Night Time Activity', 'time_pattern', 'behavioral', '{"night_hours": {"start": 2, "end": 6}, "max_transactions": 3}', 'flag', 20, 'flag', 24, 3, true),
('Proxy/Tor Usage', 'ip_analysis', 'geo', '{"check_proxy": true, "check_tor": true}', 'block', 60, 'block', 24, 1, true),
('Datacenter IP Usage', 'ip_analysis', 'geo', '{"check_datacenter": true}', 'review', 45, 'review', 24, 1, true)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.ip_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_risk_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage IP analysis" ON public.ip_analysis FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can view their own behavior logs" ON public.user_behavior_logs FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "System can insert behavior logs" ON public.user_behavior_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all behavior logs" ON public.user_behavior_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can manage fraud alerts" ON public.fraud_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can view their own device fingerprints" ON public.device_fingerprints FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "System can manage device fingerprints" ON public.device_fingerprints FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all device fingerprints" ON public.device_fingerprints FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Users can view their own risk profile" ON public.user_risk_profiles FOR SELECT USING (
  auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id)
);

CREATE POLICY "Admins can manage risk profiles" ON public.user_risk_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ip_analysis_ip ON public.ip_analysis(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_analysis_risk_score ON public.ip_analysis(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_user_id ON public.user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_created_at ON public.user_behavior_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_logs_action_type ON public.user_behavior_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON public.fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_user_id ON public.device_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_hash ON public.device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_user_id ON public.user_risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_risk_profiles_risk_level ON public.user_risk_profiles(risk_level);

-- Create triggers for updated_at columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ip_analysis_updated_at') THEN
    CREATE TRIGGER update_ip_analysis_updated_at
      BEFORE UPDATE ON public.ip_analysis
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fraud_alerts_updated_at') THEN
    CREATE TRIGGER update_fraud_alerts_updated_at
      BEFORE UPDATE ON public.fraud_alerts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_device_fingerprints_updated_at') THEN
    CREATE TRIGGER update_device_fingerprints_updated_at
      BEFORE UPDATE ON public.device_fingerprints
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_risk_profiles_updated_at') THEN
    CREATE TRIGGER update_user_risk_profiles_updated_at
      BEFORE UPDATE ON public.user_risk_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;