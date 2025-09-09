import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import AdminLayout from '@/components/admin/AdminLayout';
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
  Bell
} from 'lucide-react';

interface UserSegment {
  id: string;
  name: string;
  slug: string;
  description: string;
  conditions: any;
  is_active: boolean;
  created_at: string;
}

interface CRMCampaign {
  id: string;
  name: string;
  campaign_type: string;
  target_segments: string[];
  trigger_type: string;
  content: any;
  is_active: boolean;
  created_at: string;
  scheduled_at?: string;
}

interface CampaignDelivery {
  id: string;
  campaign_id: string;
  user_id: string;
  delivery_status: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
}

const AdminCRM = () => {
  const { toast } = useToast();
  const { t, formatDate } = useI18n();
  
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [deliveries, setDeliveries] = useState<CampaignDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  
  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    campaign_type: 'email',
    target_segments: [] as string[],
    trigger_type: 'manual',
    subject: '',
    content: '',
    scheduled_at: ''
  });

  // Load data
  useEffect(() => {
    loadSegments();
    loadCampaigns();
  }, []);

  const loadSegments = async () => {
    try {
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
    }
  };

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
          scheduled_at: campaignForm.scheduled_at ? new Date(campaignForm.scheduled_at).toISOString() : null
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Kampanya oluşturuldu."
      });

      setCampaignForm({
        name: '',
        campaign_type: 'email',
        target_segments: [],
        trigger_type: 'manual',
        subject: '',
        content: '',
        scheduled_at: ''
      });

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

  const getSegmentUsers = async (segmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_segment_memberships')
        .select(`
          user_id,
          users!inner(
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('segment_id', segmentId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting segment users:', error);
      return [];
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      'pending': 'secondary',
      'sent': 'default',
      'delivered': 'secondary',
      'opened': 'default',
      'clicked': 'default',
      'failed': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <AdminLayout>
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
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Görüntüle
                          </Button>
                          <Button size="sm" variant="outline">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Yeni Kampanya
                  </Button>
                </DialogTrigger>
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

                    <div className="flex gap-2">
                      <Button onClick={createCampaign} disabled={loading}>
                        <Send className="h-4 w-4 mr-2" />
                        Kampanya Oluştur
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                          <p className="text-2xl font-bold">1,245</p>
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
                          <p className="text-2xl font-bold">892</p>
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
                          <p className="text-2xl font-bold">234</p>
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
                          <p className="text-2xl font-bold">18.8%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-center text-muted-foreground py-8">
                  Teslimat detayları yüklenecek...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Otomatik Kampanyalar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Hoş Geldin Serisi</h3>
                      <p className="text-sm text-muted-foreground">
                        Yeni kayıt olan kullanıcılara otomatik hoş geldin e-postası
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Aktif</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">İlk Depozit Bonusu</h3>
                      <p className="text-sm text-muted-foreground">
                        İlk depozit sonrası bonus hatırlatması
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Aktif</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                    <div>
                      <h3 className="font-semibold">Dormant Kullanıcı</h3>
                      <p className="text-sm text-muted-foreground">
                        30 gün boyunca giriş yapmayan kullanıcılara geri dönüş kampanyası
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pasif</Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminCRM;