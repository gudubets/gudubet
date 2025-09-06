-- Insert a super admin user
INSERT INTO public.admins (email, password_hash, role_type)
VALUES ('superadmin@casino.com', 'managed_by_auth', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role_type = 'super_admin';

-- Grant all permissions to super admin
DO $$
DECLARE
    admin_record record;
    perm_name text;
    permission_names text[] := ARRAY[
        'view_users', 'manage_users', 'view_transactions', 'manage_transactions',
        'view_bonuses', 'manage_bonuses', 'view_games', 'manage_games',
        'view_reports', 'manage_admins'
    ];
BEGIN
    -- Get the admin record
    SELECT * INTO admin_record FROM public.admins WHERE email = 'superadmin@casino.com';
    
    -- Insert permissions for super admin
    FOREACH perm_name IN ARRAY permission_names
    LOOP
        INSERT INTO public.admin_permissions (admin_id, permission_name, is_granted)
        VALUES (admin_record.id, perm_name, true)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;