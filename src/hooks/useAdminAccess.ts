import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminAccess = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Use the security definer function to avoid RLS issues
        const { data, error } = await supabase.rpc('check_user_admin_status', {
          check_user_id: user.id
        });

        if (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        } else if (data && data.length > 0) {
          const adminStatus = data[0];
          setIsAdmin(adminStatus.is_admin || false);
          setIsSuperAdmin(adminStatus.is_super_admin || false);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user?.id]); // Only depend on user ID, not the whole user object

  return { isAdmin, isSuperAdmin, loading };
};