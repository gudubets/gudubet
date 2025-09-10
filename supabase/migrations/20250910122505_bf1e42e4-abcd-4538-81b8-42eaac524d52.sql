-- Create missing KYC enums only if they don't exist
DO $$ BEGIN
  CREATE TYPE kyc_level AS ENUM ('level_0', 'level_1', 'level_2', 'level_3');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create KYC limits table if not exists
CREATE TABLE IF NOT EXISTS public.kyc_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_level kyc_level NOT NULL,
  daily_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  monthly_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  yearly_withdrawal_limit NUMERIC NOT NULL DEFAULT 0,
  daily_deposit_limit NUMERIC NOT NULL DEFAULT 0,
  monthly_deposit_limit NUMERIC NOT NULL DEFAULT 0,
  total_balance_limit NUMERIC NOT NULL DEFAULT 0,
  requires_documents kyc_document_type[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(kyc_level)
);

-- Create KYC documents table if not exists
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type kyc_document_type NOT NULL,
  document_url TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KYC verification requests table if not exists
CREATE TABLE IF NOT EXISTS public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_level kyc_level NOT NULL,
  current_level kyc_level NOT NULL DEFAULT 'level_0',
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_documents UUID[] NOT NULL DEFAULT '{}',
  admin_notes TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add KYC level to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'kyc_level') THEN
    ALTER TABLE public.users ADD COLUMN kyc_level kyc_level NOT NULL DEFAULT 'level_0';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'kyc_verified_at') THEN
    ALTER TABLE public.users ADD COLUMN kyc_verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'kyc_rejection_reason') THEN
    ALTER TABLE public.users ADD COLUMN kyc_rejection_reason TEXT;
  END IF;
END $$;

-- Add requires_kyc column to withdrawals table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'withdrawals' AND column_name = 'requires_kyc') THEN
    ALTER TABLE public.withdrawals ADD COLUMN requires_kyc BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Insert default KYC limits if table is empty
INSERT INTO public.kyc_limits (kyc_level, daily_withdrawal_limit, monthly_withdrawal_limit, yearly_withdrawal_limit, daily_deposit_limit, monthly_deposit_limit, total_balance_limit, requires_documents) 
SELECT * FROM (VALUES
  ('level_0', 0, 0, 0, 1000, 5000, 1000, ARRAY[]::kyc_document_type[]),
  ('level_1', 500, 5000, 25000, 5000, 25000, 10000, ARRAY['identity_card']::kyc_document_type[]),
  ('level_2', 2000, 25000, 100000, 25000, 100000, 50000, ARRAY['identity_card', 'address_proof']::kyc_document_type[]),
  ('level_3', 10000, 100000, 500000, 100000, 500000, 250000, ARRAY['identity_card', 'address_proof', 'selfie_with_id']::kyc_document_type[])
) AS new_limits(kyc_level, daily_withdrawal_limit, monthly_withdrawal_limit, yearly_withdrawal_limit, daily_deposit_limit, monthly_deposit_limit, total_balance_limit, requires_documents)
WHERE NOT EXISTS (SELECT 1 FROM public.kyc_limits);

-- Enable RLS on new tables
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Admins can update KYC documents" ON public.kyc_documents;

-- RLS Policies for kyc_documents
CREATE POLICY "Users can view their own KYC documents" 
ON public.kyc_documents FOR SELECT 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can upload their own KYC documents" 
ON public.kyc_documents FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Admins can view all KYC documents" 
ON public.kyc_documents FOR SELECT 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can update KYC documents" 
ON public.kyc_documents FOR UPDATE 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "KYC limits are viewable by everyone" ON public.kyc_limits;
DROP POLICY IF EXISTS "Admins can manage KYC limits" ON public.kyc_limits;

-- RLS Policies for kyc_limits
CREATE POLICY "KYC limits are viewable by everyone" 
ON public.kyc_limits FOR SELECT USING (true);

CREATE POLICY "Admins can manage KYC limits" 
ON public.kyc_limits FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own KYC verifications" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Users can create their own KYC verifications" ON public.kyc_verifications;
DROP POLICY IF EXISTS "Admins can manage all KYC verifications" ON public.kyc_verifications;

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view their own KYC verifications" 
ON public.kyc_verifications FOR SELECT 
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create their own KYC verifications" 
ON public.kyc_verifications FOR INSERT 
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Admins can manage all KYC verifications" 
ON public.kyc_verifications FOR ALL 
USING (EXISTS (SELECT 1 FROM admins WHERE id = auth.uid() AND is_active = true));