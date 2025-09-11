import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Send, 
  Search, 
  Download, 
  RefreshCw,
  Bell,
  Users,
  MessageSquare,
  Calendar,
  Eye,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_user_id: string | null;
  admin_id: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    target_user_id: '',
    expires_at: ''
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data?.map(item => ({
        ...item,
        type: item.type as 'info' | 'warning' | 'success' | 'error'
      })) || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Hata",
        description: "Bildirimler yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_id')
        .order('first_name');

      if (error) throw error;
      
      // Transform data to include email from auth users if needed
      const usersWithEmail = data?.map(profile => ({
        id: profile.id,
        email: `user-${profile.id.slice(0, 8)}@domain.com`, // Placeholder email
        first_name: profile.first_name || 'İsim',
        last_name: profile.last_name || 'Soyisim'
      })) || [];
      
      setUsers(usersWithEmail);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Hata",
        description: "Başlık ve mesaj alanları zorunludur.",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);

      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        target_user_id: newNotification.target_user_id || null,
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        expires_at: newNotification.expires_at || null,
        is_active: true
      };

      const { error } = await supabase
        .from('notifications')
        .insert([notificationData]);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Bildirim ${newNotification.target_user_id ? 'kullanıcıya' : 'tüm kullanıcılara'} gönderildi.`
      });

      // Reset form and close modal
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target_user_id: '',
        expires_at: ''
      });
      setIsCreateModalOpen(false);
      
      // Refresh notifications list
      await fetchNotifications();

    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Hata",
        description: "Bildirim gönderilirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: `Bildirim ${!currentStatus ? 'aktif edildi' : 'pasif edildi'}.`
      });

      await fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: "Hata",
        description: "Bildirim durumu güncellenirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Bildirim silindi."
      });

      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Hata",
        description: "Bildirim silinirken hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'success': return 'Başarılı';
      case 'warning': return 'Uyarı';
      case 'error': return 'Hata';
      default: return 'Bilgi';
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalNotifications = notifications.length;
  const activeNotifications = notifications.filter(n => n.is_active).length;
  const globalNotifications = notifications.filter(n => !n.target_user_id).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirim Yönetimi</h1>
          <p className="text-muted-foreground">Kullanıcılara bildirim gönder ve yönet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchNotifications} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Yenile
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Bildirim
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Bildirim başlığı..."
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mesaj *</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Bildirim mesajı..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tür</Label>
                  <Select value={newNotification.type} onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => setNewNotification(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Bilgi</SelectItem>
                      <SelectItem value="success">Başarılı</SelectItem>
                      <SelectItem value="warning">Uyarı</SelectItem>
                      <SelectItem value="error">Hata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_user">Hedef Kullanıcı (Boş bırakırsan tüm kullanıcılara gider)</Label>
                  <Select value={newNotification.target_user_id || "all"} onValueChange={(value) => setNewNotification(prev => ({ ...prev, target_user_id: value === "all" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kullanıcı seç (opsiyonel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} {user.first_name && user.last_name && `(${user.first_name} ${user.last_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expires_at">Son Geçerlilik Tarihi (Opsiyonel)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newNotification.expires_at}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsCreateModalOpen(false)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button 
                    onClick={handleCreateNotification} 
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gönder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bildirim</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotifications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Bildirim</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNotifications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genel Bildirim</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalNotifications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Bildirimler yükleniyor...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Mesaj</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Hedef</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {notification.message}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notification.target_user_id ? (
                          <Badge variant="outline">Özel</Badge>
                        ) : (
                          <Badge variant="default">Tüm Kullanıcılar</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.is_active ? 'default' : 'secondary'}>
                          {notification.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleNotificationStatus(notification.id, notification.is_active)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;