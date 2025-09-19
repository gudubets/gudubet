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
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
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
      // First get admin activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('admin_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      // Get unique admin IDs
      const adminIds = [...new Set(activitiesData.map(a => a.admin_id))];

      // Get admin profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', adminIds);

      if (profilesError) throw profilesError;

      // Map profiles by ID for quick lookup
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      // Combine data
      return activitiesData.map(activity => ({
        ...activity,
        profiles: profilesMap.get(activity.admin_id) || null
      })) as AdminActivity[];
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
    const adminName = activity.profiles 
      ? `${activity.profiles.first_name || ''} ${activity.profiles.last_name || ''}`.trim() || activity.profiles.email
      : 'Sistem';
    
    switch (activity.action_type) {
      case 'user_created':
        return `${adminName} yeni kullanıcı oluşturdu`;
      case 'user_updated':
        return `${adminName} kullanıcı bilgilerini güncelledi`;
      case 'transaction_approved':
        return `${adminName} işlemi onayladı`;
      case 'transaction_rejected':
        return `${adminName} işlemi reddetti`;
      case 'bonus_created':
        return `${adminName} yeni bonus kampanyası oluşturdu`;
      case 'admin_created':
        return `${adminName} yeni admin oluşturdu`;
      case 'permission_updated':
        return `${adminName} admin yetkilerini güncelledi`;
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