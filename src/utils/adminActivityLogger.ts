import { supabase } from '@/integrations/supabase/client';

interface LogActivityParams {
  action_type: string;
  description: string;
  target_id?: string;
  target_type?: string;
  metadata?: any;
}

export const logAdminActivity = async (params: LogActivityParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found for activity logging');
      return;
    }

    const { error } = await supabase
      .from('admin_activities')
      .insert({
        admin_id: user.id,
        action_type: params.action_type,
        description: params.description,
        target_id: params.target_id,
        target_type: params.target_type,
        metadata: params.metadata,
      });

    if (error) {
      console.error('Error logging admin activity:', error);
    }
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Predefined activity types for common admin actions
export const ACTIVITY_TYPES = {
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  TRANSACTION_APPROVED: 'transaction_approved',
  TRANSACTION_REJECTED: 'transaction_rejected',
  BONUS_CREATED: 'bonus_created',
  BONUS_UPDATED: 'bonus_updated',
  BONUS_DELETED: 'bonus_deleted',
  ADMIN_CREATED: 'admin_created',
  ADMIN_UPDATED: 'admin_updated',
  ADMIN_DELETED: 'admin_deleted',
  PERMISSION_UPDATED: 'permission_updated',
  SETTINGS_UPDATED: 'settings_updated',
  REPORT_GENERATED: 'report_generated',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;