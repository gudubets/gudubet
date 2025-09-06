-- Create live_matches table
CREATE TABLE public.live_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team VARCHAR NOT NULL,
  away_team VARCHAR NOT NULL,
  home_team_logo TEXT,
  away_team_logo TEXT,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  period VARCHAR, -- İlk Yarı, İkinci Yarı, Devre Arası, etc.
  match_minute INTEGER, -- Dakika
  match_time VARCHAR, -- 45:32, HT, 90+2, etc.
  sport_type VARCHAR NOT NULL DEFAULT 'futbol', -- futbol, basketbol, tenis, e-spor
  league VARCHAR,
  status VARCHAR DEFAULT 'live', -- live, halftime, finished
  viewers_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  match_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create live_odds table  
CREATE TABLE public.live_odds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.live_matches(id) ON DELETE CASCADE,
  market_type VARCHAR NOT NULL, -- 1X2, O/U, Handicap, etc.
  market_name VARCHAR NOT NULL, -- "Maç Sonucu", "2.5 Üst/Alt", etc.
  selection VARCHAR NOT NULL, -- "1", "X", "2", "Üst", "Alt", etc.
  selection_name VARCHAR NOT NULL, -- "Ev Sahibi", "Beraberlik", "Deplasman", etc.
  odds_value DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_odds ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Live matches and odds are viewable by everyone
CREATE POLICY "Live matches are viewable by everyone" 
ON public.live_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Live odds are viewable by everyone" 
ON public.live_odds 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_live_matches_sport_status ON public.live_matches(sport_type, status);
CREATE INDEX idx_live_matches_featured ON public.live_matches(is_featured, created_at);
CREATE INDEX idx_live_odds_match_id ON public.live_odds(match_id);
CREATE INDEX idx_live_odds_active ON public.live_odds(is_active, match_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_live_matches_updated_at
  BEFORE UPDATE ON public.live_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_odds_updated_at
  BEFORE UPDATE ON public.live_odds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample live matches
INSERT INTO public.live_matches (
  home_team, away_team, home_team_logo, away_team_logo, 
  home_score, away_score, period, match_minute, match_time,
  sport_type, league, status, viewers_count, is_featured
) VALUES 
(
  'Galatasaray', 'Fenerbahçe', '🇹🇷', '🇹🇷',
  1, 0, 'İlk Yarı', 34, '34:12',
  'futbol', 'Süper Lig', 'live', 125000, true
),
(
  'Real Madrid', 'Barcelona', '🇪🇸', '🇪🇸',
  2, 1, 'İkinci Yarı', 67, '67:45',
  'futbol', 'La Liga', 'live', 200000, true
),
(
  'Lakers', 'Warriors', '🏀', '🏀',
  89, 92, '4. Periyot', 8, '8:23',
  'basketbol', 'NBA', 'live', 75000, false
),
(
  'Djokovic', 'Nadal', '🎾', '🎾',
  2, 1, '3. Set', 0, '6-4, 4-6, 3-2',
  'tenis', 'French Open', 'live', 45000, false
);

-- Insert sample odds
INSERT INTO public.live_odds (match_id, market_type, market_name, selection, selection_name, odds_value) 
VALUES 
-- Galatasaray vs Fenerbahçe odds
((SELECT id FROM public.live_matches WHERE home_team = 'Galatasaray' LIMIT 1), '1X2', 'Maç Sonucu', '1', 'Galatasaray', 1.85),
((SELECT id FROM public.live_matches WHERE home_team = 'Galatasaray' LIMIT 1), '1X2', 'Maç Sonucu', 'X', 'Beraberlik', 3.40),
((SELECT id FROM public.live_matches WHERE home_team = 'Galatasaray' LIMIT 1), '1X2', 'Maç Sonucu', '2', 'Fenerbahçe', 4.20),
((SELECT id FROM public.live_matches WHERE home_team = 'Galatasaray' LIMIT 1), 'O/U', '2.5 Gol', 'Over', 'Üst 2.5', 1.65),
((SELECT id FROM public.live_matches WHERE home_team = 'Galatasaray' LIMIT 1), 'O/U', '2.5 Gol', 'Under', 'Alt 2.5', 2.20),

-- Real Madrid vs Barcelona odds  
((SELECT id FROM public.live_matches WHERE home_team = 'Real Madrid' LIMIT 1), '1X2', 'Maç Sonucu', '1', 'Real Madrid', 2.10),
((SELECT id FROM public.live_matches WHERE home_team = 'Real Madrid' LIMIT 1), '1X2', 'Maç Sonucu', 'X', 'Beraberlik', 3.20),
((SELECT id FROM public.live_matches WHERE home_team = 'Real Madrid' LIMIT 1), '1X2', 'Maç Sonucu', '2', 'Barcelona', 3.50),
((SELECT id FROM public.live_matches WHERE home_team = 'Real Madrid' LIMIT 1), 'O/U', '3.5 Gol', 'Over', 'Üst 3.5', 1.95),
((SELECT id FROM public.live_matches WHERE home_team = 'Real Madrid' LIMIT 1), 'O/U', '3.5 Gol', 'Under', 'Alt 3.5', 1.85),

-- Lakers vs Warriors odds
((SELECT id FROM public.live_matches WHERE home_team = 'Lakers' LIMIT 1), 'ML', 'Kazanan', '1', 'Lakers', 2.40),
((SELECT id FROM public.live_matches WHERE home_team = 'Lakers' LIMIT 1), 'ML', 'Kazanan', '2', 'Warriors', 1.55),
((SELECT id FROM public.live_matches WHERE home_team = 'Lakers' LIMIT 1), 'Spread', 'Handicap', '1', 'Lakers +3.5', 1.90),
((SELECT id FROM public.live_matches WHERE home_team = 'Lakers' LIMIT 1), 'Spread', 'Handicap', '2', 'Warriors -3.5', 1.90),

-- Djokovic vs Nadal odds
((SELECT id FROM public.live_matches WHERE home_team = 'Djokovic' LIMIT 1), 'ML', 'Kazanan', '1', 'Djokovic', 1.75),
((SELECT id FROM public.live_matches WHERE home_team = 'Djokovic' LIMIT 1), 'ML', 'Kazanan', '2', 'Nadal', 2.05);