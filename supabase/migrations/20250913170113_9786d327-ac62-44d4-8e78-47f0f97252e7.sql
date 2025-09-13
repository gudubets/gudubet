-- Update the handle_new_user function to capture registration IP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id, 
    first_name, 
    last_name, 
    phone, 
    birth_date, 
    country, 
    city, 
    address, 
    postal_code,
    registration_ip
  )
  VALUES (
    NEW.id,
    NEW.id,  -- Set user_id to the same value as id
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    (NEW.raw_user_meta_data ->> 'birth_date')::DATE,
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'postal_code',
    (NEW.raw_user_meta_data ->> 'registration_ip')::inet
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    registration_ip = EXCLUDED.registration_ip;
  RETURN NEW;
END;
$function$;