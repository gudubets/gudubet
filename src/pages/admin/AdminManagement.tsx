import { useState, useEffect } from 'react';
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
import { UserPlus, Shield, Settings, Users, Edit, Trash2, Clock, Search, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { logAdminActivity, ACTIVITY_TYPES } from '@/utils/adminActivityLogger';

interface Admin {
  id: string;
  email: string;
  role_type: 'super_admin' | 'finance' | 'crm' | 'support' | 'moderator';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  department?: string;
  avatar_url?: string;
  password_hash: string;
  last_login_at?: string;
  created_by?: string;
}

interface Permission {
  id: string;
  admin_id: string;
  permission_name: string;
  is_granted: boolean;
  granted_at: string;
  granted_by: string;
}

interface AdminActivity {
  id: string;
  admin_id: string;
  action_type: string;
  description: string;
  target_type: string | null;
  target_id: string | null;
  metadata: any;
  created_at: string;
  admin?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuperAdminDeleteModalOpen, setIsSuperAdminDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [superAdminToDelete, setSuperAdminToDelete] = useState<Admin | null>(null);
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    role_type: 'admin'
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const queryClient = useQueryClient();

  // Check if current user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: adminData } = await supabase
            .from('admins')
            .select('role_type')
            .eq('id', user.id)
            .single();
          
          setIsSuperAdmin(adminData?.role_type === 'super_admin');
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        setIsSuperAdmin(false);
      }
    };

    checkSuperAdmin();
  }, []);

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

  // Fetch admin activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      // First get admin activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('admin_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
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
        admin: profilesMap.get(activity.admin_id) || null
      })) as AdminActivity[];
    },
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
          role_type: adminData.role_type as 'super_admin' | 'finance' | 'crm' | 'support' | 'moderator',
          password_hash: 'managed_by_auth', // Placeholder since auth handles this
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      
      // Log admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.ADMIN_CREATED,
        description: `Yeni admin oluşturuldu: ${newAdminData.email}`,
        target_id: data.id,
        target_type: 'admin',
        metadata: { email: newAdminData.email, role_type: newAdminData.role_type }
      });
      
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      
      // Log admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.PERMISSION_UPDATED,
        description: `Admin yetkisi güncellendi`,
        target_id: selectedAdmin?.id,
        target_type: 'admin_permission',
        metadata: { 
          admin_email: selectedAdmin?.email,
          permission_updated: true
        }
      });
      
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

  // Delete admin mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      // First delete related permissions
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('admin_id', adminId);

      // Delete admin record
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      
      // Log admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.ADMIN_DELETED,
        description: `Admin silindi: ${adminToDelete?.email}`,
        target_id: adminToDelete?.id,
        target_type: 'admin',
        metadata: { 
          deleted_admin_email: adminToDelete?.email,
          deleted_admin_role: adminToDelete?.role_type
        }
      });
      
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      toast({
        title: "Admin silindi",
        description: "Admin başarıyla silindi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Admin silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Super Admin delete mutation with extra security
  const deleteSuperAdminMutation = useMutation({
    mutationFn: async ({ adminId, password }: { adminId: string; password: string }) => {
      // First check if there are other super admins
      const { data: superAdmins, error: countError } = await supabase
        .from('admins')
        .select('id')
        .eq('role_type', 'super_admin')
        .eq('is_active', true);

      if (countError) throw countError;

      if (superAdmins.length <= 1) {
        throw new Error('En az bir aktif super admin kalmalıdır!');
      }

      // Verify current user's password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı doğrulanamadı');

      // Re-authenticate user to verify password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (authError) throw new Error('Şifre doğrulaması başarısız!');

      // Delete related permissions first
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('admin_id', adminId);

      // Delete super admin record
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId)
        .eq('role_type', 'super_admin');

      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      
      // Log critical admin activity
      await logAdminActivity({
        action_type: ACTIVITY_TYPES.ADMIN_DELETED,
        description: `SUPER ADMIN SİLİNDİ: ${superAdminToDelete?.email} - KRİTİK İŞLEM`,
        target_id: superAdminToDelete?.id,
        target_type: 'super_admin',
        metadata: { 
          deleted_super_admin_email: superAdminToDelete?.email,
          security_verification: 'password_confirmed',
          warning_level: 'critical'
        }
      });
      
      setIsSuperAdminDeleteModalOpen(false);
      setSuperAdminToDelete(null);
      setPasswordConfirmation('');
      setDeleteConfirmationText('');
      
      toast({
        title: "Super Admin Silindi",
        description: `${superAdminToDelete?.email} başarıyla silindi.`,
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Super admin silinirken bir hata oluştu.",
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

  // Filter activities based on search term and filter
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                         activity.action_type.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
                         (activity.admin?.email?.toLowerCase().includes(activitySearchTerm.toLowerCase()) || false);
    
    const matchesFilter = activityFilter === 'all' || activity.action_type === activityFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getActivityTypeBadge = (actionType: string) => {
    switch (actionType) {
      case 'admin_created':
        return <Badge className="bg-green-100 text-green-800">Admin Oluşturuldu</Badge>;
      case 'admin_updated':
        return <Badge className="bg-blue-100 text-blue-800">Admin Güncellendi</Badge>;
      case 'admin_deleted':
        return <Badge className="bg-red-100 text-red-800">Admin Silindi</Badge>;
      case 'permission_updated':
        return <Badge className="bg-purple-100 text-purple-800">İzin Güncellendi</Badge>;
      case 'user_updated':
        return <Badge className="bg-orange-100 text-orange-800">Kullanıcı Güncellendi</Badge>;
      default:
        return <Badge variant="outline">{actionType}</Badge>;
    }
  };

  // Show access denied if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <Shield className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Erişim Reddedildi</h3>
              <p className="text-sm text-muted-foreground">
                Bu sayfayı görüntülemek için Süper Admin yetkisine sahip olmanız gerekir.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="finance">Finans</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="support">Destek</SelectItem>
                    <SelectItem value="moderator">Moderatör</SelectItem>
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
                          {admin.role_type === 'super_admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                              onClick={() => {
                                setSuperAdminToDelete(admin);
                                setIsSuperAdminDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Güvenli Sil
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setAdminToDelete(admin);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Sil
                            </Button>
                          )}
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

      {/* Admin Activity History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Admin Aktivite Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Aktivite ara..."
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Aktivite türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Aktiviteler</SelectItem>
                  <SelectItem value="admin_created">Admin Oluşturuldu</SelectItem>
                  <SelectItem value="admin_updated">Admin Güncellendi</SelectItem>
                  <SelectItem value="admin_deleted">Admin Silindi</SelectItem>
                  <SelectItem value="permission_updated">İzin Güncellendi</SelectItem>
                  <SelectItem value="user_updated">Kullanıcı Güncellendi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activities Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Aktivite</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitiesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          Aktiviteler yükleniyor...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        {activitySearchTerm || activityFilter !== 'all' 
                          ? 'Arama kriterlerine uygun aktivite bulunamadı.' 
                          : 'Henüz aktivite kaydı bulunmuyor.'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">
                          {activity.admin 
                            ? `${activity.admin.first_name || ''} ${activity.admin.last_name || ''}`.trim() || activity.admin.email
                            : 'Sistem Aktivitesi'
                          }
                          {activity.admin?.email && (
                            <div className="text-sm text-muted-foreground">
                              {activity.admin.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getActivityTypeBadge(activity.action_type)}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={activity.description}>
                            {activity.description}
                          </div>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {activity.target_type && `Hedef: ${activity.target_type}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(activity.created_at).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Admin Sil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <Trash2 className="w-8 h-8 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Bu işlem geri alınamaz!</p>
                <p className="text-sm text-red-700">
                  Bu admini silmek istediğinizden emin misiniz?
                </p>
              </div>
            </div>
            
            {adminToDelete && (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Silinecek Admin:</p>
                  <p className="font-medium">{adminToDelete.email}</p>
                  <p className="text-sm text-gray-500">
                    {getRoleBadge(adminToDelete.role_type)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => adminToDelete && deleteAdminMutation.mutate(adminToDelete.id)}
                disabled={deleteAdminMutation.isPending}
                className="flex-1"
              >
                {deleteAdminMutation.isPending ? 'Siliniyor...' : 'Sil'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Super Admin Delete Modal - Extra Security */}
      <Dialog open={isSuperAdminDeleteModalOpen} onOpenChange={setIsSuperAdminDeleteModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              SUPER ADMİN SİL - KRİTİK İŞLEM
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Critical Warning */}
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-red-500 text-white rounded-full p-1">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-red-800">⚠️ KRİTİK UYARI ⚠️</p>
                  <p className="text-sm text-red-700 mt-1">
                    Bu işlem GERİ ALINAMAZ ve sistem güvenliğini etkileyebilir!
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            {superAdminToDelete && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Silinecek Super Admin:</p>
                <p className="font-bold text-red-800 text-lg">{superAdminToDelete.email}</p>
                <div className="mt-2">
                  {getRoleBadge(superAdminToDelete.role_type)}
                </div>
              </div>
            )}

            {/* Security Steps */}
            <div className="space-y-4">
              <div>
                <Label className="text-red-700 font-medium">
                  1. Güvenlik Onayı - "DELETE" yazın:
                </Label>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="DELETE yazın"
                  className="mt-2 border-red-300 focus:border-red-500"
                />
              </div>
              
              <div>
                <Label className="text-red-700 font-medium">
                  2. Şifre Doğrulaması - Mevcut şifrenizi girin:
                </Label>
                <Input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="mt-2 border-red-300 focus:border-red-500"
                />
              </div>
            </div>

            {/* Security Checklist */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800 mb-2">✓ Güvenlik Kontrolleri:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• En az 1 super admin sistemde kalacak</li>
                <li>• Şifre doğrulaması yapılacak</li>
                <li>• İşlem admin geçmişine kaydedilecek</li>
                <li>• Tüm ilgili veriler silinecek</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuperAdminDeleteModalOpen(false);
                  setSuperAdminToDelete(null);
                  setPasswordConfirmation('');
                  setDeleteConfirmationText('');
                }}
                className="flex-1"
              >
                İptal Et
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (superAdminToDelete && passwordConfirmation) {
                    deleteSuperAdminMutation.mutate({
                      adminId: superAdminToDelete.id,
                      password: passwordConfirmation
                    });
                  }
                }}
                disabled={
                  deleteSuperAdminMutation.isPending || 
                  deleteConfirmationText !== 'DELETE' || 
                  !passwordConfirmation.trim()
                }
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteSuperAdminMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Siliniyor...
                  </div>
                ) : (
                  'SUPER ADMİNİ SİL'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;