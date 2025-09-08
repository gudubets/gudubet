-- Create slot games table
CREATE TABLE public.slot_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  provider VARCHAR(255) NOT NULL,
  rtp DECIMAL(5,2) NOT NULL DEFAULT 96.00,
  min_bet DECIMAL(10,2) NOT NULL DEFAULT 0.10,
  max_bet DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  reels INTEGER NOT NULL DEFAULT 5,
  rows INTEGER NOT NULL DEFAULT 3,
  paylines INTEGER NOT NULL DEFAULT 20,
  symbols JSONB NOT NULL,
  paytable JSONB NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slot game sessions table
CREATE TABLE public.slot_game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  slot_game_id UUID NOT NULL REFERENCES public.slot_games(id),
  total_spins INTEGER NOT NULL DEFAULT 0,
  total_bet DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_win DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slot game spins table
CREATE TABLE public.slot_game_spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.slot_game_sessions(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  slot_game_id UUID NOT NULL REFERENCES public.slot_games(id),
  bet_amount DECIMAL(10,2) NOT NULL,
  win_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  result JSONB NOT NULL,
  winning_lines JSONB,
  multiplier DECIMAL(8,2) DEFAULT 1.00,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  spin_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slot_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_game_spins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slot_games (public read)
CREATE POLICY "Slot games are viewable by everyone" 
ON public.slot_games 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for slot_game_sessions
CREATE POLICY "Users can view their own slot sessions" 
ON public.slot_game_sessions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own slot sessions" 
ON public.slot_game_sessions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own slot sessions" 
ON public.slot_game_sessions 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS Policies for slot_game_spins
CREATE POLICY "Users can view their own slot spins" 
ON public.slot_game_spins 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own slot spins" 
ON public.slot_game_spins 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admin policies for all tables
CREATE POLICY "Admins can manage slot games" 
ON public.slot_games 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can view all slot sessions" 
ON public.slot_game_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can view all slot spins" 
ON public.slot_game_spins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid()
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_slot_games_updated_at
BEFORE UPDATE ON public.slot_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_slot_game_sessions_updated_at
BEFORE UPDATE ON public.slot_game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_slot_games_active ON public.slot_games(is_active);
CREATE INDEX idx_slot_game_sessions_user ON public.slot_game_sessions(user_id);
CREATE INDEX idx_slot_game_sessions_active ON public.slot_game_sessions(is_active);
CREATE INDEX idx_slot_game_spins_session ON public.slot_game_spins(session_id);
CREATE INDEX idx_slot_game_spins_user ON public.slot_game_spins(user_id);
CREATE INDEX idx_slot_game_spins_timestamp ON public.slot_game_spins(spin_timestamp);

-- Insert sample slot games
INSERT INTO public.slot_games (name, slug, provider, rtp, min_bet, max_bet, reels, rows, paylines, symbols, paytable, thumbnail_url) VALUES 
(
  'Treasure Quest',
  'treasure-quest',
  'Dream Games',
  96.50,
  0.20,
  200.00,
  5,
  3,
  20,
  '["cherry", "lemon", "orange", "plum", "bell", "bar", "seven", "wild", "scatter"]'::jsonb,
  '{
    "cherry": {"3": 5, "4": 15, "5": 50},
    "lemon": {"3": 5, "4": 15, "5": 50},
    "orange": {"3": 10, "4": 25, "5": 75},
    "plum": {"3": 10, "4": 25, "5": 75},
    "bell": {"3": 20, "4": 50, "5": 150},
    "bar": {"3": 50, "4": 100, "5": 300},
    "seven": {"3": 100, "4": 500, "5": 1000},
    "wild": {"substitute": true, "multiplier": 2},
    "scatter": {"3": 10, "4": 25, "5": 100, "bonus": true}
  }'::jsonb,
  '/src/assets/treasure.png'
),
(
  'Lucky Fruits',
  'lucky-fruits',
  'Dream Games',
  95.80,
  0.10,
  100.00,
  5,
  3,
  15,
  '["cherry", "lemon", "orange", "watermelon", "grape", "bell", "seven", "wild"]'::jsonb,
  '{
    "cherry": {"3": 3, "4": 10, "5": 30},
    "lemon": {"3": 3, "4": 10, "5": 30},
    "orange": {"3": 5, "4": 15, "5": 45},
    "watermelon": {"3": 8, "4": 20, "5": 60},
    "grape": {"3": 10, "4": 30, "5": 90},
    "bell": {"3": 15, "4": 50, "5": 150},
    "seven": {"3": 50, "4": 200, "5": 500},
    "wild": {"substitute": true, "multiplier": 1}
  }'::jsonb,
  'https://images.unsplash.com/photo-1577003833619-76bbd130e95a?w=300&h=200&fit=crop'
);