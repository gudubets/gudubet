import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminAccess = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      console.log('No user found in checkAdminAccess');
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }

    console.log('Checking admin access for user:', user.id, user.email);

    try {
      // Check if user exists in admins table
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('role_type, is_active')
        .eq('id', user.id)
        .single();

      console.log('Admin query result:', { adminData, error });

      if (error) {
        // User not in admins table or error occurred
        console.error('Admin access error:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } else if (adminData && adminData.is_active) {
        console.log('User is admin:', adminData.role_type);
        setIsAdmin(true);
        setIsSuperAdmin(adminData.role_type === 'super_admin');
      } else {
        console.log('User exists but not active or no data');
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
  }, [user]);

  useEffect(() => {
    checkAdminAccess();

    // Set up periodic admin access verification (every 5 minutes)
    const interval = setInterval(() => {
      if (user) {
        checkAdminAccess();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAdminAccess, user]);

  return { isAdmin, isSuperAdmin, loading, refreshAdminAccess: checkAdminAccess };
};