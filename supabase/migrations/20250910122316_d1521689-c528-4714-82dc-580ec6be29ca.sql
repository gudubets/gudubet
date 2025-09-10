-- Create KYC document types enum
CREATE TYPE kyc_document_type AS ENUM (
  'identity_card',
  'passport', 
  'driving_license',
  'utility_bill',
  'bank_statement',
  'address_proof',
  'selfie_with_id'
);

-- Create KYC status enum (updating existing if needed)
DO $$ BEGIN
  CREATE TYPE kyc_status_type AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'incomplete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create KYC levels enum
CREATE TYPE kyc_level AS ENUM ('level_0', 'level_1', 'level_2', 'level_3');

-- Create KYC documents table
CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type kyc_document_type NOT NULL,
  document_url TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  status kyc_status_type NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KYC limits table
CREATE TABLE public.kyc_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_level kyc_level NOT NULL,
  daily_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  monthly_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  yearly_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  daily_deposit_limit NUMERIC NOT NULL DEFAULT 0,
  monthly_deposit_limit NUMERIC NOT NULL DEFAULT 0,
  total_balance_limit NUMERIC NOT NULL DEFAULT 0,
  requires_documents kyc_document_type[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kyc_level)
);

-- Create KYC verification requests table
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_level kyc_level NOT NULL,
  current_level kyc_level NOT NULL DEFAULT 'level_0',
  status kyc_status_type NOT NULL DEFAULT 'pending',
  submitted_documents UUID[] NOT NULL DEFAULT '{}',
  admin_notes TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add KYC level to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_level kyc_level NOT NULL DEFAULT 'level_0';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Insert default KYC limits
INSERT INTO public.kyc_limits (kyc_level, daily_withdrawal_limit, monthly_withdrawal_limit, yearly_withdrawal_limit, daily_deposit_limit, monthly_deposit_limit, total_balance_limit, requires_documents) VALUES
('level_0', 0, 0, 0, 1000, 5000, 1000, '{}'),
('level_1', 500, 5000, 25000, 5000, 25000, 10000, ARRAY['identity_card']::kyc_document_type[]),
('level_2', 2000, 25000, 100000, 25000, 100000, 50000, ARRAY['identity_card', 'address_proof']::kyc_document_type[]),
('level_3', 10000, 100000, 500000, 100000, 500000, 250000, ARRAY['identity_card', 'address_proof', 'selfie_with_id']::kyc_document_type[]);

-- Enable RLS on new tables
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kyc_documents
CREATE POLICY "Users can view their own KYC documents" 
ON public.kyc_documents FOR SELECT 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can upload their own KYC documents" 
ON public.kyc_documents FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Admins can view all KYC documents" 
ON public.kyc_documents FOR SELECT 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can update KYC documents" 
ON public.kyc_documents FOR UPDATE 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- RLS Policies for kyc_limits
CREATE POLICY "KYC limits are viewable by everyone" 
ON public.kyc_limits FOR SELECT USING (true);

