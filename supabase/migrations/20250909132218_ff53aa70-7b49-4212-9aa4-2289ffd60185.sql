-- Create game_providers table for external and custom game providers
CREATE TABLE public.game_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('external', 'custom')),
  api_endpoint TEXT,
  api_key TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_provider_configs table for provider-specific configurations
CREATE TABLE public.game_provider_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.game_providers(id) ON DELETE CASCADE,
  demo_mode BOOLEAN NOT NULL DEFAULT true,
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY['USD', 'EUR', 'TRY'],
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['tr', 'en'],
  webhook_url TEXT,
  return_url TEXT,
  max_bet_amount DECIMAL(10,2) DEFAULT 1000.00,
  min_bet_amount DECIMAL(10,2) DEFAULT 0.10,
  session_timeout INTEGER DEFAULT 3600, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id)
);

-- Enable RLS on both tables
ALTER TABLE public.game_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_provider_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game_providers (admin only)
CREATE POLICY "Admins can manage game providers" 
ON public.game_providers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() 
    AND is_active = true
  )
);

-- Create RLS policies for game_provider_configs (admin only)
CREATE POLICY "Admins can manage provider configs" 
ON public.game_provider_configs 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = auth.uid() 
    AND is_active = true
  )
);

-- Create updated_at trigger for game_providers
CREATE TRIGGER update_game_providers_updated_at
  BEFORE UPDATE ON public.game_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for game_provider_configs  
CREATE TRIGGER update_game_provider_configs_updated_at
  BEFORE UPDATE ON public.game_provider_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default game providers
INSERT INTO public.game_providers (name, slug, provider_type, api_endpoint, logo_url, website_url) VALUES
('Pragmatic Play', 'pragmatic-play', 'external', 'https://api.pragmaticplay.com', '/images/providers/pragmatic.png', 'https://www.pragmaticplay.com'),
('Evolution Gaming', 'evolution-gaming', 'external', 'https://api.evolutiongaming.com', '/images/providers/evolution.png', 'https://www.evolutiongaming.com'),
('NetEnt', 'netent', 'external', 'https://api.netent.com', '/images/providers/netent.png', 'https://www.netent.com'),
('Gudubet Custom', 'gudubet-custom', 'custom', null, '/images/providers/gudubet.png', null);

-- Insert default configurations for the providers
INSERT INTO public.game_provider_configs (provider_id, demo_mode, supported_currencies, supported_languages)
SELECT 
  id,
  true,
  ARRAY['USD', 'EUR', 'TRY'],
  ARRAY['tr', 'en']
FROM public.game_providers;