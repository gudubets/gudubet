-- Fix the handle_new_user trigger to also create a user record in the users table
-- This will ensure that every authenticated user has a corresponding record in the public.users table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    NEW.email_confirmed_at IS NOT NULL,
    FALSE
  );

  RETURN NEW;
END;
$function$;