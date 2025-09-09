-- Create payment_providers table for different payment providers
CREATE TABLE public.payment_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  provider_type VARCHAR NOT NULL, -- 'stripe', 'paypal', 'bank_transfer', etc.
  is_active BOOLEAN DEFAULT true,
  is_sandbox BOOLEAN DEFAULT true,
  min_amount NUMERIC DEFAULT 10.00,
  max_amount NUMERIC DEFAULT 50000.00,
  processing_fee_percentage NUMERIC DEFAULT 0.0,
  processing_fee_fixed NUMERIC DEFAULT 0.0,
  supported_currencies TEXT[] DEFAULT ARRAY['TRY', 'USD', 'EUR'],
  api_endpoint TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table for tracking deposit transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_id UUID REFERENCES public.payment_providers(id),
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'TRY',
  payment_method VARCHAR NOT NULL, -- 'credit_card', 'bank_transfer', etc.
  status VARCHAR DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  provider_reference TEXT, -- Stripe session_id, PayPal transaction_id, etc.
  provider_status TEXT,
  payment_data JSONB DEFAULT '{}',
  webhook_data JSONB DEFAULT '{}',
  failure_reason TEXT,
  risk_score INTEGER DEFAULT 0,
  risk_flags TEXT[] DEFAULT '{}',
  fraud_check_status VARCHAR DEFAULT 'pending',
  three_ds_status VARCHAR,
  three_ds_url TEXT,
  idempotency_key TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment_methods table for user saved payment methods
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  method_type TEXT NOT NULL, -- 'credit_card', 'bank_account', 'e_wallet'
  account_info JSONB NOT NULL, -- encrypted payment method details
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal_limits table for controlling withdrawal limits
CREATE TABLE public.withdrawal_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  limit_type VARCHAR NOT NULL, -- 'daily', 'weekly', 'monthly'
  amount_limit NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'TRY',
  used_amount NUMERIC DEFAULT 0.00,
  reset_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create withdrawal_rules table for business rules
CREATE TABLE public.withdrawal_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name VARCHAR NOT NULL,
  rule_type VARCHAR NOT NULL, -- 'min_amount', 'max_amount', 'kyc_required', 'waiting_period'
  rule_value JSONB NOT NULL,
  currency VARCHAR DEFAULT 'TRY',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_providers
CREATE POLICY "Payment providers are viewable by everyone" 
ON public.payment_providers FOR SELECT 
USING (is_active = true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = payments.user_id));

CREATE POLICY "Users can create their own payments" 
ON public.payments FOR INSERT 
WITH CHECK (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = payments.user_id));

CREATE POLICY "System can update payments" 
ON public.payments FOR UPDATE 
USING (true);

CREATE POLICY "Admins can view all payments" 
ON public.payments FOR SELECT 
USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods" 
ON public.payment_methods FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
ON public.payment_methods FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
ON public.payment_methods FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods" 
ON public.payment_methods FOR SELECT 
USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));

-- RLS Policies for withdrawal_limits
CREATE POLICY "Users can view their own withdrawal limits" 
ON public.withdrawal_limits FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for withdrawal_rules
CREATE POLICY "Withdrawal rules are viewable by everyone" 
ON public.withdrawal_rules FOR SELECT 
USING (is_active = true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_payment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payment_updated_at();

CREATE TRIGGER update_payment_providers_updated_at
  BEFORE UPDATE ON public.payment_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_limits_updated_at
  BEFORE UPDATE ON public.withdrawal_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment providers
INSERT INTO public.payment_providers (name, slug, provider_type, min_amount, max_amount, supported_currencies) VALUES
('Stripe', 'stripe', 'stripe', 10.00, 50000.00, ARRAY['TRY', 'USD', 'EUR']),
('Bank Transfer', 'bank-transfer', 'bank_transfer', 50.00, 100000.00, ARRAY['TRY']),
('Credit Card', 'credit-card', 'credit_card', 10.00, 50000.00, ARRAY['TRY', 'USD', 'EUR']);

-- Insert default withdrawal rules
INSERT INTO public.withdrawal_rules (rule_name, rule_type, rule_value, currency) VALUES
('Minimum Withdrawal TRY', 'min_amount', '{"amount": 50}', 'TRY'),
('Minimum Withdrawal USD', 'min_amount', '{"amount": 10}', 'USD'),
('Minimum Withdrawal EUR', 'min_amount', '{"amount": 10}', 'EUR'),
('Maximum Daily Withdrawal TRY', 'max_daily_amount', '{"amount": 10000}', 'TRY'),
('Maximum Daily Withdrawal USD', 'max_daily_amount', '{"amount": 2000}', 'USD'),
('Maximum Daily Withdrawal EUR', 'max_daily_amount', '{"amount": 2000}', 'EUR'),
('KYC Required for Large Amounts', 'kyc_required', '{"threshold": 5000}', 'TRY');