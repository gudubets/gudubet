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
  conditions JSONB NOT NULL,
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
  campaign_type VARCHAR NOT NULL,
  target_segments UUID[] DEFAULT '{}',
  trigger_type VARCHAR NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  content JSONB NOT NULL,
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
  delivery_status VARCHAR DEFAULT 'pending',
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
  metric_date DATE NOT NULL UNIQUE,
  dau INTEGER DEFAULT 0,
  new_registrations INTEGER DEFAULT 0,
  total_deposits NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  ggr NUMERIC DEFAULT 0,
  ngr NUMERIC DEFAULT 0,
  total_bets NUMERIC DEFAULT 0,
  total_wins NUMERIC DEFAULT 0,
  game_sessions INTEGER DEFAULT 0,
  avg_session_duration NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Lifetime Value tracking
CREATE TABLE IF NOT EXISTS public.user_ltv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  total_deposits NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  net_deposits NUMERIC DEFAULT 0,
  total_bets NUMERIC DEFAULT 0,
  total_wins NUMERIC DEFAULT 0,
  ggr NUMERIC DEFAULT 0,
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
  page_slug VARCHAR NOT NULL,
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_slug, language_code)
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

-- Policies
CREATE POLICY "System can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all analytics events" ON public.analytics_events FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can manage user segments" ON public.user_segments FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));
CREATE POLICY "Admins can manage segment memberships" ON public.user_segment_memberships FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can manage CRM campaigns" ON public.crm_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));
CREATE POLICY "Admins can view campaign deliveries" ON public.campaign_deliveries FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));
CREATE POLICY "System can manage campaign deliveries" ON public.campaign_deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update delivery status" ON public.campaign_deliveries FOR UPDATE USING (true);

CREATE POLICY "Admins can view daily metrics" ON public.daily_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));
CREATE POLICY "System can manage daily metrics" ON public.daily_metrics FOR ALL USING (true);

CREATE POLICY "Admins can view user LTV" ON public.user_ltv FOR SELECT USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));
CREATE POLICY "System can manage user LTV" ON public.user_ltv FOR ALL USING (true);

CREATE POLICY "SEO pages are viewable by everyone" ON public.seo_pages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage SEO pages" ON public.seo_pages FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));

CREATE POLICY "Translations are viewable by everyone" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins can manage translations" ON public.translations FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND is_active = true));

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_segment_memberships_user_id ON public.user_segment_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_deliveries_campaign_id ON public.campaign_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_translations_key_lang ON public.translations(key, language_code);