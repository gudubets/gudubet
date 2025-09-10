-- Bonus & Kampanya Yönetimi Şeması (mevcut yapıyla uyumlu)

-- Enum türleri (sadece yoksa oluştur)
DO $$ BEGIN
    CREATE TYPE bonus_type_new AS ENUM ('FIRST_DEPOSIT', 'RELOAD', 'CASHBACK', 'FREEBET');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bonus_status_new AS ENUM ('eligible', 'active', 'completed', 'forfeited', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wallet_type AS ENUM ('main', 'bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_direction AS ENUM ('debit', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bonus_event_type AS ENUM ('deposit_made', 'wager_placed', 'wager_voided', 'bonus_granted', 'bonus_progressed', 'bonus_completed', 'bonus_forfeited', 'bonus_expired', 'manual_review_triggered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wallets tablosu (ana ve bonus cüzdanları)
CREATE TABLE IF NOT EXISTS public.bonus_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type wallet_type NOT NULL,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type, currency)
);

-- Cüzdan işlemleri (ledger)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.bonus_wallets(id) ON DELETE CASCADE,
  direction transaction_direction NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  ledger_key TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bonus şablonları (bonus_campaigns yerine bonuses_new)
CREATE TABLE IF NOT EXISTS public.bonuses_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  type bonus_type_new NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount_type TEXT NOT NULL CHECK (amount_type IN ('percent', 'fixed')),
  amount_value NUMERIC(18,2) NOT NULL,
  max_cap NUMERIC(18,2),
  min_deposit NUMERIC(18,2) DEFAULT 0,
  rollover_multiplier NUMERIC(8,2) DEFAULT 0,
  auto_grant BOOLEAN DEFAULT false,
  requires_code BOOLEAN DEFAULT false,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  max_per_user INTEGER DEFAULT 1,
  cooldown_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  excluded_providers JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bonus kuralları
CREATE TABLE IF NOT EXISTS public.bonus_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_id UUID NOT NULL REFERENCES public.bonuses_new(id) ON DELETE CASCADE,
  rules JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kullanıcı bonusları (yeni tablo)
CREATE TABLE IF NOT EXISTS public.user_bonus_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES public.bonuses_new(id) ON DELETE CASCADE,
  status bonus_status_new NOT NULL DEFAULT 'eligible',
  granted_amount NUMERIC(18,2) NOT NULL,
  remaining_rollover NUMERIC(18,2) DEFAULT 0,
  progress NUMERIC(18,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  expires_at TIMESTAMPTZ,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bonus olayları
CREATE TABLE IF NOT EXISTS public.bonus_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_bonus_id UUID REFERENCES public.user_bonus_tracking(id) ON DELETE SET NULL,
  type bonus_event_type NOT NULL,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk bayrakları
CREATE TABLE IF NOT EXISTS public.bonus_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  reasons JSONB DEFAULT '{}',
  status TEXT DEFAULT 'none' CHECK (status IN ('none', 'review', 'limited', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logları
CREATE TABLE IF NOT EXISTS public.bonus_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT,
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  meta JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_bonus_wallets_user_type ON public.bonus_wallets(user_id, type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_bonus_tracking_user_status ON public.user_bonus_tracking(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bonus_events_user_occurred ON public.bonus_events(user_id, occurred_at DESC);

-- Tetikleyiciler
CREATE OR REPLACE FUNCTION update_bonus_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'credit' THEN
    UPDATE public.bonus_wallets 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
  ELSE
    UPDATE public.bonus_wallets 
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER bonus_wallet_balance_update
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_bonus_wallet_balance();

-- RLS enable
ALTER TABLE public.bonus_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonus_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_audit_logs ENABLE ROW LEVEL SECURITY;