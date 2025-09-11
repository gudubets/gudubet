-- Update existing profiles table to add missing columns if they don't exist
DO $$
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE public.profiles ADD COLUMN city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'postal_code') THEN
        ALTER TABLE public.profiles ADD COLUMN postal_code TEXT;
    END IF;
END $$;

-- Update the handle_new_user function to include all profile fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    birth_date, 
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
    (NEW.raw_user_meta_data ->> 'birth_date')::DATE,
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'city',
    NEW.raw_user_meta_data ->> 'address',
    NEW.raw_user_meta_data ->> 'postal_code'
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code;
  RETURN NEW;
END;
$$;