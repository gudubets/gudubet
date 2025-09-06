import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Shield, Settings, Users, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  email: string;
  role: string;
  role_type: string;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  admin_id: string;
  permission_name: string;
  is_granted: boolean;
  granted_at: string;
  granted_by: string;
}

const AVAILABLE_PERMISSIONS = [
  { name: 'view_users', label: 'Kullanıcıları Görüntüle' },
  { name: 'manage_users', label: 'Kullanıcıları Yönet' },
  { name: 'view_transactions', label: 'İşlemleri Görüntüle' },
  { name: 'manage_transactions', label: 'İşlemleri Yönet' },
  { name: 'view_bonuses', label: 'Bonusları Görüntüle' },
  { name: 'manage_bonuses', label: 'Bonusları Yönet' },
  { name: 'view_games', label: 'Oyunları Görüntüle' },
  { name: 'manage_games', label: 'Oyunları Yönet' },
  { name: 'view_reports', label: 'Raporları Görüntüle' },
  { name: 'manage_admins', label: 'Adminleri Yönet' },
];

const AdminManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    role_type: 'admin'
  });
  const queryClient = useQueryClient();

  // Fetch all admins
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Admin[];
    },
  });

  // Fetch permissions for selected admin
  const { data: permissions = [] } = useQuery({
    queryKey: ['admin-permissions', selectedAdmin?.id],
    queryFn: async () => {
      if (!selectedAdmin) return [];
      
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('admin_id', selectedAdmin.id);
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!selectedAdmin,
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: async (adminData: typeof newAdminData) => {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then create admin record
      const { data, error } = await supabase
        .from('admins')
        .insert({
          email: adminData.email,
          role_type: adminData.role_type as 'super_admin' | 'admin' | 'finance_admin' | 'support_admin',
          password_hash: 'managed_by_auth', // Placeholder since auth handles this
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setIsCreateModalOpen(false);
      setNewAdminData({ email: '', password: '', role_type: 'admin' });
      toast({
        title: "Admin oluşturuldu",
        description: "Yeni admin başarıyla oluşturuldu.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Admin oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ adminId, permission, isGranted }: { adminId: string; permission: string; isGranted: boolean }) => {
      const { data: existing } = await supabase
        .from('admin_permissions')
        .select('id')
        .eq('admin_id', adminId)
        .eq('permission_name', permission)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('admin_permissions')
          .update({ is_granted: isGranted, granted_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_permissions')
          .insert({
            admin_id: adminId,
            permission_name: permission,
            is_granted: isGranted,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      toast({
        title: "İzin güncellendi",
        description: "Admin izni başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "İzin güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const getRoleBadge = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Shield className="w-3 h-3 mr-1" />Süper Admin</Badge>;
      case 'finance_admin':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Finans Admin</Badge>;
      case 'support_admin':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Destek Admin</Badge>;
      default:
        return <Badge variant="outline">Admin</Badge>;
    }
  };

  const isPermissionGranted = (permissionName: string) => {
    return permissions.find(p => p.permission_name === permissionName)?.is_granted || false;
  };

  const handlePermissionToggle = (permission: string, isGranted: boolean) => {
    if (!selectedAdmin) return;
    updatePermissionMutation.mutate({
      adminId: selectedAdmin.id,
      permission,
      isGranted,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold gradient-text-primary">Admin Yönetimi</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-gradient-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Yeni Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Admin Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="En az 6 karakter"
                />
              </div>
              <div>
                <Label htmlFor="role_type">Rol</Label>
                <Select 
                  value={newAdminData.role_type} 
                  onValueChange={(value) => setNewAdminData(prev => ({ ...prev, role_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="finance_admin">Finans Admin</SelectItem>
                    <SelectItem value="support_admin">Destek Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => createAdminMutation.mutate(newAdminData)}
                disabled={createAdminMutation.isPending || !newAdminData.email || !newAdminData.password}
                className="w-full"
              >
                {createAdminMutation.isPending ? 'Oluşturuluyor...' : 'Admin Oluştur'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Oluşturma Tarihi</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Admin bulunamadı
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role_type)}</TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsPermissionModalOpen(true);
                            }}
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            İzinler
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAdmin?.email} - İzin Yönetimi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <div key={permission.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-medium">{permission.label}</Label>
                    <p className="text-sm text-muted-foreground">{permission.name}</p>
                  </div>
                  <Switch
                    checked={isPermissionGranted(permission.name)}
                    onCheckedChange={(checked) => handlePermissionToggle(permission.name, checked)}
                    disabled={updatePermissionMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;