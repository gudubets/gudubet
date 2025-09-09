-- Add missing columns to existing game_providers table
ALTER TABLE public.game_providers ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'external' CHECK (provider_type IN ('external', 'custom'));
ALTER TABLE public.game_providers ADD COLUMN IF NOT EXISTS api_endpoint TEXT;
ALTER TABLE public.game_providers ADD COLUMN IF NOT EXISTS api_key TEXT;
ALTER TABLE public.game_providers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance'));

-- Create game_provider_configs table for provider-specific configurations
CREATE TABLE IF NOT EXISTS public.game_provider_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.game_providers(id) ON DELETE CASCADE,
  demo_mode BOOLEAN NOT NULL DEFAULT true,
  supported_currencies TEXT[] NOT NULL DEFAULT ARRAY['USD', 'EUR', 'TRY'],
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['tr', 'en'],
  webhook_url TEXT,
  return_url TEXT,
  max_bet_amount DECIMAL(10,2) DEFAULT 1000.00,
  min_bet_amount DECIMAL(10,2) DEFAULT 0.10,
  session_timeout INTEGER DEFAULT 3600,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id)
);

-- Enable RLS on game_provider_configs
ALTER TABLE public.game_provider_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for game_providers (admin access)
DROP POLICY IF EXISTS "Admins can manage game providers" ON public.game_providers;
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

-- Create RLS policies for game_provider_configs (admin access)
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

-- Create updated_at trigger for game_provider_configs  
CREATE TRIGGER update_game_provider_configs_updated_at
  BEFORE UPDATE ON public.game_provider_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing providers with new columns
UPDATE public.game_providers SET 
  provider_type = CASE 
    WHEN name LIKE '%Gudubet%' THEN 'custom'
    ELSE 'external'
  END,
  status = 'active'
WHERE provider_type IS NULL OR status IS NULL;

-- Insert default configurations for existing providers
INSERT INTO public.game_provider_configs (provider_id, demo_mode, supported_currencies, supported_languages)
SELECT 
  id,
  true,
  ARRAY['USD', 'EUR', 'TRY'],
  ARRAY['tr', 'en']
FROM public.game_providers
ON CONFLICT (provider_id) DO NOTHING;