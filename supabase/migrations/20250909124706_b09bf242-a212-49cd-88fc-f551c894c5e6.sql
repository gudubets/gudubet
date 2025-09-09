-- Create payment providers table
CREATE TABLE public.payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  provider_type VARCHAR(50) NOT NULL, -- 'card', 'bank_transfer', 'e_wallet'
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  is_sandbox BOOLEAN DEFAULT true,
  supported_currencies TEXT[] DEFAULT ARRAY['TRY', 'USD', 'EUR'],
  min_amount NUMERIC DEFAULT 10.00,
  max_amount NUMERIC DEFAULT 50000.00,
  processing_fee_percentage NUMERIC DEFAULT 0.0,
  processing_fee_fixed NUMERIC DEFAULT 0.0,
  config JSONB DEFAULT '{}', -- API keys, webhook URLs, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table (enhanced version of transactions)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_id UUID REFERENCES public.payment_providers(id),
  payment_method VARCHAR(50) NOT NULL, -- 'credit_card', 'bank_transfer', 'e_wallet'
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
  provider_reference TEXT, -- External transaction ID from PSP
  provider_status TEXT, -- Raw status from PSP
  idempotency_key TEXT UNIQUE,
  payment_data JSONB DEFAULT '{}', -- Card info, bank details (encrypted)
  webhook_data JSONB DEFAULT '{}', -- Webhook payload storage
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_flags TEXT[] DEFAULT '{}',
  fraud_check_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'passed', 'failed', 'manual_review'
  three_ds_status VARCHAR(20), -- '3ds_required', '3ds_completed', '3ds_failed'
  three_ds_url TEXT,
  failure_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT fk_payments_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'TRY',
  withdrawal_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'e_wallet', 'crypto'
  bank_details JSONB, -- IBAN, bank name, account holder, etc.
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processing', 'completed', 'failed'
  reviewer_id UUID, -- Admin who reviewed
  review_note TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_flags TEXT[] DEFAULT '{}',
  kyc_required BOOLEAN DEFAULT true,
  kyc_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  provider_reference TEXT, -- External transaction ID
  processing_fee NUMERIC DEFAULT 0.00,
  net_amount NUMERIC, -- amount - processing_fee
  auto_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_withdrawals_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_withdrawals_reviewer_id FOREIGN KEY (reviewer_id) REFERENCES public.admins(id)
);

-- Create fraud rules table
CREATE TABLE public.fraud_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'ip_country', 'velocity', 'device_fingerprint', 'amount_threshold'
  conditions JSONB NOT NULL, -- Rule conditions as JSON
  action VARCHAR(50) NOT NULL, -- 'flag', 'block', 'manual_review', 'limit'
  risk_score_impact INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create payment webhooks table for logging
CREATE TABLE public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_slug VARCHAR(50) NOT NULL,
  webhook_type VARCHAR(50) NOT NULL, -- 'payment_status', 'refund', 'chargeback'
  payload JSONB NOT NULL,
  signature TEXT,
  payment_id UUID REFERENCES public.payments(id),
  withdrawal_id UUID REFERENCES public.withdrawals(id),
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Create user device fingerprints table
CREATE TABLE public.user_device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  user_agent TEXT,
  screen_resolution TEXT,
  timezone TEXT,
  language TEXT,
  ip_address INET,
  country_code VARCHAR(2),
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  usage_count INTEGER DEFAULT 1,
  is_trusted BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_device_fingerprints_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_fingerprints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_providers
CREATE POLICY "Payment providers are viewable by everyone" ON public.payment_providers
  FOR SELECT USING (is_active = true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = payments.user_id));

CREATE POLICY "Users can create their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = payments.user_id));

CREATE POLICY "System can update payments" ON public.payments
  FOR UPDATE USING (true);

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = withdrawals.user_id));

CREATE POLICY "Users can create their own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = withdrawals.user_id));

CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- RLS Policies for fraud rules
CREATE POLICY "Admins can manage fraud rules" ON public.fraud_rules
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- RLS Policies for payment webhooks
CREATE POLICY "System can manage webhooks" ON public.payment_webhooks
  FOR ALL USING (true);

-- RLS Policies for device fingerprints
CREATE POLICY "Users can view their own device fingerprints" ON public.user_device_fingerprints
  FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_device_fingerprints.user_id));

CREATE POLICY "System can manage device fingerprints" ON public.user_device_fingerprints
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_provider_reference ON public.payments(provider_reference);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON public.withdrawals(created_at DESC);

CREATE INDEX idx_payment_webhooks_provider ON public.payment_webhooks(provider_slug);
CREATE INDEX idx_payment_webhooks_processed ON public.payment_webhooks(processed);

CREATE INDEX idx_device_fingerprints_user_id ON public.user_device_fingerprints(user_id);
CREATE INDEX idx_device_fingerprints_hash ON public.user_device_fingerprints(fingerprint_hash);

-- Insert default payment providers
INSERT INTO public.payment_providers (name, slug, provider_type, api_endpoint, supported_currencies, min_amount, max_amount) VALUES
('Stripe', 'stripe', 'card', 'https://api.stripe.com', ARRAY['TRY', 'USD', 'EUR'], 1.00, 100000.00),
('PayTR', 'paytr', 'card', 'https://www.paytr.com/odeme/api', ARRAY['TRY'], 1.00, 50000.00),
('Iyzico', 'iyzico', 'card', 'https://api.iyzipay.com', ARRAY['TRY', 'USD', 'EUR'], 1.00, 75000.00),
('Papara', 'papara', 'e_wallet', 'https://merchant-api.papara.com', ARRAY['TRY'], 5.00, 10000.00),
('Bank Transfer', 'bank_transfer', 'bank_transfer', NULL, ARRAY['TRY'], 50.00, 100000.00);

-- Insert default fraud rules
INSERT INTO public.fraud_rules (name, rule_type, conditions, action, risk_score_impact) VALUES
('High Risk Countries', 'ip_country', '{"blocked_countries": ["XX", "YY"]}', 'manual_review', 25),
('Velocity Check - Deposits', 'velocity', '{"max_amount": 5000, "time_window": 3600, "transaction_type": "deposit"}', 'manual_review', 20),
('Large Amount Threshold', 'amount_threshold', '{"threshold": 10000, "currency": "TRY"}', 'manual_review', 15),
('New Device', 'device_fingerprint', '{"new_device": true}', 'flag', 10),
('VPN Detection', 'ip_analysis', '{"vpn_detected": true}', 'manual_review', 30);

-- Create function to calculate risk score
CREATE OR REPLACE FUNCTION public.calculate_payment_risk_score(
  _user_id UUID,
  _amount NUMERIC,
  _currency VARCHAR,
  _ip_address INET DEFAULT NULL,
  _device_fingerprint TEXT DEFAULT NULL
)
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
  WHERE user_id = _user_id AND status IN ('completed', 'processing');

  -- Apply fraud rules
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
    
    -- New user check
    IF _rule.rule_type = 'new_user' THEN
      IF _user_stats.total_payments = 0 THEN
        _risk_score := _risk_score + _rule.risk_score_impact;
      END IF;
    END IF;
    
  END LOOP;

  -- Ensure risk score is within bounds
  _risk_score := GREATEST(0, LEAST(100, _risk_score));
  
  RETURN _risk_score;
END;
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_payment_providers_updated_at
  BEFORE UPDATE ON public.payment_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();