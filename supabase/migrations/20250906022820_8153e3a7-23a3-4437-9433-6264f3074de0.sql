-- Comprehensive database schema for sports betting and casino platform

-- User profiles table (references auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    country VARCHAR(2), -- ISO country code
    currency VARCHAR(3) DEFAULT 'TRY', -- ISO currency code
    balance DECIMAL(15,2) DEFAULT 0.00,
    bonus_balance DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions for tracking login/logout
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    logout_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Financial transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'bet', 'win', 'bonus', 'refund', 'commission')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    payment_provider VARCHAR(100),
    external_transaction_id VARCHAR(255),
    description TEXT,
    reference_id UUID, -- Can reference betslip, game_round, bonus etc.
    reference_type VARCHAR(50), -- 'betslip', 'game_round', 'bonus', etc.
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports categories
CREATE TABLE public.sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports leagues/competitions
CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    country VARCHAR(2), -- ISO country code
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sports matches/events
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
    home_team VARCHAR(200) NOT NULL,
    away_team VARCHAR(200) NOT NULL,
    home_team_logo TEXT,
    away_team_logo TEXT,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'cancelled', 'postponed')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    external_match_id VARCHAR(255),
    provider VARCHAR(100),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Betting odds for matches
CREATE TABLE public.odds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    market_type VARCHAR(50) NOT NULL, -- '1x2', 'over_under', 'handicap', etc.
    market_name VARCHAR(200) NOT NULL,
    selection VARCHAR(100) NOT NULL, -- 'home', 'draw', 'away', 'over', 'under', etc.
    odds_value DECIMAL(8,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Betting slips/coupons
CREATE TABLE public.betslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    slip_type VARCHAR(20) DEFAULT 'single' CHECK (slip_type IN ('single', 'multiple', 'system')),
    total_stake DECIMAL(15,2) NOT NULL,
    total_odds DECIMAL(8,2) NOT NULL,
    potential_win DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled', 'cashout')),
    settled_at TIMESTAMP WITH TIME ZONE,
    win_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual bets within a betslip
CREATE TABLE public.betslip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    betslip_id UUID REFERENCES public.betslips(id) ON DELETE CASCADE NOT NULL,
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    odds_id UUID REFERENCES public.odds(id) ON DELETE CASCADE NOT NULL,
    market_type VARCHAR(50) NOT NULL,
    market_name VARCHAR(200) NOT NULL,
    selection VARCHAR(100) NOT NULL,
    odds_value DECIMAL(8,2) NOT NULL,
    stake DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game providers (for casino and slots)
CREATE TABLE public.game_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games (casino, slots, etc.)
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.game_providers(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    game_type VARCHAR(50) NOT NULL CHECK (game_type IN ('slot', 'live_casino', 'table_game', 'lottery', 'virtual_sport')),
    category VARCHAR(100), -- 'blackjack', 'roulette', 'poker', 'fruit_slots', etc.
    thumbnail_url TEXT,
    description TEXT,
    min_bet DECIMAL(10,2) DEFAULT 0.01,
    max_bet DECIMAL(15,2) DEFAULT 10000.00,
    rtp_percentage DECIMAL(5,2), -- Return to Player percentage
    volatility VARCHAR(20) CHECK (volatility IN ('low', 'medium', 'high')),
    has_demo BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    external_game_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User game sessions
CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    balance_start DECIMAL(15,2) NOT NULL,
    balance_end DECIMAL(15,2),
    total_bet DECIMAL(15,2) DEFAULT 0.00,
    total_win DECIMAL(15,2) DEFAULT 0.00,
    rounds_played INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Individual game rounds/spins
CREATE TABLE public.game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    bet_amount DECIMAL(15,2) NOT NULL,
    win_amount DECIMAL(15,2) DEFAULT 0.00,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    game_result JSONB, -- Store game-specific result data
    external_round_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bonus campaigns
CREATE TABLE public.bonus_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    bonus_type VARCHAR(50) NOT NULL CHECK (bonus_type IN ('welcome', 'deposit', 'free_spin', 'cashback', 'loyalty', 'tournament')),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('registration', 'deposit', 'manual', 'promotion_code')),
    amount_type VARCHAR(20) NOT NULL CHECK (amount_type IN ('fixed', 'percentage')),
    amount_value DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2),
    min_deposit DECIMAL(15,2),
    wagering_requirement INTEGER DEFAULT 0, -- Multiplier for bonus amount
    valid_days INTEGER DEFAULT 30,
    max_uses_per_user INTEGER DEFAULT 1,
    total_max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    promotion_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User bonuses
