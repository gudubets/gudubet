-- Add comprehensive fraud rules for Phase 3
INSERT INTO public.fraud_rules (name, rule_type, rule_category, conditions, action, risk_score_impact, auto_action, time_window_hours, threshold_count, is_active) VALUES
('VPN Usage Detection', 'ip_analysis', 'geo', '{"check_vpn": true, "block_vpn": false}', 'flag', 30, 'flag', 24, 1, true),
('High Risk Country', 'geo_location', 'geo', '{"high_risk_countries": ["AF", "KP", "IR"], "block_countries": []}', 'review', 50, 'review', 24, 1, true),
('Device Change Frequency', 'device_analysis', 'behavioral', '{"max_devices_per_day": 3, "max_devices_per_week": 5}', 'flag', 25, 'flag', 24, 3, true),
('Rapid Fire Deposits', 'velocity', 'velocity', '{"transaction_type": "deposit", "max_count": 5, "time_window": 1}', 'review', 40, 'review', 1, 5, true),
('Large Withdrawal After Deposit', 'pattern', 'behavioral', '{"deposit_to_withdrawal_ratio": 0.9, "time_window": 2}', 'review', 35, 'review', 2, 1, true),
('Night Time Activity', 'time_pattern', 'behavioral', '{"night_hours": {"start": 2, "end": 6}, "max_transactions": 3}', 'flag', 20, 'flag', 24, 3, true),
('Proxy/Tor Usage', 'ip_analysis', 'geo', '{"check_proxy": true, "check_tor": true}', 'block', 60, 'block', 24, 1, true),
('Datacenter IP Usage', 'ip_analysis', 'geo', '{"check_datacenter": true}', 'review', 45, 'review', 24, 1, true),
('Multiple Failed Logins', 'login_pattern', 'behavioral', '{"max_failed_attempts": 5, "time_window": 15}', 'block', 70, 'block', 1, 5, true),
('Suspicious Amount Pattern', 'amount_pattern', 'behavioral', '{"round_amounts": true, "threshold": 1000}', 'flag', 15, 'flag', 24, 1, true)
WHERE NOT EXISTS (SELECT 1 FROM public.fraud_rules WHERE name = 'VPN Usage Detection');

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