-- Temporarily disable the KYC validation trigger to allow admin overrides
-- Admin can manually approve withdrawals that exceed limits

-- Update the validation function to be less strict for level_2 and above
CREATE OR REPLACE FUNCTION public.validate_withdrawal_kyc_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  user_kyc_status kyc_level;
  user_kyc_verified boolean;
  kyc_check jsonb;
BEGIN
  -- Get user's KYC status
  SELECT p.kyc_level, p.kyc_status = 'verified' 
  INTO user_kyc_status, user_kyc_verified
  FROM public.profiles p 
  WHERE p.id = NEW.user_id;
  
  -- Only auto-reject for level_0 users with amounts over 100
  IF user_kyc_status = 'level_0' AND NEW.amount > 100 THEN
    NEW.status := 'rejected';
    NEW.rejection_reason := 'KYC doğrulaması gereklidir. Lütfen kimlik belgelerinizi yükleyiniz.';
    NEW.requires_kyc := true;
    RETURN NEW;
  END IF;
  
  -- For level_1 and above, check limits but don't auto-reject
  -- Instead mark for manual review if limits exceeded
  kyc_check := public.check_kyc_withdrawal_limit(NEW.user_id, NEW.amount);
  
  IF NOT (kyc_check->>'allowed')::boolean THEN
    -- Don't auto-reject, just mark for manual review
    NEW.requires_manual_review := true;
    NEW.requires_kyc := true;
    -- Add a note but don't reject automatically
    IF NEW.admin_note IS NULL THEN
      NEW.admin_note := CASE 
        WHEN kyc_check->>'reason' = 'daily_limit_exceeded' THEN 'Günlük limit aşımı - manuel inceleme gerekiyor'
        WHEN kyc_check->>'reason' = 'monthly_limit_exceeded' THEN 'Aylık limit aşımı - manuel inceleme gerekiyor'  
        WHEN kyc_check->>'reason' = 'yearly_limit_exceeded' THEN 'Yıllık limit aşımı - manuel inceleme gerekiyor'
        ELSE 'KYC limit kontrolü - manuel inceleme gerekiyor'
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;