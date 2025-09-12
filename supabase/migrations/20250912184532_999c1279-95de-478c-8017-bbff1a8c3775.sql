-- Insert missing user record with default KYC level
INSERT INTO public.users (id, auth_user_id, kyc_level, kyc_status)
VALUES ('18af9be5-9862-41df-b3a7-e084a0d84ed4', '18af9be5-9862-41df-b3a7-e084a0d84ed4', 'level_2', 'verified')
ON CONFLICT (id) DO UPDATE SET
  kyc_level = EXCLUDED.kyc_level,
  kyc_status = EXCLUDED.kyc_status;