CREATE TABLE public.user_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.bonus_campaigns(id) ON DELETE CASCADE NOT NULL,
    bonus_amount DECIMAL(15,2) NOT NULL,
    wagering_requirement DECIMAL(15,2) DEFAULT 0.00,
    wagering_completed DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_leagues_sport_id ON public.leagues(sport_id);
CREATE INDEX idx_matches_league_id ON public.matches(league_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_odds_match_id ON public.odds(match_id);
CREATE INDEX idx_betslips_user_id ON public.betslips(user_id);
CREATE INDEX idx_betslip_items_betslip_id ON public.betslip_items(betslip_id);
CREATE INDEX idx_games_provider_id ON public.games(provider_id);
CREATE INDEX idx_games_type ON public.games(game_type);
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_rounds_session_id ON public.game_rounds(session_id);
CREATE INDEX idx_user_bonuses_user_id ON public.user_bonuses(user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON public.sports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leagues_updated_at BEFORE UPDATE ON public.leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_odds_updated_at BEFORE UPDATE ON public.odds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_betslips_updated_at BEFORE UPDATE ON public.betslips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_betslip_items_updated_at BEFORE UPDATE ON public.betslip_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_providers_updated_at BEFORE UPDATE ON public.game_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON public.game_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_game_rounds_updated_at BEFORE UPDATE ON public.game_rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bonus_campaigns_updated_at BEFORE UPDATE ON public.bonus_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_bonuses_updated_at BEFORE UPDATE ON public.user_bonuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betslip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Create RLS policies for user_sessions table
CREATE POLICY "Users can view their own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can insert their own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for transactions table
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can insert their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for public data (readable by everyone)
CREATE POLICY "Sports are viewable by everyone" ON public.sports FOR SELECT USING (true);
CREATE POLICY "Leagues are viewable by everyone" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Odds are viewable by everyone" ON public.odds FOR SELECT USING (true);
CREATE POLICY "Game providers are viewable by everyone" ON public.game_providers FOR SELECT USING (true);
CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Bonus campaigns are viewable by everyone" ON public.bonus_campaigns FOR SELECT USING (true);

-- Create RLS policies for betslips
CREATE POLICY "Users can view their own betslips" ON public.betslips FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own betslips" ON public.betslips FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own betslips" ON public.betslips FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for betslip_items
CREATE POLICY "Users can view their own betslip items" ON public.betslip_items FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users u JOIN public.betslips b ON u.id = b.user_id WHERE b.id = betslip_id));
CREATE POLICY "Users can create their own betslip items" ON public.betslip_items FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users u JOIN public.betslips b ON u.id = b.user_id WHERE b.id = betslip_id));

-- Create RLS policies for game sessions
CREATE POLICY "Users can view their own game sessions" ON public.game_sessions FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own game sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can update their own game sessions" ON public.game_sessions FOR UPDATE USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for game rounds
CREATE POLICY "Users can view their own game rounds" ON public.game_rounds FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own game rounds" ON public.game_rounds FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Create RLS policies for user bonuses
CREATE POLICY "Users can view their own bonuses" ON public.user_bonuses FOR SELECT USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));
CREATE POLICY "Users can create their own bonuses" ON public.user_bonuses FOR INSERT WITH CHECK (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));