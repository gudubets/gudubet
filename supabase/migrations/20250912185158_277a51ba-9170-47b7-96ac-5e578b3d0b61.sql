-- Comprehensive migration to move all relationships from users table to profiles table

-- Step 1: Add missing columns from users to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency text DEFAULT 'TRY';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_balance numeric DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_level kyc_level DEFAULT 'level_0';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_verified_at timestamp with time zone;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_rejection_reason text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fraud_status text DEFAULT 'clean';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_fraud_check timestamp with time zone DEFAULT now();

-- Step 2: Migrate data from users to profiles
UPDATE public.profiles SET 
    username = u.username,
    email = u.email,
    date_of_birth = u.date_of_birth,
    currency = u.currency,
    balance = u.balance,
    bonus_balance = u.bonus_balance,
    status = u.status,
    email_verified = u.email_verified,
    phone_verified = u.phone_verified,
    kyc_status = u.kyc_status,
    kyc_level = u.kyc_level,
    kyc_verified_at = u.kyc_verified_at,
    kyc_rejection_reason = u.kyc_rejection_reason,
    fraud_status = u.fraud_status,
    last_fraud_check = u.last_fraud_check
FROM public.users u
WHERE profiles.user_id = u.auth_user_id;

-- Step 3: Create a mapping table to help with foreign key updates
CREATE TEMP TABLE user_id_mapping AS
SELECT u.id as old_user_id, p.id as new_profile_id
FROM public.users u
JOIN public.profiles p ON u.auth_user_id = p.user_id;

-- Step 4: Update all foreign key relationships to point to profiles.id instead of users.id

-- Analytics events
UPDATE public.analytics_events 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE analytics_events.user_id = m.old_user_id;

-- Betslips 
UPDATE public.betslips 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE betslips.user_id = m.old_user_id;

-- Bonus events
UPDATE public.bonus_events 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE bonus_events.user_id = m.old_user_id;

-- Bonus risk flags
UPDATE public.bonus_risk_flags 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE bonus_risk_flags.user_id = m.old_user_id;

-- Bonus wallets
UPDATE public.bonus_wallets 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE bonus_wallets.user_id = m.old_user_id;

-- Campaign deliveries
UPDATE public.campaign_deliveries 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE campaign_deliveries.user_id = m.old_user_id;

-- Device events
UPDATE public.device_events 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE device_events.user_id = m.old_user_id;

-- Device fingerprints
UPDATE public.device_fingerprints 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE device_fingerprints.user_id = m.old_user_id;

-- Fraud alerts
UPDATE public.fraud_alerts 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE fraud_alerts.user_id = m.old_user_id;

-- Fraud incidents
UPDATE public.fraud_incidents 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE fraud_incidents.user_id = m.old_user_id;

-- Game rounds
UPDATE public.game_rounds 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE game_rounds.user_id = m.old_user_id;

-- Game sessions
UPDATE public.game_sessions 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE game_sessions.user_id = m.old_user_id;

-- Payments
UPDATE public.payments 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE payments.user_id = m.old_user_id;

-- Wallets
UPDATE public.wallets 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE wallets.user_id = m.old_user_id;

-- Withdrawals
UPDATE public.withdrawals 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE withdrawals.user_id = m.old_user_id;

-- Step 5: Update all other tables with user_id references
-- KYC documents (if exists)
UPDATE public.kyc_documents 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE kyc_documents.user_id = m.old_user_id;

-- KYC verifications (if exists)
UPDATE public.kyc_verifications 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE kyc_verifications.user_id = m.old_user_id;

-- Login attempts (if exists)
UPDATE public.login_attempts 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE login_attempts.user_id = m.old_user_id;

-- Payment methods (if exists)
UPDATE public.payment_methods 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE payment_methods.user_id = m.old_user_id;

-- Risk flags (if exists)
UPDATE public.risk_flags 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE risk_flags.user_id = m.old_user_id;

-- User behavior logs (if exists)
UPDATE public.user_behavior_logs 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_behavior_logs.user_id = m.old_user_id;

-- User bonus tracking (if exists)
UPDATE public.user_bonus_tracking 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_bonus_tracking.user_id = m.old_user_id;

-- User bonuses (if exists)
UPDATE public.user_bonuses 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_bonuses.user_id = m.old_user_id;

-- User devices (if exists)
UPDATE public.user_devices 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_devices.user_id = m.old_user_id;

-- User favorites (if exists)
UPDATE public.user_favorites 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_favorites.user_id = m.old_user_id;

-- User LTV (if exists)
UPDATE public.user_ltv 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_ltv.user_id = m.old_user_id;

-- User notifications (if exists)
UPDATE public.user_notifications 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_notifications.user_id = m.old_user_id;

-- User promotions (if exists)
UPDATE public.user_promotions 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_promotions.user_id = m.old_user_id;

-- User sessions (if exists)
UPDATE public.user_sessions 
SET user_id = m.new_profile_id
FROM user_id_mapping m
WHERE user_sessions.user_id = m.old_user_id;

-- Notifications target_user_id
UPDATE public.notifications 
SET target_user_id = m.new_profile_id
FROM user_id_mapping m
WHERE notifications.target_user_id = m.old_user_id;

-- Step 6: Update functions that reference users table
CREATE OR REPLACE FUNCTION public.check_kyc_withdrawal_limit(_user_id uuid, _amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  -- Get user's KYC level from profiles table
  SELECT kyc_level INTO _user_kyc_level
  FROM public.profiles 
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
$function$;