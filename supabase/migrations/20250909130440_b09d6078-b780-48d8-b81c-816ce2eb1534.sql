-- Insert default role permissions data only
INSERT INTO public.role_permissions (role, permission, granted_by) VALUES
-- Super Admin - all permissions
('super_admin', 'user_management', NULL),
('super_admin', 'user_ban', NULL),
('super_admin', 'user_kyc', NULL),
('super_admin', 'finance_approval', NULL),
('super_admin', 'deposit_approval', NULL),
('super_admin', 'withdrawal_approval', NULL),
('super_admin', 'bonus_create', NULL),
('super_admin', 'bonus_manage', NULL),
('super_admin', 'bonus_delete', NULL),
('super_admin', 'game_management', NULL),
('super_admin', 'game_publish', NULL),
('super_admin', 'game_unpublish', NULL),
('super_admin', 'category_management', NULL),
('super_admin', 'report_access', NULL),
('super_admin', 'financial_reports', NULL),
('super_admin', 'user_reports', NULL),
('super_admin', 'game_reports', NULL),
('super_admin', 'admin_management', NULL),
('super_admin', 'system_settings', NULL),
('super_admin', 'audit_logs', NULL),

-- Finance - financial operations
('finance', 'finance_approval', NULL),
('finance', 'deposit_approval', NULL),
('finance', 'withdrawal_approval', NULL),
('finance', 'financial_reports', NULL),
('finance', 'report_access', NULL),
('finance', 'user_kyc', NULL),

-- CRM - customer relations  
('crm', 'user_management', NULL),
('crm', 'user_ban', NULL),
('crm', 'user_kyc', NULL),
('crm', 'bonus_create', NULL),
('crm', 'bonus_manage', NULL),
('crm', 'report_access', NULL),
('crm', 'user_reports', NULL),

-- Support - customer support
('support', 'user_management', NULL),
('support', 'report_access', NULL),
('support', 'user_reports', NULL),

-- Moderator - basic monitoring
('moderator', 'report_access', NULL),
('moderator', 'user_reports', NULL)

ON CONFLICT (role, permission) DO NOTHING;