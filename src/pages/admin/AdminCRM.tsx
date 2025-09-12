import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';

import {
  Users,
  Mail,
  Send,
  Eye,
  Target,
  Calendar,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Bell,
  X
} from 'lucide-react';

interface UserSegment {
  id: string;
  name: string;
  slug: string;
  description: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface CRMCampaign {
  id: string;
  name: string;
  campaign_type: string;
  target_segments: string[];
  trigger_type: string;
  trigger_conditions?: any;
  content: any;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  scheduled_at?: string;
  created_by?: string;
}

interface CampaignDelivery {
  id: string;
  campaign_id: string;
  user_id: string;
  delivery_status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  failure_reason?: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: string;
  created_at: string;
}

const AdminCRM = () => {
  const { toast } = useToast();
  const { formatDate } = useI18n();
  
  // Data states
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [deliveries, setDeliveries] = useState<CampaignDelivery[]>([]);
  const [segmentUsers, setSegmentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [viewSegmentModal, setViewSegmentModal] = useState<string | null>(null);
  const [editSegmentModal, setEditSegmentModal] = useState<string | null>(null);
  const [viewCampaignModal, setViewCampaignModal] = useState<string | null>(null);
  const [editCampaignModal, setEditCampaignModal] = useState<string | null>(null);
  const [createCampaignModal, setCreateCampaignModal] = useState(false);
  
  // Form states
  const [campaignForm, setCampaignForm] = useState({
    id: '',
    name: '',
    campaign_type: 'email',
    target_segments: [] as string[],
    trigger_type: 'manual',
    subject: '',
    content: '',
    scheduled_at: '',
    is_active: true
  });

  const [segmentForm, setSegmentForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    conditions: {},
    is_active: true
  });

  // Load data functions
  const loadSegments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_segments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error loading segments:', error);
      toast({
        title: "Hata",
        description: "Segmentler yüklenemedi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Hata",
        description: "Kampanyalar yüklenemedi.",
        variant: "destructive"
      });
    }
  };

  const loadDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_deliveries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    }
  };

  const loadSegmentUsers = async (segmentId: string) => {
    try {
      // Since user_segment_memberships.user_id now points to profiles.id after migration,
      // we can join directly with profiles
      const { data, error } = await supabase
        .from('user_segment_memberships')
        .select(`
          user_id,
          profiles:user_id (
            id,
            email,
            first_name,
            last_name,
            status,
            created_at
          )
        `)
        .eq('segment_id', segmentId);

      if (error) throw error;
      
      const users = data?.map(item => ({
        id: item.profiles?.id || '',
        email: item.profiles?.email || '',
        first_name: item.profiles?.first_name || '',
        last_name: item.profiles?.last_name || '',
        status: item.profiles?.status || '',
        created_at: item.profiles?.created_at || ''
      })) || [];
      
      setSegmentUsers(users);
    } catch (error) {
      console.error('Error loading segment users:', error);
      setSegmentUsers([]);
    }
  };

  // CRUD Operations for Campaigns
  const createCampaign = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('crm_campaigns')
        .insert({
          name: campaignForm.name,
          campaign_type: campaignForm.campaign_type,
          target_segments: campaignForm.target_segments,
          trigger_type: campaignForm.trigger_type,
          content: {
            subject: campaignForm.subject,
            body: campaignForm.content
          },
          scheduled_at: campaignForm.scheduled_at ? new Date(campaignForm.scheduled_at).toISOString() : null,
          is_active: campaignForm.is_active
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kampanya oluşturuldu."
      });

      resetCampaignForm();
      setCreateCampaignModal(false);
      loadCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Hata",
        description: "Kampanya oluşturulamadı.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('crm_campaigns')
        .update({
          name: campaignForm.name,
          campaign_type: campaignForm.campaign_type,
          target_segments: campaignForm.target_segments,
          trigger_type: campaignForm.trigger_type,
          content: {
            subject: campaignForm.subject,
            body: campaignForm.content
          },
          scheduled_at: campaignForm.scheduled_at ? new Date(campaignForm.scheduled_at).toISOString() : null,
          is_active: campaignForm.is_active
        })
        .eq('id', campaignForm.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kampanya güncellendi."
      });

      setEditCampaignModal(null);
      loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Hata",
        description: "Kampanya güncellenemedi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('crm_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kampanya silindi."
      });

      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Hata",
        description: "Kampanya silinemedi.",
        variant: "destructive"
      });
    }
  };

  // Form helpers
  const resetCampaignForm = () => {
    setCampaignForm({
      id: '',
      name: '',
      campaign_type: 'email',
      target_segments: [],
      trigger_type: 'manual',
      subject: '',
      content: '',
      scheduled_at: '',
      is_active: true
    });
  };

  const openEditCampaign = (campaign: CRMCampaign) => {
    setCampaignForm({
      id: campaign.id,
      name: campaign.name,
      campaign_type: campaign.campaign_type,
      target_segments: campaign.target_segments,
      trigger_type: campaign.trigger_type,
      subject: campaign.content?.subject || '',
      content: campaign.content?.body || '',
      scheduled_at: campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : '',
      is_active: campaign.is_active
    });
    setEditCampaignModal(campaign.id);
  };

  const openViewSegment = async (segmentId: string) => {
    await loadSegmentUsers(segmentId);
    setViewSegmentModal(segmentId);
  };

  // Component helpers
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      'pending': 'secondary',
      'sent': 'default',
      'delivered': 'secondary',
      'opened': 'default',
      'clicked': 'default',
      'failed': 'destructive',
      'active': 'default',
      'inactive': 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'active' ? 'Aktif' : status === 'inactive' ? 'Pasif' : status}
      </Badge>
    );
  };

  // Load data on mount
  useEffect(() => {
    loadSegments();
    loadCampaigns();
    loadDeliveries();
  }, []);

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              CRM & Kampanya Yönetimi
            </h1>
            <p className="text-muted-foreground">
              Kullanıcı segmentleri ve otomatik kampanyalar
            </p>
          </div>
        </div>

        <Tabs defaultValue="segments" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="segments">Segmentler</TabsTrigger>
            <TabsTrigger value="campaigns">Kampanyalar</TabsTrigger>
            <TabsTrigger value="deliveries">Teslimatlar</TabsTrigger>
            <TabsTrigger value="automation">Otomasyon</TabsTrigger>
          </TabsList>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Kullanıcı Segmentleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {segments.map((segment) => (
                    <Card key={segment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{segment.name}</h3>
                          <Badge variant={segment.is_active ? "default" : "secondary"}>
                            {segment.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {segment.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openViewSegment(segment.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditSegmentModal(segment.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => {
                resetCampaignForm();
                setCreateCampaignModal(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kampanya
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Kampanya Listesi</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kampanya</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {campaign.campaign_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={campaign.is_active ? 'active' : 'inactive'} />
                        </TableCell>
                        <TableCell>{formatDate(campaign.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setViewCampaignModal(campaign.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditCampaign(campaign)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Kampanyayı Sil</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>İptal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCampaign(campaign.id)}>
                                    Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kampanya Teslimatları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gönderilen</p>
                          <p className="text-2xl font-bold">{deliveries.filter(d => d.delivery_status === 'sent').length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Açılan</p>
                          <p className="text-2xl font-bold">{deliveries.filter(d => d.opened_at).length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tıklanan</p>
                          <p className="text-2xl font-bold">{deliveries.filter(d => d.clicked_at).length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="text-2xl font-bold">
                            {deliveries.length > 0 
                              ? `${Math.round((deliveries.filter(d => d.clicked_at).length / deliveries.filter(d => d.opened_at).length) * 100)}%`
                              : '0%'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kampanya ID</TableHead>
                      <TableHead>Kullanıcı ID</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Gönderilme</TableHead>
                      <TableHead>Açılma</TableHead>
                      <TableHead>Tıklanma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.slice(0, 10).map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-sm">
                          {delivery.campaign_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {delivery.user_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={delivery.delivery_status} />
                        </TableCell>
                        <TableCell>
                          {delivery.sent_at ? formatDate(delivery.sent_at) : '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.opened_at ? formatDate(delivery.opened_at) : '-'}
                        </TableCell>
                        <TableCell>
                          {delivery.clicked_at ? formatDate(delivery.clicked_at) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Otomasyon Kuralları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Otomasyon kuralları yakında eklenecek...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Modal */}
        <Dialog open={createCampaignModal} onOpenChange={setCreateCampaignModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kampanya Adı</label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Kampanya adını girin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kampanya Tipi</label>
                  <Select
                    value={campaignForm.campaign_type}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, campaign_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-posta</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_app">Uygulama İçi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tetikleme Tipi</label>
                  <Select
                    value={campaignForm.trigger_type}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuel</SelectItem>
                      <SelectItem value="scheduled">Zamanlanmış</SelectItem>
                      <SelectItem value="event_based">Olay Tabanlı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {campaignForm.campaign_type === 'email' && (
                <div>
                  <label className="text-sm font-medium">Konu</label>
                  <Input
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    placeholder="E-posta konusu"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">İçerik</label>
                <Textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  placeholder="Kampanya içeriğini girin"
                  rows={6}
                />
              </div>

              {campaignForm.trigger_type === 'scheduled' && (
                <div>
                  <label className="text-sm font-medium">Zamanlama</label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduled_at}
                    onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is_active" 
                  checked={campaignForm.is_active}
                  onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, is_active: checked as boolean })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Kampanyayı aktif olarak oluştur
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateCampaignModal(false)}>
                İptal
              </Button>
              <Button onClick={createCampaign} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Kampanya Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Campaign Modal */}
        <Dialog open={!!editCampaignModal} onOpenChange={() => setEditCampaignModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kampanya Düzenle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kampanya Adı</label>
                <Input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="Kampanya adını girin"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kampanya Tipi</label>
                  <Select
                    value={campaignForm.campaign_type}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, campaign_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">E-posta</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in_app">Uygulama İçi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tetikleme Tipi</label>
                  <Select
                    value={campaignForm.trigger_type}
                    onValueChange={(value) => setCampaignForm({ ...campaignForm, trigger_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuel</SelectItem>
                      <SelectItem value="scheduled">Zamanlanmış</SelectItem>
                      <SelectItem value="event_based">Olay Tabanlı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {campaignForm.campaign_type === 'email' && (
                <div>
                  <label className="text-sm font-medium">Konu</label>
                  <Input
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    placeholder="E-posta konusu"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">İçerik</label>
                <Textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  placeholder="Kampanya içeriğini girin"
                  rows={6}
                />
              </div>

              {campaignForm.trigger_type === 'scheduled' && (
                <div>
                  <label className="text-sm font-medium">Zamanlama</label>
                  <Input
                    type="datetime-local"
                    value={campaignForm.scheduled_at}
                    onChange={(e) => setCampaignForm({ ...campaignForm, scheduled_at: e.target.value })}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit_is_active" 
                  checked={campaignForm.is_active}
                  onCheckedChange={(checked) => setCampaignForm({ ...campaignForm, is_active: checked as boolean })}
                />
                <label htmlFor="edit_is_active" className="text-sm font-medium">
                  Kampanya aktif
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCampaignModal(null)}>
                İptal
              </Button>
              <Button onClick={updateCampaign} disabled={loading}>
                <Edit className="h-4 w-4 mr-2" />
                Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Segment Modal */}
        <Dialog open={!!viewSegmentModal} onOpenChange={() => setViewSegmentModal(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Segment Detayları</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {viewSegmentModal && (
                <>
                  {(() => {
                    const segment = segments.find(s => s.id === viewSegmentModal);
                    return segment ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{segment.name}</h3>
                        <p className="text-muted-foreground mb-4">{segment.description}</p>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">Segment Üyeleri ({segmentUsers.length})</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Ad Soyad</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Kayıt Tarihi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {segmentUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    {user.first_name || user.last_name 
                                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                      : '-'
                                    }
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                      {user.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{formatDate(user.created_at)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewSegmentModal(null)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Campaign Modal */}
        <Dialog open={!!viewCampaignModal} onOpenChange={() => setViewCampaignModal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kampanya Detayları</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {viewCampaignModal && (
                <>
                  {(() => {
                    const campaign = campaigns.find(c => c.id === viewCampaignModal);
                    return campaign ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Kampanya Adı</label>
                          <p className="text-lg font-semibold">{campaign.name}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tip</label>
                            <p>{campaign.campaign_type}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Tetikleme</label>
                            <p>{campaign.trigger_type}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Durum</label>
                          <div className="mt-1">
                            <StatusBadge status={campaign.is_active ? 'active' : 'inactive'} />
                          </div>
                        </div>

                        {campaign.content?.subject && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Konu</label>
                            <p>{campaign.content.subject}</p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">İçerik</label>
                          <div className="mt-1 p-3 bg-muted rounded-md">
                            <p className="whitespace-pre-wrap">{campaign.content?.body || 'İçerik bulunamadı'}</p>
                          </div>
                        </div>

                        {campaign.scheduled_at && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Zamanlanmış</label>
                            <p>{formatDate(campaign.scheduled_at)}</p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Oluşturulma</label>
                          <p>{formatDate(campaign.created_at)}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewCampaignModal(null)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default AdminCRM;