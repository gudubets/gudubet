-- Add used_amount column to user_bonuses table for tracking bonus usage
ALTER TABLE public.user_bonuses 
ADD COLUMN IF NOT EXISTS used_amount NUMERIC DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.user_bonuses.used_amount IS 'Amount of bonus that has been used by the user';