CREATE POLICY "Admins can manage KYC limits" 
ON public.kyc_limits FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view their own KYC verifications" 
ON public.kyc_verifications FOR SELECT 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create their own KYC verifications" 
ON public.kyc_verifications FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Admins can manage all KYC verifications" 
ON public.kyc_verifications FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- Create function to check KYC withdrawal limits
CREATE OR REPLACE FUNCTION public.check_kyc_withdrawal_limit(
  _user_id UUID,
  _amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_kyc_level kyc_level;
  _daily_limit NUMERIC;
  _monthly_limit NUMERIC;
  _yearly_limit NUMERIC;
  _daily_withdrawn NUMERIC;
  _monthly_withdrawn NUMERIC;
  _yearly_withdrawn NUMERIC;
  _result JSONB;
BEGIN
  -- Get user's KYC level
  SELECT kyc_level INTO _user_kyc_level
  FROM public.users 
  WHERE id = _user_id;
  
  -- Get limits for this KYC level
  SELECT daily_withdrawal_limit, monthly_withdrawal_limit, yearly_withdrawal_limit
  INTO _daily_limit, _monthly_limit, _yearly_limit
  FROM public.kyc_limits 
  WHERE kyc_level = _user_kyc_level;
  
  -- Calculate current usage
  SELECT 
    COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('year', CURRENT_DATE) THEN amount ELSE 0 END), 0)
  INTO _daily_withdrawn, _monthly_withdrawn, _yearly_withdrawn
  FROM public.withdrawals 
  WHERE user_id = _user_id AND status IN ('approved', 'processing');
  
  -- Check limits
  _result := jsonb_build_object(
    'allowed', true,
    'kyc_level', _user_kyc_level,
    'daily_limit', _daily_limit,
    'monthly_limit', _monthly_limit,
    'yearly_limit', _yearly_limit,
    'daily_used', _daily_withdrawn,
    'monthly_used', _monthly_withdrawn,
    'yearly_used', _yearly_withdrawn,
    'daily_remaining', _daily_limit - _daily_withdrawn,
    'monthly_remaining', _monthly_limit - _monthly_withdrawn,
    'yearly_remaining', _yearly_limit - _yearly_withdrawn
  );
  
  -- Check if amount exceeds any limit
  IF _amount > (_daily_limit - _daily_withdrawn) THEN
    _result := _result || jsonb_build_object('allowed', false, 'reason', 'daily_limit_exceeded');
  ELSIF _amount > (_monthly_limit - _monthly_withdrawn) THEN
    _result := _result || jsonb_build_object('allowed', false, 'reason', 'monthly_limit_exceeded');
  ELSIF _amount > (_yearly_limit - _yearly_withdrawn) THEN
    _result := _result || jsonb_build_object('allowed', false, 'reason', 'yearly_limit_exceeded');
  END IF;
  
  RETURN _result;
END;
$$;

-- Create function to get required KYC documents for level upgrade
CREATE OR REPLACE FUNCTION public.get_required_kyc_documents(_target_level kyc_level)
RETURNS kyc_document_type[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT requires_documents 
  FROM public.kyc_limits 
  WHERE kyc_level = _target_level;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_limits_updated_at
  BEFORE UPDATE ON public.kyc_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_verifications_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically approve/reject withdrawal based on KYC
CREATE OR REPLACE FUNCTION public.validate_withdrawal_kyc()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _kyc_check JSONB;
  _user_kyc_level kyc_level;
BEGIN
  -- Get user's KYC level
  SELECT kyc_level INTO _user_kyc_level
  FROM public.users 
  WHERE id = NEW.user_id;
  
  -- Level 0 users cannot withdraw anything
  IF _user_kyc_level = 'level_0' THEN
    NEW.status := 'rejected';
    NEW.rejection_reason := 'KYC verification required for withdrawals';
    NEW.requires_kyc := true;
    RETURN NEW;
  END IF;
  
  -- Check KYC withdrawal limits
  _kyc_check := public.check_kyc_withdrawal_limit(NEW.user_id, NEW.amount);
  
  IF NOT (_kyc_check->>'allowed')::boolean THEN
    NEW.status := 'rejected';
    NEW.rejection_reason := CASE 
      WHEN _kyc_check->>'reason' = 'daily_limit_exceeded' THEN 'Daily withdrawal limit exceeded for your KYC level'
      WHEN _kyc_check->>'reason' = 'monthly_limit_exceeded' THEN 'Monthly withdrawal limit exceeded for your KYC level'
      WHEN _kyc_check->>'reason' = 'yearly_limit_exceeded' THEN 'Yearly withdrawal limit exceeded for your KYC level'
      ELSE 'KYC limit exceeded'
    END;
    NEW.requires_kyc := true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add requires_kyc column to withdrawals table
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS requires_kyc BOOLEAN NOT NULL DEFAULT false;

-- Create trigger for withdrawal KYC validation
CREATE TRIGGER validate_withdrawal_kyc_trigger
  BEFORE INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal_kyc();