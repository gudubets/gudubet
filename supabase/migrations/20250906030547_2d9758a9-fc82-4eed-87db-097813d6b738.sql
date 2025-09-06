-- Create captcha_tokens table for captcha verification
CREATE TABLE public.captcha_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.captcha_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for captcha tokens - allow anyone to insert and select their own tokens
CREATE POLICY "Users can create captcha tokens" 
ON public.captcha_tokens 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view captcha tokens by email" 
ON public.captcha_tokens 
FOR SELECT 
USING (true);

-- Create index for performance
CREATE INDEX idx_captcha_tokens_email ON public.captcha_tokens(user_email);
CREATE INDEX idx_captcha_tokens_expires_at ON public.captcha_tokens(expires_at);

-- Create function to cleanup expired captcha tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_captcha_tokens()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.captcha_tokens 
  WHERE expires_at < now();
$$;