-- Create bonus request types enum
CREATE TYPE bonus_request_type AS ENUM (
  'birthday',
  'welcome',
  'cashback', 
  'freebet',
  'vip_platinum',
  'deposit'
);

-- Create bonus request status enum  
CREATE TYPE bonus_request_status AS ENUM (
  'pending',
  'approved', 
  'rejected'
);

-- Create VIP levels enum
CREATE TYPE vip_level AS ENUM (
  'bronze',
  'silver', 
  'gold',
  'platinum',
  'diamond'
);

-- Create bonus requests table
CREATE TABLE public.bonus_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bonus_type bonus_request_type NOT NULL,
  status bonus_request_status NOT NULL DEFAULT 'pending',
  requested_amount NUMERIC,
  loss_amount NUMERIC, -- For cashback requests
  deposit_amount NUMERIC, -- For deposit-based bonuses
  admin_note TEXT,
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Add user VIP level to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_level vip_level DEFAULT 'bronze';

-- Create indexes
CREATE INDEX idx_bonus_requests_user_id ON public.bonus_requests(user_id);
CREATE INDEX idx_bonus_requests_status ON public.bonus_requests(status);
CREATE INDEX idx_bonus_requests_type ON public.bonus_requests(bonus_type);

-- Enable RLS
ALTER TABLE public.bonus_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bonus_requests
CREATE POLICY "Users can view their own bonus requests" 
ON public.bonus_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = bonus_requests.user_id 
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can create their own bonus requests" 
ON public.bonus_requests 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM users 
  WHERE users.id = bonus_requests.user_id 
  AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Admins can manage all bonus requests" 
ON public.bonus_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.id = auth.uid() 
  AND admins.is_active = true
));

-- Update trigger for bonus_requests
CREATE TRIGGER update_bonus_requests_updated_at
  BEFORE UPDATE ON public.bonus_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check birthday bonus eligibility
CREATE OR REPLACE FUNCTION public.can_request_birthday_bonus(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_birth_date DATE;
  last_birthday_request DATE;
BEGIN
  -- Get user birth date
  SELECT birth_date INTO user_birth_date
  FROM profiles 
  WHERE id = p_user_id;
  
  IF user_birth_date IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if today is user's birthday
  IF EXTRACT(MONTH FROM user_birth_date) != EXTRACT(MONTH FROM CURRENT_DATE) OR
     EXTRACT(DAY FROM user_birth_date) != EXTRACT(DAY FROM CURRENT_DATE) THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already requested birthday bonus this year
  SELECT MAX(DATE(created_at)) INTO last_birthday_request
  FROM bonus_requests
  WHERE user_id = p_user_id 
    AND bonus_type = 'birthday'
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
  RETURN last_birthday_request IS NULL;
END;
$$;

-- Create function to check welcome bonus eligibility  
CREATE OR REPLACE FUNCTION public.can_request_welcome_bonus(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_created_at TIMESTAMP WITH TIME ZONE;
  existing_request_count INTEGER;
BEGIN
  -- Get user creation date
  SELECT created_at INTO user_created_at
  FROM profiles 
  WHERE id = p_user_id;
  
  -- User must be new (created within last 30 days)
  IF user_created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already requested welcome bonus
  SELECT COUNT(*) INTO existing_request_count
  FROM bonus_requests
  WHERE user_id = p_user_id AND bonus_type = 'welcome';
    
  RETURN existing_request_count = 0;
END;
$$;

-- Create function to calculate user losses for cashback
CREATE OR REPLACE FUNCTION public.calculate_user_losses(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_bets NUMERIC := 0;
  total_wins NUMERIC := 0;
  net_loss NUMERIC := 0;
BEGIN
  -- Calculate from game sessions
  SELECT 
    COALESCE(SUM(total_bet), 0),
    COALESCE(SUM(total_win), 0)
  INTO total_bets, total_wins
  FROM game_sessions
  WHERE user_id = p_user_id 
    AND created_at >= (CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL)
    AND status = 'completed';
    
  net_loss := total_bets - total_wins;
  
  RETURN GREATEST(net_loss, 0); -- Return 0 if user is in profit
END;
$$;