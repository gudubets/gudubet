-- Create missing KYC functions and triggers
CREATE OR REPLACE FUNCTION public.check_kyc_withdrawal_limit(
  _user_id UUID,
  _amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_kyc_level TEXT;
  _daily_limit NUMERIC;
  _monthly_limit NUMERIC;
  _yearly_limit NUMERIC;
  _daily_withdrawn NUMERIC;
  _monthly_withdrawn NUMERIC;
  _yearly_withdrawn NUMERIC;
  _result JSONB;
BEGIN
  -- Get user's KYC level
  SELECT kyc_level::text INTO _user_kyc_level
  FROM public.users 
  WHERE id = _user_id;
  
  -- Get limits for this KYC level
  SELECT daily_withdrawal_limit, monthly_withdrawal_limit, yearly_withdrawal_limit
  INTO _daily_limit, _monthly_limit, _yearly_limit
  FROM public.kyc_limits 
  WHERE kyc_level::text = _user_kyc_level;
  
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
CREATE OR REPLACE FUNCTION public.get_required_kyc_documents(_target_level TEXT)
RETURNS kyc_document_type[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT requires_documents 
  FROM public.kyc_limits 
  WHERE kyc_level::text = _target_level;
$$;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON public.kyc_documents;
CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_kyc_limits_updated_at ON public.kyc_limits;
CREATE TRIGGER update_kyc_limits_updated_at
  BEFORE UPDATE ON public.kyc_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_kyc_verifications_updated_at ON public.kyc_verifications;
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
  _user_kyc_level TEXT;
BEGIN
  -- Get user's KYC level
  SELECT kyc_level::text INTO _user_kyc_level
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

-- Create trigger for withdrawal KYC validation
DROP TRIGGER IF EXISTS validate_withdrawal_kyc_trigger ON public.withdrawals;
CREATE TRIGGER validate_withdrawal_kyc_trigger
  BEFORE INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal_kyc();