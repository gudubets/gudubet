-- Add bonus_balance column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' 
                   AND column_name='bonus_balance') THEN
        ALTER TABLE public.profiles ADD COLUMN bonus_balance NUMERIC(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Update existing users to have 0 bonus balance if null
UPDATE public.profiles 
SET bonus_balance = 0.00 
WHERE bonus_balance IS NULL;