-- =========================
-- CREATE MISSING ENUM TYPES (with proper error handling)
-- =========================

-- tx_direction enum
DO $$ BEGIN
    CREATE TYPE public.tx_direction AS ENUM ('debit','credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- amount_type enum  
DO $$ BEGIN
    CREATE TYPE public.amount_type AS ENUM ('percent','fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- risk_status enum
DO $$ BEGIN
    CREATE TYPE public.risk_status AS ENUM ('none','review','limited','blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- payment_status enum
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending','confirmed','failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =========================
-- PROFILES TABLE 
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT[] DEFAULT '{}',
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add role column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- =========================
-- MAIN WALLETS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type wallet_type NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Wallets policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
CREATE POLICY "Users can view their own wallets" ON public.wallets
FOR SELECT USING (user_id = auth.uid());

-- =========================
-- PAYMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  method TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'TRY',
  status payment_status NOT NULL DEFAULT 'pending',
  provider_ref TEXT,
  idempotency_key TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idempotency_key)  
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;

CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payments" ON public.payments
FOR INSERT WITH CHECK (user_id = auth.uid());

-- =========================
-- HELPER FUNCTIONS
-- =========================
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID LANGUAGE SQL STABLE AS $$
  SELECT auth.uid()
$$;

-- Function to check if user is admin (now profiles table exists with role column)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

-- =========================
-- WALLET BALANCE UPDATE FUNCTION & TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.fn_update_wallet_balance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.direction = 'credit' THEN
      -- Update main wallets
      UPDATE public.wallets SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
      
      -- Update bonus_wallets if applicable
      UPDATE public.bonus_wallets SET balance = balance + NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSE
      -- Update main wallets  
      UPDATE public.wallets SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
      
      -- Update bonus_wallets if applicable  
      UPDATE public.bonus_wallets SET balance = balance - NEW.amount, updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

-- Create trigger for wallet_transactions
DROP TRIGGER IF EXISTS trg_update_wallet_balance ON public.wallet_transactions;
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW EXECUTE FUNCTION public.fn_update_wallet_balance();

-- =========================
-- PERFORMANCE INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_wallets_user_type ON public.wallets(user_id, type);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wtx_wallet_occurred ON public.wallet_transactions(wallet_id, occurred_at);

-- =========================
-- UPDATE RLS POLICIES FOR WALLET_TRANSACTIONS
-- =========================
DROP POLICY IF EXISTS "Users can view their own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view their own wallet transactions" ON public.wallet_transactions
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.wallets w WHERE w.id = wallet_id AND w.user_id = auth.uid()
  ) OR
  EXISTS(
    SELECT 1 FROM public.bonus_wallets bw WHERE bw.id = wallet_id AND bw.user_id = auth.uid()
  )
);