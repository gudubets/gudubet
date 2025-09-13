-- Create login_logs table to track user login attempts with IP addresses
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  login_method TEXT DEFAULT 'email_password', -- 'email_password', 'google', etc.
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all login logs" 
ON public.login_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE admins.id = auth.uid() AND admins.is_active = true
));

CREATE POLICY "System can insert login logs" 
ON public.login_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX idx_login_logs_created_at ON public.login_logs(created_at);
CREATE INDEX idx_login_logs_ip_address ON public.login_logs(ip_address);