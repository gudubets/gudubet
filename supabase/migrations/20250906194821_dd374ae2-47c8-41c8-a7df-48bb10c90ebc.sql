-- Fix security issue: Restrict captcha token access to authenticated users only
-- Users should only be able to view captcha tokens for their own email address

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view captcha tokens by email" ON public.captcha_tokens;

-- Create a new secure SELECT policy that only allows users to view their own captcha tokens
-- This requires the user to be authenticated and the email to match their auth email
CREATE POLICY "Users can view their own captcha tokens" 
ON public.captcha_tokens 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND user_email = auth.email()
);

-- Also add a policy to allow cleanup of expired tokens by the system
-- This is needed for the cleanup function to work properly
CREATE POLICY "System can delete expired captcha tokens" 
ON public.captcha_tokens 
FOR DELETE 
USING (expires_at < now());

-- Update the INSERT policy to be more specific about what can be inserted
-- Only allow authenticated users to create captcha tokens for their own email
DROP POLICY IF EXISTS "Users can create captcha tokens" ON public.captcha_tokens;

CREATE POLICY "Users can create captcha tokens for their email" 
ON public.captcha_tokens 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_email = auth.email()
);

-- Add a policy for unauthenticated captcha creation during registration/login flows
-- This allows creating captcha tokens for any email when not authenticated (for registration)
CREATE POLICY "Allow unauthenticated captcha creation" 
ON public.captcha_tokens 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NULL 
  AND user_email IS NOT NULL
);