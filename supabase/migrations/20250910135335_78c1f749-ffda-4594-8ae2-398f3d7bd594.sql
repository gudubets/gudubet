-- RLS Politikaları için bonus sistemi

-- Bonus Wallets RLS Policies
CREATE POLICY "users_view_own_bonus_wallets" ON public.bonus_wallets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = bonus_wallets.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_bonus_wallets" ON public.bonus_wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Wallet Transactions RLS Policies
CREATE POLICY "users_view_own_wallet_transactions" ON public.wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bonus_wallets bw
      JOIN public.users u ON u.id = bw.user_id
      WHERE bw.id = wallet_transactions.wallet_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_wallet_transactions" ON public.wallet_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Bonuses New RLS Policies
CREATE POLICY "bonuses_viewable_by_all" ON public.bonuses_new
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_bonuses" ON public.bonuses_new
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Bonus Rules RLS Policies  
CREATE POLICY "bonus_rules_viewable_by_all" ON public.bonus_rules
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_bonus_rules" ON public.bonus_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- User Bonus Tracking RLS Policies
CREATE POLICY "users_view_own_bonus_tracking" ON public.user_bonus_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = user_bonus_tracking.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_bonus_tracking" ON public.user_bonus_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Bonus Events RLS Policies
CREATE POLICY "users_view_own_bonus_events" ON public.bonus_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = bonus_events.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_bonus_events" ON public.bonus_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Bonus Risk Flags RLS Policies (sadece admin)
CREATE POLICY "admin_manage_bonus_risk_flags" ON public.bonus_risk_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Bonus Audit Logs RLS Policies (sadece admin)
CREATE POLICY "admin_view_bonus_audit_logs" ON public.bonus_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.auth_user_id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Function search_path güvenliği için düzeltme
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;