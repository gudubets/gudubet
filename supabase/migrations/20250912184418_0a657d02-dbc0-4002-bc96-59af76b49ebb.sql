-- Update check_kyc_withdrawal_limit function to include all final withdrawal statuses
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
  
  -- Calculate current usage - include all completed/approved withdrawals
  SELECT 
    COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE) THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN DATE(created_at) >= DATE_TRUNC('year', CURRENT_DATE) THEN amount ELSE 0 END), 0)
  INTO _daily_withdrawn, _monthly_withdrawn, _yearly_withdrawn
  FROM public.withdrawals 
  WHERE user_id = _user_id AND status IN ('approved', 'processing', 'paid', 'completed');
  
  -- Build result object
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