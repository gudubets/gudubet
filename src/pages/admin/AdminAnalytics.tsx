import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useI18n } from '@/hooks/useI18n';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

const AdminAnalytics = () => {
  const { 
    loading, 
    kpis, 
    dailyMetrics, 
    loadKPIs, 
    loadDailyMetrics, 
    calculateDailyMetrics 
  } = useAnalytics();
  const { t, formatCurrency, formatNumber } = useI18n();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadKPIs();
    loadDailyMetrics(selectedPeriod);
  }, [loadKPIs, loadDailyMetrics, selectedPeriod]);

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    try {
      await calculateDailyMetrics();
      await loadKPIs();
    } finally {
      setRefreshing(false);
    }
  };

  const chartData = dailyMetrics.map(metric => ({
    date: new Date(metric.metric_date).toLocaleDateString('tr-TR'),
    dau: metric.dau,
    deposits: Number(metric.total_deposits),
    withdrawals: Number(metric.total_withdrawals),
    ggr: Number(metric.ggr),
    sessions: metric.game_sessions,
    newUsers: metric.new_registrations
  }));

  const revenueData = dailyMetrics.slice(-7).map(metric => ({
    name: new Date(metric.metric_date).toLocaleDateString('tr-TR', { weekday: 'short' }),
    ggr: Number(metric.ggr),
    ngr: Number(metric.ngr),
    deposits: Number(metric.total_deposits),
    withdrawals: Number(metric.total_withdrawals)
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t('analytics', 'Analytics & Reports')}
            </h1>
            <p className="text-muted-foreground">
              Real-time dashboard ve KPI takibi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMetrics}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Rapor İndir
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrele
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</p>
                    <p className="text-3xl font-bold">{formatNumber(kpis.total_users)}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    +{formatNumber(kpis.new_users_today)} bugün
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Kullanıcı (30g)</p>
                    <p className="text-3xl font-bold">{formatNumber(kpis.active_users_30d)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2">
                  <Progress 
                    value={(kpis.active_users_30d / kpis.total_users) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">GGR (30g)</p>
                    <p className="text-3xl font-bold">{formatCurrency(Number(kpis.ggr_30d))}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-green-600">
                    NGR: {formatCurrency(Number(kpis.ngr_30d))}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Aktif Oturum</p>
                    <p className="text-3xl font-bold">{formatNumber(kpis.active_sessions)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Ort. Depozito: {formatCurrency(Number(kpis.avg_deposit_amount))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="revenue">Gelir</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="gaming">Oyun</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Günlük Aktif Kullanıcı Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="dau" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Günlük Aktif Kullanıcı"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yeni Kullanıcı Kayıtları</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="newUsers" 
                        fill="hsl(var(--secondary))"
                        name="Yeni Kayıt"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Haftalık Gelir Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line 
                        type="monotone" 
                        dataKey="ggr" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="GGR"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ngr" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        name="NGR"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Depozit vs Çekim</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="deposits" fill="hsl(var(--primary))" name="Depozit" />
                      <Bar dataKey="withdrawals" fill="hsl(var(--destructive))" name="Çekim" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kullanıcı Aktivitesi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="dau" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Günlük Aktif"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="newUsers" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        name="Yeni Kayıt"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Kullanıcı Segmentleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">VIP Players</span>
                      <Badge variant="secondary">15%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Rollers</span>
                      <Badge variant="secondary">8%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Regular Players</span>
                      <Badge variant="secondary">67%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dormant</span>
                      <Badge variant="destructive">10%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gaming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Oyun Oturumları</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="sessions" 
                        fill="hsl(var(--primary))"
                        name="Oturum Sayısı"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Performansı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Casino</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Live Casino</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="mt-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Sports Betting</span>
                        <span>10%</span>
                      </div>
                      <Progress value={10} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
  );
};

export default AdminAnalytics;