-- Insert default data and create missing functions
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
  ('sports_betting', 'en', 'Sports Betting', 'common'),
  ('analytics', 'tr', 'Analitik', 'common'),
  ('analytics', 'en', 'Analytics', 'common'),
  ('dashboard', 'tr', 'Dashboard', 'common'),
  ('dashboard', 'en', 'Dashboard', 'common')
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

  -- Average session duration in minutes
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
  active_sessions BIGINT
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