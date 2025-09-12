-- Fix the remaining foreign key references to use profiles table
-- Update device_events and user_devices to reference profiles.id instead of old users.id

-- Update device_events foreign key constraint
ALTER TABLE public.device_events 
DROP CONSTRAINT IF EXISTS device_events_user_id_fkey;

ALTER TABLE public.device_events 
ADD CONSTRAINT device_events_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update user_devices foreign key constraint  
ALTER TABLE public.user_devices 
DROP CONSTRAINT IF EXISTS user_devices_user_id_fkey;

ALTER TABLE public.user_devices 
ADD CONSTRAINT user_devices_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure all wallet references point to profiles
ALTER TABLE public.wallets 
DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;

ALTER TABLE public.wallets 
ADD CONSTRAINT wallets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update bonus_wallets as well
ALTER TABLE public.bonus_wallets 
DROP CONSTRAINT IF EXISTS bonus_wallets_user_id_fkey;

ALTER TABLE public.bonus_wallets 
ADD CONSTRAINT bonus_wallets_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;