-- Bonus & Kampanya Yönetimi Şeması

-- Enum türleri
CREATE TYPE bonus_type AS ENUM ('FIRST_DEPOSIT', 'RELOAD', 'CASHBACK', 'FREEBET');
CREATE TYPE bonus_status AS ENUM ('eligible', 'active', 'completed', 'forfeited', 'expired');
CREATE TYPE wallet_type AS ENUM ('main', 'bonus');
CREATE TYPE transaction_direction AS ENUM ('debit', 'credit');
CREATE TYPE bonus_event_type AS ENUM ('deposit_made', 'wager_placed', 'wager_voided', 'bonus_granted', 'bonus_progressed', 'bonus_completed', 'bonus_forfeited', 'bonus_expired', 'manual_review_triggered');
CREATE TYPE risk_status AS ENUM ('none', 'review', 'limited', 'blocked');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE withdrawal_status_bonus AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- Wallets tablosu (ana ve bonus cüzdanları)
CREATE TABLE public.wallets (
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
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  direction transaction_direction NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  ledger_key TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bonus şablonları
CREATE TABLE public.bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  type bonus_type NOT NULL,
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

-- Bonus kuralları (kategori ağırlıkları vs.)
CREATE TABLE public.bonus_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_id UUID NOT NULL REFERENCES public.bonuses(id) ON DELETE CASCADE,
  rules JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kullanıcı bonusları
CREATE TABLE public.user_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES public.bonuses(id) ON DELETE CASCADE,
  status bonus_status NOT NULL DEFAULT 'eligible',
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
CREATE TABLE public.bonus_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_bonus_id UUID REFERENCES public.user_bonuses(id) ON DELETE SET NULL,
  type bonus_event_type NOT NULL,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Risk bayrakları
CREATE TABLE public.risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  reasons JSONB DEFAULT '{}',
  status risk_status DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logları
CREATE TABLE public.audit_logs (
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

-- Ödeme kayıtları (bonus tetikleyicisi)
CREATE TABLE IF NOT EXISTS public.bonus_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  method TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status payment_status DEFAULT 'pending',
  provider_ref TEXT,
  idempotency_key TEXT UNIQUE,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexler
CREATE INDEX idx_wallets_user_type ON public.wallets(user_id, type);
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id, occurred_at DESC);
CREATE INDEX idx_user_bonuses_user_status ON public.user_bonuses(user_id, status);
CREATE INDEX idx_bonus_events_user_occurred ON public.bonus_events(user_id, occurred_at DESC);
CREATE INDEX idx_bonus_payments_idempotency ON public.bonus_payments(idempotency_key);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id, created_at DESC);

-- Tetikleyiciler
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'credit' THEN
    UPDATE public.wallets 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
  ELSE
    UPDATE public.wallets 
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.wallet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wallet_balance_update
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Updated at tetikleyicileri
CREATE OR REPLACE FUNCTION update_updated_at_bonus()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bonuses_updated_at BEFORE UPDATE ON public.bonuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_bonus();

CREATE TRIGGER user_bonuses_updated_at BEFORE UPDATE ON public.user_bonuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_bonus();

CREATE TRIGGER bonus_payments_updated_at BEFORE UPDATE ON public.bonus_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_bonus();

-- RLS enable
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_payments ENABLE ROW LEVEL SECURITY;