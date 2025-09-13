-- Update login_logs RLS policies and fix user_id field
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;
DROP POLICY IF EXISTS "System can insert login logs" ON login_logs;

-- Modify the table to not reference auth.users directly since it causes issues
ALTER TABLE login_logs DROP CONSTRAINT IF EXISTS login_logs_user_id_fkey;

-- Create better policies
CREATE POLICY "Admins can view all login logs" 
ON login_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE admins.id = auth.uid() AND admins.is_active = true
));

CREATE POLICY "Anyone can insert login logs" 
ON login_logs 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance on email searches
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);