-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type TEXT NOT NULL, -- 'bank_transfer', 'credit_card', 'e_wallet', 'crypto'
  provider TEXT NOT NULL, -- 'stripe', 'iyzico', 'paytr', etc.
  account_info JSONB NOT NULL, -- encrypted account details
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal limits table
CREATE TABLE IF NOT EXISTS public.withdrawal_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_limit NUMERIC(15,2) NOT NULL DEFAULT 5000.00,
  weekly_limit NUMERIC(15,2) NOT NULL DEFAULT 25000.00,
  monthly_limit NUMERIC(15,2) NOT NULL DEFAULT 100000.00,
  min_withdrawal NUMERIC(15,2) NOT NULL DEFAULT 50.00,
  max_withdrawal NUMERIC(15,2) NOT NULL DEFAULT 50000.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Update withdrawals table with comprehensive fields
DROP TABLE IF EXISTS public.withdrawals CASCADE;
CREATE TABLE public.withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  fee_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  net_amount NUMERIC(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected', 'processing', 'completed', 'failed'
  provider_reference TEXT,
  provider_response JSONB,
  
  -- Risk and compliance
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_flags TEXT[] DEFAULT '{}',
  requires_kyc BOOLEAN NOT NULL DEFAULT true,
  requires_manual_review BOOLEAN NOT NULL DEFAULT false,
  
  -- Admin workflow
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_note TEXT,
  rejection_reason TEXT,
  
  -- Timing and processing
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawal rules table for dynamic rule management
CREATE TABLE IF NOT EXISTS public.withdrawal_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'kyc_required', 'waiting_period', 'amount_limit', 'frequency_limit', 'bonus_restriction'
  conditions JSONB NOT NULL, -- rule conditions
  action TEXT NOT NULL, -- 'block', 'require_review', 'apply_fee', 'reduce_limit'
  priority INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their own payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
ON public.payment_methods 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
ON public.payment_methods 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

-- RLS Policies for withdrawal_limits
CREATE POLICY "Users can view their own withdrawal limits" 
ON public.withdrawal_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawal limits" 
ON public.withdrawal_limits 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "System can manage withdrawal limits" 
ON public.withdrawal_limits 
FOR ALL 
USING (true);

-- RLS Policies for withdrawals
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals" 
ON public.withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "Admins can update withdrawals" 
ON public.withdrawals 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "System can manage withdrawals" 
ON public.withdrawals 
FOR ALL 
USING (true);

-- RLS Policies for withdrawal_rules
CREATE POLICY "Admins can manage withdrawal rules" 
ON public.withdrawal_rules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND role_type = 'super_admin'
));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_risk_score ON public.withdrawals(risk_score);
CREATE INDEX IF NOT EXISTS idx_withdrawals_requested_at ON public.withdrawals(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_reviewer_id ON public.withdrawals(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON public.payment_methods(is_active);

-- Insert default withdrawal rules
INSERT INTO public.withdrawal_rules (name, rule_type, conditions, action, priority) VALUES
('KYC Required for First Withdrawal', 'kyc_required', '{"first_withdrawal": true}', 'require_review', 1),
('High Amount Manual Review', 'amount_limit', '{"threshold": 10000, "currency": "TRY"}', 'require_review', 2),
('Daily Limit Check', 'frequency_limit', '{"period": "daily", "max_amount": 5000}', 'block', 3),
('Bonus Wagering Restriction', 'bonus_restriction', '{"bonus_balance_check": true}', 'block', 4),
('VIP Higher Limits', 'amount_limit', '{"vip_level": "gold", "threshold": 50000}', 'apply_fee', 5);

-- Insert default withdrawal limits for existing users
INSERT INTO public.withdrawal_limits (user_id, daily_limit, weekly_limit, monthly_limit)
SELECT id, 5000.00, 25000.00, 100000.00
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.withdrawal_limits)
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_withdrawal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_withdrawal_updated_at();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_limits_updated_at
BEFORE UPDATE ON public.withdrawal_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();