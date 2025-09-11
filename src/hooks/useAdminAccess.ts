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
        // Use the secure server-side admin validation function
        const { data: adminStatus, error } = await supabase
          .rpc('get_current_user_admin_status');

        if (error) {
          console.error('Error checking admin access:', error);
          setIsAdmin(false);
          setIsSuperAdmin(false);
        } else if (adminStatus && adminStatus.length > 0) {
          const status = adminStatus[0];
          setIsAdmin(status.is_admin || false);
          setIsSuperAdmin(status.is_super_admin || false);
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
  }, [user]);

  return { isAdmin, isSuperAdmin, loading };
};