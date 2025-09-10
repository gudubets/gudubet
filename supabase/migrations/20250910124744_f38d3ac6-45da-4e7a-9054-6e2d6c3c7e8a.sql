-- Create fraud detection rules for MVP
INSERT INTO public.fraud_rules (name, rule_type, rule_category, conditions, risk_score_impact, action, auto_action, is_active, priority) VALUES
-- VPN/Proxy Detection Rule
('VPN/Proxy Detection', 'ip_analysis', 'security', 
 '{"check_vpn": true, "check_proxy": true, "check_tor": true, "check_datacenter": true}',
 80, 'manual_review', 'flag', true, 1),

-- Velocity Rules
('Rapid Login Attempts', 'velocity', 'behavioral', 
 '{"transaction_type": "login", "max_count": 10, "time_window_minutes": 15}',
 60, 'manual_review', 'flag', true, 2),

('Rapid Deposit Attempts', 'velocity', 'financial', 
 '{"transaction_type": "deposit", "max_count": 5, "time_window_minutes": 60, "max_amount": 10000}',
 70, 'manual_review', 'flag', true, 3),

('Rapid Withdrawal Requests', 'velocity', 'financial', 
 '{"transaction_type": "withdrawal", "max_count": 3, "time_window_minutes": 30}',
 75, 'manual_review', 'flag', true, 4),

-- Device Fingerprint Rules
('New Device High Amount', 'device_fingerprint', 'security', 
 '{"min_amount": 5000, "new_device_threshold_hours": 24}',
 65, 'manual_review', 'flag', true, 5),

('Suspicious Device Pattern', 'device_fingerprint', 'behavioral', 
 '{"max_users_per_device": 3, "time_window_hours": 24}',
 70, 'manual_review', 'flag', true, 6),

-- Combined Rules
('High Risk Country + VPN', 'combined', 'security', 
 '{"high_risk_countries": ["CN", "RU", "NG", "PK"], "requires_vpn": true}',
 85, 'manual_review', 'block', true, 7),

('Rapid Multi-Device Access', 'device_fingerprint', 'behavioral', 
 '{"unique_devices": 5, "time_window_hours": 1}',
 80, 'manual_review', 'flag', true, 8);

-- Update existing fraud rules to be more specific
UPDATE public.fraud_rules 
SET conditions = '{"threshold": 10000, "currency": "TRY"}'
WHERE rule_type = 'amount_threshold' AND name LIKE '%Amount%';

-- Add fraud detection status to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS fraud_status TEXT DEFAULT 'clean' CHECK (fraud_status IN ('clean', 'flagged', 'under_review', 'blocked'));

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_fraud_check TIMESTAMPTZ DEFAULT now();

-- Create fraud incidents table
CREATE TABLE IF NOT EXISTS public.fraud_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.fraud_rules(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  auto_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.admins(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on fraud incidents
ALTER TABLE public.fraud_incidents ENABLE ROW LEVEL SECURITY;

-- Create policies for fraud incidents
CREATE POLICY "Admins can manage fraud incidents" ON public.fraud_incidents
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fraud_incidents_user_id ON public.fraud_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_incidents_status ON public.fraud_incidents(status);
CREATE INDEX IF NOT EXISTS idx_fraud_incidents_severity ON public.fraud_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_incidents_created_at ON public.fraud_incidents(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_fraud_incidents_updated_at
    BEFORE UPDATE ON public.fraud_incidents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();