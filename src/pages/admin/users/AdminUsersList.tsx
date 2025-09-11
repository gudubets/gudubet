import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Ban, CheckCircle, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  banned_until: string | null;
  last_login_at: string | null;
}

export default function AdminUsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_users', {
        p_q: searchQuery || null,
        p_limit: 100,
        p_offset: 0
      });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: "Hata",
        description: error.message || "Kullanıcılar yüklenirken hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateUserProfile = async (userId: string, role?: string, bannedUntil?: string | null) => {
    try {
      await supabase.rpc('admin_update_profile', {
        p_user: userId,
        p_role: role || null,
        p_banned_until: bannedUntil || null
      });

      toast({
        title: "Başarılı",
        description: "Kullanıcı profili güncellendi",
      });

      await loadUsers(); // Refresh list
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı güncellenirken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const banUser = (userId: string, days: number) => {
    const bannedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    updateUserProfile(userId, undefined, bannedUntil);
  };

  const unbanUser = (userId: string) => {
    updateUserProfile(userId, undefined, null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="destructive">Super Admin</Badge>;
      case 'finance':
        return <Badge className="bg-purple-600">Finance</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>;
      default:
        return <Badge variant="outline">User</Badge>;
    }
  };

  const getBanStatus = (bannedUntil: string | null) => {
    if (!bannedUntil) return null;
    
    const banDate = new Date(bannedUntil);
    const now = new Date();
    
    if (banDate > now) {
      return <Badge variant="destructive">Banned until {banDate.toLocaleDateString()}</Badge>;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-sm text-muted-foreground">
          Total {users.length} users
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Search and filter users by email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              />
            </div>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>Manage user roles and ban status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) => updateUserProfile(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="superadmin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {getRoleBadge(user.role)}
                        {getBanStatus(user.banned_until)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => banUser(user.id, 1)}>
                            <Ban className="mr-2 h-4 w-4" />
                            Ban 1 day
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => banUser(user.id, 7)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Ban 7 days
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => banUser(user.id, 30)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Ban 30 days
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => unbanUser(user.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Unban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}