-- Analytics and Reporting Tables
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  event_name VARCHAR NOT NULL,
  event_category VARCHAR NOT NULL,
  event_properties JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  country_code TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Segments for CRM
CREATE TABLE IF NOT EXISTS public.user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- Segment criteria
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User-Segment Mapping
CREATE TABLE IF NOT EXISTS public.user_segment_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES public.user_segments(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, segment_id)
);

-- CRM Campaigns
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  campaign_type VARCHAR NOT NULL, -- 'email', 'push', 'sms', 'in_app'
  target_segments UUID[] DEFAULT '{}', -- Array of segment IDs
  trigger_type VARCHAR NOT NULL, -- 'manual', 'scheduled', 'event_based'
  trigger_conditions JSONB DEFAULT '{}',
  content JSONB NOT NULL, -- Email/push content
  scheduled_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign Deliveries
CREATE TABLE IF NOT EXISTS public.campaign_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.crm_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  delivery_status VARCHAR DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'opened', 'clicked'
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily Aggregated Metrics
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  dau INTEGER DEFAULT 0, -- Daily Active Users
  new_registrations INTEGER DEFAULT 0,
  total_deposits NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  ggr NUMERIC DEFAULT 0, -- Gross Gaming Revenue
  ngr NUMERIC DEFAULT 0, -- Net Gaming Revenue
  total_bets NUMERIC DEFAULT 0,
  total_wins NUMERIC DEFAULT 0,
  game_sessions INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);

-- User Lifetime Value tracking
CREATE TABLE IF NOT EXISTS public.user_ltv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_deposits NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  net_deposits NUMERIC DEFAULT 0, -- deposits - withdrawals
  total_bets NUMERIC DEFAULT 0,
  total_wins NUMERIC DEFAULT 0,
  ggr NUMERIC DEFAULT 0, -- User's contribution to GGR
  first_deposit_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  days_since_last_activity INTEGER DEFAULT 0,
  is_dormant BOOLEAN DEFAULT false,
  vip_level VARCHAR DEFAULT 'bronze',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SEO Meta Tags
CREATE TABLE IF NOT EXISTS public.seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR UNIQUE NOT NULL,
  language_code VARCHAR DEFAULT 'tr',
  title VARCHAR NOT NULL,
  description TEXT,
  keywords TEXT,
  og_title VARCHAR,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  robots VARCHAR DEFAULT 'index,follow',
  schema_markup JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Internationalization (i18n)
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL,
  language_code VARCHAR NOT NULL,
  value TEXT NOT NULL,
  namespace VARCHAR DEFAULT 'common',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key, language_code, namespace)
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_segment_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ltv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
CREATE POLICY "System can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- User Segments Policies
CREATE POLICY "Admins can manage user segments" ON public.user_segments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can manage segment memberships" ON public.user_segment_memberships
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- CRM Policies
CREATE POLICY "Admins can manage CRM campaigns" ON public.crm_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admins can view campaign deliveries" ON public.campaign_deliveries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "System can manage campaign deliveries" ON public.campaign_deliveries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update delivery status" ON public.campaign_deliveries
  FOR UPDATE USING (true);

-- Metrics Policies
CREATE POLICY "Admins can view daily metrics" ON public.daily_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "System can manage daily metrics" ON public.daily_metrics
  FOR ALL USING (true);

CREATE POLICY "Admins can view user LTV" ON public.user_ltv
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

CREATE POLICY "System can manage user LTV" ON public.user_ltv
  FOR ALL USING (true);

