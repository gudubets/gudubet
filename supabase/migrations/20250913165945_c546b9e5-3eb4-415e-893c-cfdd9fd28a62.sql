-- Add registration IP address column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN registration_ip inet;

-- Add index for better performance on IP queries
CREATE INDEX idx_profiles_registration_ip ON public.profiles(registration_ip);