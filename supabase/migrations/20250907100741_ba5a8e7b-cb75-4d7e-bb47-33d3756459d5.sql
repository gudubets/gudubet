-- Add admin policies for users table to allow legitimate administrative access
-- while maintaining security for regular users

-- Allow super admins to view all users for administrative purposes
CREATE POLICY "Super admins can view all users" 
ON public.users 
FOR SELECT 
USING (is_current_user_super_admin());

-- Allow super admins to update user status and administrative fields
CREATE POLICY "Super admins can update users" 
ON public.users 
FOR UPDATE 
USING (is_current_user_super_admin());

-- Regular admins can view users (but not update)
CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (get_current_admin_role() = ANY (ARRAY['super_admin'::admin_role, 'admin'::admin_role]));