-- SEO Policies
CREATE POLICY "SEO pages are viewable by everyone" ON public.seo_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage SEO pages" ON public.seo_pages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Translations Policies
CREATE POLICY "Translations are viewable by everyone" ON public.translations
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage translations" ON public.translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true)
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_segment_memberships_user_id ON public.user_segment_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_memberships_segment_id ON public.user_segment_memberships(segment_id);
CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_campaign_id ON public.campaign_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_user_id ON public.campaign_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_user_ltv_user_id ON public.user_ltv(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON public.seo_pages(page_slug);
CREATE INDEX IF NOT EXISTS idx_translations_key_lang ON public.translations(key, language_code);

-- Insert default user segments
INSERT INTO public.user_segments (name, slug, description, conditions) VALUES
  ('VIP Players', 'vip', 'High-value players with significant deposits', '{"min_total_deposits": 10000, "min_days_active": 30}'),
  ('New Players', 'new', 'Players registered within last 7 days', '{"max_days_since_registration": 7}'),
  ('Dormant Players', 'dormant', 'Players inactive for 30+ days', '{"min_days_inactive": 30}'),
  ('High Rollers', 'high_rollers', 'Players with high bet amounts', '{"min_avg_bet": 100}'),
  ('Bonus Hunters', 'bonus_hunters', 'Players who frequently claim bonuses', '{"min_bonuses_claimed": 5}')
ON CONFLICT (slug) DO NOTHING;

-- Insert basic translations
INSERT INTO public.translations (key, language_code, value, namespace) VALUES
  ('welcome', 'tr', 'Hoş Geldiniz', 'common'),
  ('welcome', 'en', 'Welcome', 'common'),
  ('login', 'tr', 'Giriş Yap', 'common'),
  ('login', 'en', 'Login', 'common'),
  ('register', 'tr', 'Kayıt Ol', 'common'),
  ('register', 'en', 'Register', 'common'),
  ('casino', 'tr', 'Casino', 'common'),
  ('casino', 'en', 'Casino', 'common'),
  ('sports_betting', 'tr', 'Spor Bahisleri', 'common'),
  ('sports_betting', 'en', 'Sports Betting', 'common')
ON CONFLICT (key, language_code, namespace) DO NOTHING;

-- Insert basic SEO pages
INSERT INTO public.seo_pages (page_slug, language_code, title, description, keywords) VALUES
  ('home', 'tr', 'Türkiye''nin En İyi Online Casino ve Bahis Sitesi', 'Güvenli ve eğlenceli casino oyunları, spor bahisleri ve canlı casino deneyimi. Hemen üye ol, bonusunu kazan!', 'online casino, spor bahisleri, slot oyunları, canlı casino'),
  ('home', 'en', 'Turkey''s Best Online Casino and Betting Site', 'Safe and fun casino games, sports betting and live casino experience. Join now and get your bonus!', 'online casino, sports betting, slot games, live casino'),
  ('casino', 'tr', 'Online Casino Oyunları - Slot, Rulet, Blackjack', 'Yüzlerce slot oyunu, canlı krupiyerli masa oyunları ve jackpot fırsatları. Güvenli ödeme yöntemleri ile hemen oyna!', 'casino oyunları, slot, rulet, blackjack, jackpot'),
  ('casino', 'en', 'Online Casino Games - Slots, Roulette, Blackjack', 'Hundreds of slot games, live dealer table games and jackpot opportunities. Play now with secure payment methods!', 'casino games, slots, roulette, blackjack, jackpot')
ON CONFLICT (page_slug, language_code) DO NOTHING;

-- Functions for analytics and metrics calculation
CREATE OR REPLACE FUNCTION public.calculate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dau INTEGER;
  _new_registrations INTEGER;
  _total_deposits NUMERIC;
  _total_withdrawals NUMERIC;
  _total_bets NUMERIC;
  _total_wins NUMERIC;
  _game_sessions INTEGER;
  _avg_session_duration NUMERIC;
  _ggr NUMERIC;
  _ngr NUMERIC;
BEGIN
  -- Calculate DAU (users who had any activity)
  SELECT COUNT(DISTINCT user_id) INTO _dau
  FROM (
    SELECT user_id FROM public.analytics_events 
    WHERE DATE(created_at) = target_date AND user_id IS NOT NULL
    UNION
    SELECT user_id FROM public.payments 
    WHERE DATE(created_at) = target_date
    UNION
    SELECT user_id FROM public.game_sessions 
    WHERE DATE(created_at) = target_date
  ) active_users;

  -- New registrations
  SELECT COUNT(*) INTO _new_registrations
  FROM public.users
  WHERE DATE(created_at) = target_date;

  -- Financial metrics
  SELECT COALESCE(SUM(amount), 0) INTO _total_deposits
  FROM public.payments
  WHERE DATE(created_at) = target_date 
    AND status = 'completed'
    AND payment_method != 'withdrawal';

  SELECT COALESCE(SUM(amount), 0) INTO _total_withdrawals
  FROM public.withdrawals
  WHERE DATE(created_at) = target_date 
    AND status = 'approved';

  -- Gaming metrics
  SELECT 
    COALESCE(SUM(total_bet), 0),
    COALESCE(SUM(total_win), 0),
    COUNT(*)
  INTO _total_bets, _total_wins, _game_sessions
  FROM public.game_sessions
  WHERE DATE(created_at) = target_date;

  -- Average session duration
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (ended_at - started_at))), 0) / 60 INTO _avg_session_duration
  FROM public.game_sessions
  WHERE DATE(created_at) = target_date AND ended_at IS NOT NULL;

  -- GGR and NGR calculation
  _ggr := _total_bets - _total_wins;
  _ngr := _ggr - (_total_withdrawals * 0.1); -- Assuming 10% operational cost

  -- Insert or update daily metrics
  INSERT INTO public.daily_metrics (
    metric_date, dau, new_registrations, total_deposits, total_withdrawals,
    ggr, ngr, total_bets, total_wins, game_sessions, avg_session_duration
  ) VALUES (
    target_date, _dau, _new_registrations, _total_deposits, _total_withdrawals,
    _ggr, _ngr, _total_bets, _total_wins, _game_sessions, _avg_session_duration
  ) ON CONFLICT (metric_date) DO UPDATE SET
    dau = EXCLUDED.dau,
    new_registrations = EXCLUDED.new_registrations,
    total_deposits = EXCLUDED.total_deposits,
    total_withdrawals = EXCLUDED.total_withdrawals,
    ggr = EXCLUDED.ggr,
    ngr = EXCLUDED.ngr,
    total_bets = EXCLUDED.total_bets,
    total_wins = EXCLUDED.total_wins,
    game_sessions = EXCLUDED.game_sessions,
    avg_session_duration = EXCLUDED.avg_session_duration;
