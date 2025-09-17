-- Create table to manage all site images
CREATE TABLE public.site_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT NOT NULL, -- 'hero', 'banners', 'payment_methods', 'promotions', 'game_categories', 'logos'
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view active site images"
ON public.site_images
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all site images"
ON public.site_images
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE admins.id = auth.uid() 
    AND admins.is_active = true
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_site_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_site_images_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_site_images_updated_at();

-- Insert initial image categories and existing images
INSERT INTO public.site_images (category, name, description, image_url, alt_text) VALUES
('hero', 'Ana Sayfa Hero Resmi', 'Ana sayfa büyük görsel', '/src/assets/hero-sports.jpg', 'Spor Bahisleri Hero Görseli'),
('game_categories', 'Casino Oyunları', 'Casino kategorisi görseli', '/src/assets/casino-games.jpg', 'Casino Oyunları'),
('game_categories', 'Slot Makineleri', 'Slot kategorisi görseli', '/src/assets/slot-machines.jpg', 'Slot Makineleri'),
('promotions', 'Hazine Görseli', 'Bonus ve promosyon görseli', '/src/assets/treasure.png', 'Hazine'),
('promotions', 'Gudubet Bonus', 'Gudubet bonus kampanyası', '/src/assets/gudubet-bonus.png', 'Gudubet Bonus'),
('promotions', 'VIP Bonus', 'VIP bonus kampanyası', '/src/assets/vip-bonus-new.png', 'VIP Bonus'),
('logos', 'Banka Logo Kompakt', 'Kompakt banka logosu', '/src/assets/bank-logo-compact.png', 'Banka Logo'),
('payment_methods', 'PayCo', 'PayCo ödeme yöntemi', '/lovable-uploads/e3f1f323-0e0c-4976-879b-1863ddc0b0c5.png', 'PayCo'),
('payment_methods', 'Banka', 'Banka ödeme yöntemi', '/lovable-uploads/d69c217a-d016-4085-a2fb-32e5edbf795a.png', 'Banka'),
('payment_methods', 'SuperPay', 'SuperPay ödeme yöntemi', '/lovable-uploads/4e010e53-eeae-4995-9217-4a4443b976c2.png', 'SuperPay'),
('payment_methods', 'PEP', 'PEP ödeme yöntemi', '/lovable-uploads/8627ae24-cef8-4f70-b840-ca2efba32223.png', 'PEP'),
('payment_methods', 'Papara', 'Papara ödeme yöntemi', '/lovable-uploads/902957d9-017b-4fed-8e28-fc43872f0ac4.png', 'Papara'),
('payment_methods', 'PAY', 'PAY ödeme yöntemi', '/lovable-uploads/1f2a654f-a8f3-4da6-91e2-50385bc78663.png', 'PAY'),
('payment_methods', 'Bitcoin', 'Bitcoin ödeme yöntemi', '/lovable-uploads/b309d125-4554-4c9e-b138-1e77bf9c039a.png', 'Bitcoin'),
('payment_methods', 'Litecoin', 'Litecoin ödeme yöntemi', '/lovable-uploads/18eee11b-4a02-40bc-9ef7-fdcad384ea3f.png', 'Litecoin'),
('payment_methods', 'Ethereum', 'Ethereum ödeme yöntemi', '/lovable-uploads/a1446f55-3168-4b98-8c46-44246d579061.png', 'Ethereum');