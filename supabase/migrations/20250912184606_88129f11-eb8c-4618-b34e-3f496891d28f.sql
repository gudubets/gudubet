-- Insert missing user record with all required fields
INSERT INTO public.users (id, auth_user_id, username, kyc_level, kyc_status)
VALUES ('18af9be5-9862-41df-b3a7-e084a0d84ed4', '18af9be5-9862-41df-b3a7-e084a0d84ed4', 'user_' || substring('18af9be5-9862-41df-b3a7-e084a0d84ed4'::text, 1, 8), 'level_2', 'verified')
ON CONFLICT (id) DO UPDATE SET
  kyc_level = EXCLUDED.kyc_level,
  kyc_status = EXCLUDED.kyc_status;