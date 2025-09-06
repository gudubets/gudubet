import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Target, 
  TrendingUp,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

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
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Toplam Kullanıcı',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: Users
    },
    {
      title: 'Toplam Bakiye',
      value: '₺0',
      change: '+0%',
      changeType: 'increase',
      icon: DollarSign
    },
    {
      title: 'Aktif Bahisler',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: Target
    },
    {
      title: 'Günlük İşlemler',
      value: '0',
      change: '+0%',
      changeType: 'increase',
      icon: TrendingUp
    }
  ]);

  const [chartData, setChartData] = useState<ChartData[]>([
    { date: '01/01', users: 10, transactions: 5 },
    { date: '02/01', users: 15, transactions: 8 },
    { date: '03/01', users: 22, transactions: 12 },
    { date: '04/01', users: 28, transactions: 18 },
    { date: '05/01', users: 35, transactions: 25 },
    { date: '06/01', users: 42, transactions: 30 },
    { date: '07/01', users: 50, transactions: 35 }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Load total balance
      const { data: balanceData } = await supabase
        .from('users')
        .select('balance');

      const totalBalance = balanceData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;

      // Load active bets
      const { count: activeBets } = await supabase
        .from('betslips')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Load daily transactions
      const today = new Date().toISOString().split('T')[0];
      const { count: dailyTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats([
        {
          title: 'Toplam Kullanıcı',
          value: userCount?.toString() || '0',
          change: '+12%',
          changeType: 'increase',
          icon: Users
        },
        {
          title: 'Toplam Bakiye',
          value: `₺${totalBalance.toLocaleString('tr-TR')}`,
          change: '+8%',
          changeType: 'increase',
          icon: DollarSign
        },
        {
          title: 'Aktif Bahisler',
          value: activeBets?.toString() || '0',
          change: '+5%',
          changeType: 'increase',
          icon: Target
        },
        {
          title: 'Günlük İşlemler',
          value: dailyTransactions?.toString() || '0',
          change: '+15%',
          changeType: 'increase',
          icon: TrendingUp
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Son güncelleme: {new Date().toLocaleString('tr-TR')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs flex items-center space-x-1">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 text-destructive" />
                  )}
                  <span className={stat.changeType === 'increase' ? 'text-success' : 'text-destructive'}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">geçen haftaya göre</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Registrations Chart */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle>Günlük Kullanıcı Kayıtları</CardTitle>
            <CardDescription>Son 7 günlük kullanıcı kayıt trendi</CardDescription>
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
            <CardDescription>Son 7 günlük işlem trendi</CardDescription>
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

      {/* Recent Activity */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son işlemler ve aktiviteler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Yeni kullanıcı kaydı', user: 'user@example.com', time: '2 dakika önce', type: 'success' },
              { action: 'Para yatırma işlemi', user: 'test@example.com', time: '5 dakika önce', type: 'info' },
              { action: 'Bahis kupon oluşturma', user: 'bettor@example.com', time: '8 dakika önce', type: 'info' },
              { action: 'Para çekme talebi', user: 'winner@example.com', time: '12 dakika önce', type: 'warning' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-success' :
                    activity.type === 'warning' ? 'bg-warning' :
                    'bg-primary'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;