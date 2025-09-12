-- Create bank_accounts table for admin to manage deposit IBANs
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name VARCHAR NOT NULL,
  account_holder_name VARCHAR NOT NULL,
  iban VARCHAR(26) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create deposits table to track deposit requests
CREATE TABLE public.deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  user_account_name VARCHAR NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_note TEXT,
  reviewer_id UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- RLS policies for bank_accounts
CREATE POLICY "Everyone can view active bank accounts" 
ON public.bank_accounts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage bank accounts" 
ON public.bank_accounts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

-- RLS policies for deposits
CREATE POLICY "Users can view their own deposits" 
ON public.deposits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = deposits.user_id AND auth_user_id = auth.uid()
));

CREATE POLICY "Users can create their own deposits" 
ON public.deposits 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = deposits.user_id AND auth_user_id = auth.uid()
));

CREATE POLICY "Admins can view all deposits" 
ON public.deposits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

CREATE POLICY "Admins can update deposit status" 
ON public.deposits 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_active = true
));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();