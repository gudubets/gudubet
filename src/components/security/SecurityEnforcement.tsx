import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface SecurityContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  rateLimit: (key: string, limit?: number) => boolean;
  validateInput: (input: string, type: 'email' | 'text' | 'number') => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function useRateLimit() {
  return (key: string, limit = 10, windowMs = 60000): boolean => {
    const now = Date.now();
    const userLimit = rateLimitStore.get(key);
    
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (userLimit.count >= limit) {
      return true;
    }
    
    userLimit.count++;
    return false;
  };
}

function useInputValidation() {
  return (input: string, type: 'email' | 'text' | 'number'): boolean => {
    // Basic input sanitization and validation
    if (!input || input.length > 1000) return false;
    
    // Check for potential XSS/injection patterns
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /eval\(/gi,
      /expression\(/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) return false;
    }
    
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'number':
        return /^\d+(\.\d+)?$/.test(input);
      case 'text':
        return input.length <= 255; // Basic length check
      default:
        return false;
    }
  };
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const rateLimit = useRateLimit();
  const validateInput = useInputValidation();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user);
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (user: User) => {
    try {
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

  return (
    <SecurityContext.Provider value={{
      user,
      isAdmin,
      isSuperAdmin,
      loading,
      rateLimit,
      validateInput
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// Security enforcement HOC
export function withAdminAccess<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminProtectedComponent(props: P) {
    const { isAdmin, loading } = useSecurity();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAdmin) {
      return <div>Access denied. Admin privileges required.</div>;
    }
    
    return <Component {...props} />;
  };
}

export function withSuperAdminAccess<P extends object>(
  Component: React.ComponentType<P>
) {
  return function SuperAdminProtectedComponent(props: P) {
    const { isSuperAdmin, loading } = useSecurity();
    
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isSuperAdmin) {
      return <div>Access denied. Super admin privileges required.</div>;
    }
    
    return <Component {...props} />;
  };
}