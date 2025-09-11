-- Fix RLS policies for users table to allow admin access
-- First drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Create comprehensive admin access policies for users table
CREATE POLICY "Admins can view all users" 
ON users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

CREATE POLICY "Admins can manage all users" 
ON users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

-- Also ensure profiles table has proper admin access
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);

CREATE POLICY "Admins can manage all profiles" 
ON profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.id = auth.uid() AND admins.is_active = true
  )
);