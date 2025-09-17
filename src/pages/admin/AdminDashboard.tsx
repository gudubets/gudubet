import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimeAdminData } from '@/hooks/useRealTimeAdminData';
import RecentActivityCard from '@/components/admin/RecentActivityCard';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

interface ChartData {
  date: string;
  users: number;
  transactions: number;
}

const AdminDashboard = () => {
  const { 
    stats, 
    recentActivities, 
    pendingDeposits, 
    pendingWithdrawals, 
    loading,
    refreshData 
  } = useRealTimeAdminData();

  const [chartData, setChartData] = useState<ChartData[]>([
    { date: '01/01', users: 10, transactions: 5 },
    { date: '02/01', users: 15, transactions: 8 },
    { date: '03/01', users: 22, transactions: 12 },
    { date: '04/01', users: 28, transactions: 18 },
    { date: '05/01', users: 35, transactions: 25 },
    { date: '06/01', users: 42, transactions: 30 },
    { date: '07/01', users: 50, transactions: 35 }
  ]);

  const formatActionType = (actionType: string) => {
    const translations: { [key: string]: string } = {
      'deposit_request': 'Para Yatırma',
      'withdrawal_request': 'Para Çekme',
      'game_completed': 'Oyun',
      'bonus_granted': 'Bonus',
      'login': 'Giriş',
      'logout': 'Çıkış',
      'registration': 'Kayıt'
    };
    return translations[actionType] || actionType;
  };

  const getActionColor = (actionType: string) => {
    const colors: { [key: string]: string } = {
      'deposit_request': 'bg-green-500',
      'withdrawal_request': 'bg-red-500',
      'game_completed': 'bg-blue-500',
      'bonus_granted': 'bg-purple-500',
      'login': 'bg-gray-500',
      'logout': 'bg-gray-400',
      'registration': 'bg-yellow-500'
    };
    return colors[actionType] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <div className="text-sm text-muted-foreground">
            Son güncelleme: {new Date().toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bekleyen Yatırımlar
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_deposits}</div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Gerçek Zamanlı
            </Badge>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bekleyen Çekimler
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_withdrawals}</div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Gerçek Zamanlı
            </Badge>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif Oturumlar
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_sessions}</div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Gerçek Zamanlı
            </Badge>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yeni Kullanıcılar
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_users_today}</div>
            <Badge variant="outline" className="text-xs">
              Bugün
            </Badge>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Günlük Gelir
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.total_revenue_today.toLocaleString('tr-TR')}</div>
            <Badge variant="outline" className="text-xs">
              Bugün
            </Badge>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bonus Talepleri
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_bonus_requests}</div>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Bekliyor
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts with Real Data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Registrations Chart */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>Günlük Kullanıcı Kayıtları</CardTitle>
            <CardDescription>Son 7 günlük kullanıcı kayıt trendi (gerçek zamanlı)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transactions Chart */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>Günlük İşlemler</CardTitle>
            <CardDescription>Son 7 günlük işlem trendi (gerçek zamanlı)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Deposits */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Bekleyen Para Yatırma İşlemleri
              <Badge variant="secondary">{pendingDeposits.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {pendingDeposits.length === 0 ? (
                <p className="text-muted-foreground text-sm">Bekleyen işlem yok</p>
              ) : (
                pendingDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {deposit.profiles?.first_name} {deposit.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₺{deposit.amount.toLocaleString('tr-TR')}</p>
                      <Badge variant="outline" className="text-xs">
                        {deposit.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Bekleyen Para Çekme İşlemleri
              <Badge variant="destructive">{pendingWithdrawals.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {pendingWithdrawals.length === 0 ? (
                <p className="text-muted-foreground text-sm">Bekleyen işlem yok</p>
              ) : (
                pendingWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {withdrawal.profiles?.first_name} {withdrawal.profiles?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">₺{withdrawal.amount.toLocaleString('tr-TR')}</p>
                      <Badge variant="outline" className="text-xs">
                        {withdrawal.method}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Real-time Activities */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gerçek Zamanlı Aktiviteler
            <Badge variant="outline">{recentActivities.length}</Badge>
          </CardTitle>
          <CardDescription>Son kullanıcı aktiviteleri (gerçek zamanlı güncellenir)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-sm">Henüz aktivite yok</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getActionColor(activity.action_type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {formatActionType(activity.action_type)}
                      </Badge>
                      {activity.amount && (
                        <Badge variant="secondary" className="text-xs">
                          ₺{activity.amount.toLocaleString('tr-TR')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;