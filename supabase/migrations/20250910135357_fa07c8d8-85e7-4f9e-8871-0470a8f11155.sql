-- RLS Politikaları düzeltme (users tablosu yapısına göre)

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
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
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
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Bonuses New RLS Policies
CREATE POLICY "bonuses_viewable_by_all" ON public.bonuses_new
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_bonuses" ON public.bonuses_new
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Bonus Rules RLS Policies  
CREATE POLICY "bonus_rules_viewable_by_all" ON public.bonus_rules
  FOR SELECT USING (true);

CREATE POLICY "admin_manage_bonus_rules" ON public.bonus_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
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

CREATE POLICY "users_create_own_bonus_tracking" ON public.user_bonus_tracking
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = user_bonus_tracking.user_id 
      AND users.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "admin_manage_bonus_tracking" ON public.user_bonus_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
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

CREATE POLICY "system_create_bonus_events" ON public.bonus_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admin_manage_bonus_events" ON public.bonus_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Bonus Risk Flags RLS Policies (sadece admin)
CREATE POLICY "admin_manage_bonus_risk_flags" ON public.bonus_risk_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- Bonus Audit Logs RLS Policies (sadece admin)
CREATE POLICY "admin_view_bonus_audit_logs" ON public.bonus_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admins 
      WHERE admins.id = auth.uid() 
      AND admins.is_active = true
    )
  );

CREATE POLICY "system_create_audit_logs" ON public.bonus_audit_logs
  FOR INSERT WITH CHECK (true);