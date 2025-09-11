import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('role_type, is_active')
          .eq('id', session.user.id)
          .single();
        
        if (adminData && adminData.is_active) {
          navigate('/admin');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Giriş başarısız: ' + error.message);
        return;
      }

      if (data.user) {
        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('role_type, is_active')
          .eq('id', data.user.id)
          .single();

        if (adminError || !adminData || !adminData.is_active) {
          await supabase.auth.signOut();
          toast.error('Bu hesap admin yetkilerine sahip değil.');
          return;
        }

        toast.success('Başarıyla giriş yapıldı!');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Giriş yaparken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Girişi</CardTitle>
          <CardDescription>
            Admin paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground"
            >
              Ana sayfaya dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;