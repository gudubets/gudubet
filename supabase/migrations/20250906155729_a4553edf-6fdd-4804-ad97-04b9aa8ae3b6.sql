-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('welcome', 'deposit', 'freebet', 'cashback', 'special')),
  bonus_amount NUMERIC,
  bonus_percentage NUMERIC,
  min_deposit NUMERIC,
  max_bonus NUMERIC,
  wagering_requirement INTEGER DEFAULT 1,
  promo_code TEXT,
  terms_conditions TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_promotions table
CREATE TABLE public.user_promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'used', 'expired', 'cancelled')),
  participated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  activated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  bonus_amount NUMERIC,
  wagering_completed NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, promotion_id)
);

-- Enable RLS on both tables
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promotions ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotions table
CREATE POLICY "Promotions are viewable by everyone" 
ON public.promotions 
FOR SELECT 
USING (is_active = true AND start_date <= now() AND end_date >= now());

-- RLS policies for user_promotions table
CREATE POLICY "Users can view their own promotions" 
ON public.user_promotions 
FOR SELECT 
USING (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = user_promotions.user_id));

CREATE POLICY "Users can create their own promotion entries" 
ON public.user_promotions 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = user_promotions.user_id));

CREATE POLICY "Users can update their own promotion entries" 
ON public.user_promotions 
FOR UPDATE 
USING (auth.uid() = (SELECT users.auth_user_id FROM users WHERE users.id = user_promotions.user_id));

-- Create indexes for better performance
CREATE INDEX idx_promotions_category ON public.promotions(category);
CREATE INDEX idx_promotions_active ON public.promotions(is_active, start_date, end_date);
CREATE INDEX idx_user_promotions_user_id ON public.user_promotions(user_id);
CREATE INDEX idx_user_promotions_status ON public.user_promotions(status);

-- Create function to update updated_at timestamps
CREATE TRIGGER update_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_promotions_updated_at
BEFORE UPDATE ON public.user_promotions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample promotions data
INSERT INTO public.promotions (title, description, detailed_description, image_url, category, bonus_percentage, min_deposit, max_bonus, wagering_requirement, terms_conditions, start_date, end_date) VALUES
('Hoş Geldin Bonusu', '%100 Hoş Geldin Bonusu - İlk yatırımınızda %100 bonus kazanın!', 'İlk kez üye olan kullanıcılar için özel bonus. İlk yatırımınızda %100 bonus kazanın ve bahis keyfini ikiye katlayın.', '/api/placeholder/400/250', 'welcome', 100, 50, 1000, 30, 'Minimum 50 TL yatırım gereklidir. 30x çevrim şartı vardır.', now(), now() + interval '30 days'),

('Yatırım Bonusu', '%50 Yatırım Bonusu - Her yatırımda bonus!', 'Her yatırımınızda %50 bonus kazanın. Sınırsız kullanım hakkı.', '/api/placeholder/400/250', 'deposit', 50, 100, 500, 25, 'Minimum 100 TL yatırım gereklidir. 25x çevrim şartı vardır.', now(), now() + interval '60 days'),

('10 TL Freebet', 'Ücretsiz 10 TL Bahis Hakkı', 'Herhangi bir yatırım yapmadan 10 TL değerinde ücretsitz bahis hakkı kazanın.', '/api/placeholder/400/250', 'freebet', NULL, NULL, NULL, 1, 'Sadece spor bahisleri için geçerlidir. Kazanç çekilebilir.', now(), now() + interval '15 days'),

('%10 Cashback', 'Haftalık %10 Cashback', 'Haftalık kayıplarınızın %10''unu geri alın. Her pazartesi hesabınıza yatırılır.', '/api/placeholder/400/250', 'cashback', 10, NULL, 1000, 1, 'Minimum 100 TL kayıp gereklidir. Maksimum 1000 TL cashback.', now(), now() + interval '7 days'),

('Doğum Günü Bonusu', 'Doğum gününüzde özel bonus!', 'Doğum gününüzde özel 100 TL bonus ve %25 ekstra yatırım bonusu.', '/api/placeholder/400/250', 'special', 25, 50, 250, 20, 'Doğum günü tarihinde kullanılabilir. 20x çevrim şartı vardır.', now() - interval '1 day', now() + interval '90 days');