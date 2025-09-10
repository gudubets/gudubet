-- Enable RLS on tables that might be missing it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for admin access
CREATE POLICY "Admins can view all users" 
ON public.users FOR SELECT 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- Update function search paths that were missed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    country,
    city,
    address,
    postal_code
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    (NEW.raw_user_meta_data ->> 'birth_date')::date,
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'postal_code'
  );

  -- Insert into users table with default balance
  INSERT INTO public.users (
    auth_user_id,
    email,
    username,
    first_name,
    last_name,
    phone,
    country,
    date_of_birth,
    balance,
    bonus_balance,
    status,
    kyc_status,
    kyc_level,
    email_verified,
    phone_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'country',
    (NEW.raw_user_meta_data ->> 'birth_date')::date,
    0.00,
    0.00,
    'active',
    'pending',
    'level_0',
    NEW.email_confirmed_at IS NOT NULL,
    FALSE
  );

  RETURN NEW;
END;
$$;

-- Fix search path for other functions
CREATE OR REPLACE FUNCTION public.check_kyc_withdrawal_limit(
  _user_id UUID,
  _amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.get_required_kyc_documents(_target_level kyc_level)
RETURNS kyc_document_type[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT requires_documents 
  FROM public.kyc_limits 
  WHERE kyc_level = _target_level;
$$;

CREATE OR REPLACE FUNCTION public.validate_withdrawal_kyc()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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