END;
$$;

-- Function to update user LTV
CREATE OR REPLACE FUNCTION public.update_user_ltv(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total_deposits NUMERIC;
  _total_withdrawals NUMERIC;
  _total_bets NUMERIC;
  _total_wins NUMERIC;
  _first_deposit_at TIMESTAMPTZ;
  _last_activity_at TIMESTAMPTZ;
  _days_inactive INTEGER;
  _vip_level VARCHAR;
BEGIN
  -- Calculate deposits
  SELECT COALESCE(SUM(amount), 0) INTO _total_deposits
  FROM public.payments
  WHERE user_id = target_user_id 
    AND status = 'completed'
    AND payment_method != 'withdrawal';

  -- Calculate withdrawals
  SELECT COALESCE(SUM(amount), 0) INTO _total_withdrawals
  FROM public.withdrawals
  WHERE user_id = target_user_id AND status = 'approved';

  -- Calculate gaming activity
  SELECT 
    COALESCE(SUM(total_bet), 0),
    COALESCE(SUM(total_win), 0)
  INTO _total_bets, _total_wins
  FROM public.game_sessions
  WHERE user_id = target_user_id;

  -- First deposit date
  SELECT MIN(created_at) INTO _first_deposit_at
  FROM public.payments
  WHERE user_id = target_user_id 
    AND status = 'completed'
    AND payment_method != 'withdrawal';

  -- Last activity
  SELECT MAX(activity_date) INTO _last_activity_at
  FROM (
    SELECT MAX(created_at) as activity_date FROM public.payments WHERE user_id = target_user_id
    UNION ALL
    SELECT MAX(created_at) as activity_date FROM public.game_sessions WHERE user_id = target_user_id
    UNION ALL
    SELECT MAX(created_at) as activity_date FROM public.analytics_events WHERE user_id = target_user_id
  ) activities;

  -- Days since last activity
  _days_inactive := COALESCE(EXTRACT(DAY FROM now() - _last_activity_at), 0);

  -- Determine VIP level based on deposits
  IF _total_deposits >= 50000 THEN
    _vip_level := 'diamond';
  ELSIF _total_deposits >= 20000 THEN
    _vip_level := 'platinum';
  ELSIF _total_deposits >= 5000 THEN
    _vip_level := 'gold';
  ELSIF _total_deposits >= 1000 THEN
    _vip_level := 'silver';
  ELSE
    _vip_level := 'bronze';
  END IF;

  -- Insert or update user LTV
  INSERT INTO public.user_ltv (
    user_id, total_deposits, total_withdrawals, net_deposits,
    total_bets, total_wins, ggr, first_deposit_at, last_activity_at,
    days_since_last_activity, is_dormant, vip_level
  ) VALUES (
    target_user_id, _total_deposits, _total_withdrawals, _total_deposits - _total_withdrawals,
    _total_bets, _total_wins, _total_bets - _total_wins, _first_deposit_at, _last_activity_at,
    _days_inactive, _days_inactive > 30, _vip_level
  ) ON CONFLICT (user_id) DO UPDATE SET
    total_deposits = EXCLUDED.total_deposits,
    total_withdrawals = EXCLUDED.total_withdrawals,
    net_deposits = EXCLUDED.net_deposits,
    total_bets = EXCLUDED.total_bets,
    total_wins = EXCLUDED.total_wins,
    ggr = EXCLUDED.ggr,
    first_deposit_at = EXCLUDED.first_deposit_at,
    last_activity_at = EXCLUDED.last_activity_at,
    days_since_last_activity = EXCLUDED.days_since_last_activity,
    is_dormant = EXCLUDED.is_dormant,
    vip_level = EXCLUDED.vip_level,
    updated_at = now();
END;
$$;

-- Function to get dashboard KPIs
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  total_users BIGINT,
  active_users_30d BIGINT,
  total_deposits_30d NUMERIC,
  total_withdrawals_30d NUMERIC,
  ggr_30d NUMERIC,
  ngr_30d NUMERIC,
  avg_deposit_amount NUMERIC,
  new_users_today BIGINT,
  active_sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events 
     WHERE created_at >= now() - INTERVAL '30 days') as active_users_30d,
    (SELECT COALESCE(SUM(dm.total_deposits), 0) FROM public.daily_metrics dm
     WHERE dm.metric_date >= CURRENT_DATE - days_back) as total_deposits_30d,
    (SELECT COALESCE(SUM(dm.total_withdrawals), 0) FROM public.daily_metrics dm
     WHERE dm.metric_date >= CURRENT_DATE - days_back) as total_withdrawals_30d,
    (SELECT COALESCE(SUM(dm.ggr), 0) FROM public.daily_metrics dm
     WHERE dm.metric_date >= CURRENT_DATE - days_back) as ggr_30d,
    (SELECT COALESCE(SUM(dm.ngr), 0) FROM public.daily_metrics dm
     WHERE dm.metric_date >= CURRENT_DATE - days_back) as ngr_30d,
    (SELECT COALESCE(AVG(amount), 0) FROM public.payments 
     WHERE status = 'completed' AND payment_method != 'withdrawal'
     AND created_at >= now() - INTERVAL '30 days') as avg_deposit_amount,
    (SELECT COUNT(*) FROM public.users 
     WHERE DATE(created_at) = CURRENT_DATE) as new_users_today,
    (SELECT COUNT(*) FROM public.game_sessions 
     WHERE status = 'active') as active_sessions;
