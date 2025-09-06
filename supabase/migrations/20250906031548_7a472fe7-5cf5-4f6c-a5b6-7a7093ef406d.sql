-- Create admins table
CREATE TABLE public.admins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view themselves" 
ON public.admins 
FOR SELECT 
USING (email = (SELECT email FROM public.admins WHERE id = auth.uid()));

-- Add status column to existing tables
ALTER TABLE public.betslips ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update games table with is_active column if not exists
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add additional columns to bonus_campaigns if not exists
ALTER TABLE public.bonus_campaigns 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS min_deposit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_bonus NUMERIC;

-- Add status to transactions if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create trigger for admins updated_at
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_betslips_status ON public.betslips(status);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON public.games(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Insert sample admin user (password should be hashed in real implementation)
INSERT INTO public.admins (email, password_hash, role) 
VALUES ('admin@example.com', '$2b$10$example_hash', 'super_admin')
ON CONFLICT (email) DO NOTHING;