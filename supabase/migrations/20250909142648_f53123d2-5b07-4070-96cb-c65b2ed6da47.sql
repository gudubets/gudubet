-- Finansal sistem için gelişmiş tablolar oluştur

-- Önce mevcut payments tablosunu kontrol et ve gerekirse güncelle
-- Payment status enum'unu güncelle
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Withdrawal status enum'u oluştur
DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Withdrawals tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL CHECK (amount > 0),
    currency varchar(3) NOT NULL DEFAULT 'TRY',
    withdrawal_method varchar(50) NOT NULL,
    account_details jsonb NOT NULL, -- IBAN, Papara no, crypto address vb.
    status withdrawal_status NOT NULL DEFAULT 'pending',
    admin_notes text,
    processed_by uuid REFERENCES public.admins(id),
    processed_at timestamp with time zone,
    risk_score integer DEFAULT 0,
    risk_flags text[],
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Withdrawals için RLS etkinleştir
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Withdrawals RLS politikaları
CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals
FOR SELECT
USING (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create their own withdrawals"
ON public.withdrawals
FOR INSERT
WITH CHECK (auth.uid() = (SELECT auth_user_id FROM users WHERE id = user_id));

CREATE POLICY "Admins can view all withdrawals"
ON public.withdrawals
FOR SELECT
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

CREATE POLICY "Admins can update withdrawals"
ON public.withdrawals
FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Payments tablosunu güncelle (eğer gerekli alanlar yoksa)
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS transaction_fee numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS processor_transaction_id text,
ADD COLUMN IF NOT EXISTS callback_url text,
ADD COLUMN IF NOT EXISTS return_url text,
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Transaction fees tablosu (ödeme sağlayıcıları için komisyon oranları)
CREATE TABLE IF NOT EXISTS public.transaction_fees (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id uuid REFERENCES public.payment_providers(id),
    transaction_type varchar(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal')),
    fee_type varchar(20) NOT NULL CHECK (fee_type IN ('percentage', 'fixed', 'mixed')),
    fee_value numeric(5,2) NOT NULL,
    fixed_fee numeric(10,2) DEFAULT 0,
    min_fee numeric(10,2) DEFAULT 0,
    max_fee numeric(10,2),
    currency varchar(3) NOT NULL DEFAULT 'TRY',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers ekle
DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON public.withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transaction_fees_updated_at ON public.transaction_fees;
CREATE TRIGGER update_transaction_fees_updated_at
    BEFORE UPDATE ON public.transaction_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON public.withdrawals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);