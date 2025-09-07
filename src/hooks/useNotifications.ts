import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  is_read: boolean;
  read_at?: string;
}

interface NotificationWithStatus extends Notification {
  user_notification_id: string;
}

export const useNotifications = (user: User | null) => {
  const [notifications, setNotifications] = useState<NotificationWithStatus[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          id,
          is_read,
          read_at,
          notifications (
            id,
            title,
            message,
            type,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const formattedNotifications = data
        ?.filter(item => item.notifications)
        .map(item => ({
          id: item.notifications.id,
          title: item.notifications.title,
          message: item.notifications.message,
          type: item.notifications.type as 'info' | 'warning' | 'success' | 'error',
          created_at: item.notifications.created_at,
          is_read: item.is_read,
          read_at: item.read_at,
          user_notification_id: item.id
        })) || [];

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.is_read).length);

    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (userNotificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', userNotificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.user_notification_id === userNotificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.user_notification_id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);

    } catch (error) {
      console.error('Error in markAllAsRead:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};