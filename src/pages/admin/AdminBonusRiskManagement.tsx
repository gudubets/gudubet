import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Eye, Ban, CheckCircle, XCircle, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface RiskFlag {
  id: string;
  user_id: string;
  score: number;
  status: 'none' | 'review' | 'limited' | 'blocked';
  reasons: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const AdminBonusRiskManagement: React.FC = () => {
  const [searchUserId, setSearchUserId] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedFlag, setSelectedFlag] = React.useState<RiskFlag | null>(null);
  const [actionNote, setActionNote] = React.useState('');
  
  const queryClient = useQueryClient();

  // Fetch risk flags
  const { data: riskFlags, isLoading } = useQuery({
    queryKey: ['bonusRiskFlags', selectedStatus, searchUserId],
    queryFn: async () => {
      let query = supabase
        .from('bonus_risk_flags')
        .select(`
          *,
          users!inner(id, email, first_name, last_name)
        `)
        .order('score', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      if (searchUserId) {
        query = query.ilike('users.email', `%${searchUserId}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (RiskFlag & { users: any })[];
    }
  });

  // Update risk flag status
  const updateRiskFlag = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note: string }) => {
      const { error } = await supabase
        .from('bonus_risk_flags')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Log the action
      await supabase
        .from('bonus_audit_logs')
        .insert({
          action: 'risk_flag_updated',
          entity_type: 'bonus_risk_flag',
          entity_id: id,
          meta: {
            old_status: selectedFlag?.status,
            new_status: status,
            admin_note: note
          }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonusRiskFlags'] });
      toast({
        title: "Başarılı",
        description: "Risk durumu güncellendi"
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Güncelleme başarısız: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleStatusUpdate = (status: string) => {
    if (!selectedFlag || !actionNote.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir not ekleyin",
        variant: "destructive"
      });
      return;
    }

    updateRiskFlag.mutate({
      id: selectedFlag.id,
      status,
      note: actionNote
    });

    setSelectedFlag(null);
    setActionNote('');
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'review': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'limited': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'blocked': return <Ban className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'review': return 'İncelemede';
      case 'limited': return 'Sınırlı';
      case 'blocked': return 'Engelli';
      default: return 'Normal';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'review': return 'secondary';
      case 'limited': return 'destructive';
      case 'blocked': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Risk Yönetimi</h1>
          <p className="text-muted-foreground">Bonus risk analizi ve kullanıcı durumları</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Kullanıcı Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="E-posta ile ara..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Durum</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="none">Normal</SelectItem>
                  <SelectItem value="review">İncelemede</SelectItem>
                  <SelectItem value="limited">Sınırlı</SelectItem>
                  <SelectItem value="blocked">Engelli</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Bayrakları</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Risk Skoru</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Risk Sebepleri</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskFlags?.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{flag.users?.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {flag.users?.first_name} {flag.users?.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-md border ${getRiskScoreColor(flag.score)}`}>
                        <span className="font-medium">{flag.score}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(flag.status)} className="gap-1">
                        {getStatusIcon(flag.status)}
                        {getStatusLabel(flag.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(flag.reasons || {}).map(([reason, details]) => (
                          <Badge key={reason} variant="outline" className="text-xs">
                            {reason.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(flag.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFlag(flag)}
                          >
                            İşlem Yap
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Risk Durumu Güncelle</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Kullanıcı</p>
                              <p className="font-medium">{flag.users?.email}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground">Mevcut Risk Skoru</p>
                              <div className={`inline-flex items-center px-2 py-1 rounded-md border ${getRiskScoreColor(flag.score)}`}>
                                <span className="font-medium">{flag.score}</span>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="action-note">İşlem Notu *</Label>
                              <Textarea
                                id="action-note"
                                placeholder="İşlem sebebini açıklayın..."
                                value={actionNote}
                                onChange={(e) => setActionNote(e.target.value)}
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate('none')}
                                disabled={updateRiskFlag.isPending}
                                className="gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Temizle
                              </Button>
                              
                              <Button
                                variant="secondary"
                                onClick={() => handleStatusUpdate('review')}
                                disabled={updateRiskFlag.isPending}
                                className="gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                İnceleme
                              </Button>
                              
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusUpdate('limited')}
                                disabled={updateRiskFlag.isPending}
                                className="gap-2"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Sınırla
                              </Button>
                              
                              <Button
                                variant="destructive"
                                onClick={() => handleStatusUpdate('blocked')}
                                disabled={updateRiskFlag.isPending}
                                className="gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                Engelle
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {riskFlags?.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Risk bayrağı bulunamadı</h3>
              <p className="text-muted-foreground">
                Seçilen kriterlere uygun risk bayrağı bulunmuyor
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};