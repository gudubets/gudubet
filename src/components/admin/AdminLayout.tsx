import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const navigate = useNavigate();
  
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdminAccess(user);

  // Check authentication and get user
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSessionLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setSessionLoading(false);
        
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!sessionLoading && !adminLoading) {
      if (!user) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        navigate('/');
        return;
      }

      if (!isAdmin && !isSuperAdmin) {
        toast.error('Bu sayfaya erişim yetkiniz bulunmuyor.');
        navigate('/');
        return;
      }
    }
  }, [user, isAdmin, isSuperAdmin, sessionLoading, adminLoading, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Başarıyla çıkış yapıldı.');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Çıkış yaparken hata oluştu.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Show loading while checking authentication
  if (sessionLoading || adminLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yetkilendirme kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Don't render admin panel if user doesn't have access
  if (!user || (!isAdmin && !isSuperAdmin)) {
    return null;
  }

  return (
    <div className="h-screen flex bg-background">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onLogout={handleLogout} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;