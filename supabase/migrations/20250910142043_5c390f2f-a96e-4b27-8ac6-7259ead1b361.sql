-- =========================
-- FIX SECURITY ISSUES
-- =========================

-- Fix RLS for missing tables
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Enable RLS for all public tables that don't have it
    FOR rec IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t 
            WHERE schemaname = 'public' 
            AND rowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.tablename);
    END LOOP;
END
$$;

-- =========================
-- ADD MISSING RLS POLICIES FOR TABLES WITHOUT POLICIES
-- =========================

-- casino_categories policies
DROP POLICY IF EXISTS "Casino categories viewable by all" ON public.casino_categories;
CREATE POLICY "Casino categories viewable by all" ON public.casino_categories
FOR SELECT USING (true);

-- casino_games policies
DROP POLICY IF EXISTS "Casino games viewable by all" ON public.casino_games;
CREATE POLICY "Casino games viewable by all" ON public.casino_games
FOR SELECT USING (true);

-- game_providers policies  
DROP POLICY IF EXISTS "Game providers viewable by all" ON public.game_providers;
CREATE POLICY "Game providers viewable by all" ON public.game_providers
FOR SELECT USING (true);

-- games policies
DROP POLICY IF EXISTS "Games viewable by all" ON public.games;
CREATE POLICY "Games viewable by all" ON public.games
FOR SELECT USING (true);

-- =========================
-- FIX FUNCTION SEARCH PATHS
-- =========================

-- Update existing functions to include SET search_path
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = check_user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.fn_update_wallet_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Update other existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_bonus_wallet_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- =========================
-- ADDITIONAL SECURITY POLICIES FOR COMPREHENSIVE COVERAGE
-- =========================

-- Add system policies for service role operations
CREATE POLICY "Service role can manage all data" ON public.wallets
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all payments" ON public.payments  
FOR ALL USING (auth.role() = 'service_role');

-- Add insert policies where needed
CREATE POLICY "Users can create wallets" ON public.wallets
FOR INSERT WITH CHECK (user_id = auth.uid());

-- =========================
-- PROFILE MANAGEMENT TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, country_code)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'country_code')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();