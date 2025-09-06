import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdminActivity {
  id: string;
  admin_id: string;
  action_type: string;
  description: string;
  target_id?: string;
  target_type?: string;
  metadata?: any;
  created_at: string;
  admins?: {
    email: string;
    role_type: string;
  };
}

export const useAdminNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastViewedAt, setLastViewedAt] = useState<string>(() => {
    return localStorage.getItem('admin_notifications_last_viewed') || new Date().toISOString();
  });

  // Fetch recent admin activities
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activities')
        .select(`
          *,
          admins (
            email,
            role_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AdminActivity[];
    },
    refetchInterval: 30000, // 30 saniyede bir güncelle
  });

  // Calculate unread count
  useEffect(() => {
    if (activities.length > 0) {
      const unread = activities.filter(
        activity => new Date(activity.created_at) > new Date(lastViewedAt)
      ).length;
      setUnreadCount(unread);
    }
  }, [activities, lastViewedAt]);

  // Mark notifications as read
  const markAsRead = () => {
    const now = new Date().toISOString();
    setLastViewedAt(now);
    localStorage.setItem('admin_notifications_last_viewed', now);
    setUnreadCount(0);
  };

  // Format activity description
  const formatActivity = (activity: AdminActivity): string => {
    const adminEmail = activity.admins?.email || 'Sistem';
    
    switch (activity.action_type) {
      case 'user_created':
        return `${adminEmail} yeni kullanıcı oluşturdu`;
      case 'user_updated':
        return `${adminEmail} kullanıcı bilgilerini güncelledi`;
      case 'transaction_approved':
        return `${adminEmail} işlemi onayladı`;
      case 'transaction_rejected':
        return `${adminEmail} işlemi reddetti`;
      case 'bonus_created':
        return `${adminEmail} yeni bonus kampanyası oluşturdu`;
      case 'admin_created':
        return `${adminEmail} yeni admin oluşturdu`;
      case 'permission_updated':
        return `${adminEmail} admin yetkilerini güncelledi`;
      default:
        return activity.description;
    }
  };

  return {
    activities,
    unreadCount,
    isLoading,
    markAsRead,
    formatActivity,
  };
};