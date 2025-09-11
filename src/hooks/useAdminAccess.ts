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
        // Check if user exists in admins table
        const { data: adminData, error } = await supabase
          .from('admins')
          .select('role_type, is_active')
          .eq('id', user.id)
          .single();

        if (error) {
          // User not in admins table or error occurred
          setIsAdmin(false);
          setIsSuperAdmin(false);
        } else if (adminData && adminData.is_active) {
          setIsAdmin(true);
          setIsSuperAdmin(adminData.role_type === 'super_admin');
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