END;
$$;

-- Triggers for automatic updates
CREATE OR REPLACE FUNCTION public.trigger_user_ltv_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update LTV when payments or game sessions change
  IF TG_TABLE_NAME = 'payments' THEN
    PERFORM public.update_user_ltv(NEW.user_id);
  ELSIF TG_TABLE_NAME = 'game_sessions' THEN
    PERFORM public.update_user_ltv(NEW.user_id);
  ELSIF TG_TABLE_NAME = 'withdrawals' THEN
    PERFORM public.update_user_ltv(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_ltv_on_payment ON public.payments;
CREATE TRIGGER trigger_ltv_on_payment
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.trigger_user_ltv_update();

DROP TRIGGER IF EXISTS trigger_ltv_on_game_session ON public.game_sessions;
CREATE TRIGGER trigger_ltv_on_game_session
  AFTER INSERT OR UPDATE ON public.game_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trigger_user_ltv_update();

DROP TRIGGER IF EXISTS trigger_ltv_on_withdrawal ON public.withdrawals;
CREATE TRIGGER trigger_ltv_on_withdrawal
  AFTER INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.trigger_user_ltv_update();

-- Updated timestamp triggers
CREATE TRIGGER update_user_segments_updated_at
  BEFORE UPDATE ON public.user_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_campaigns_updated_at
  BEFORE UPDATE ON public.crm_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON public.translations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();