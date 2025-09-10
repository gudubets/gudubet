import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  Users, 
  DollarSign, 
  Percent,
  Calendar as CalendarIcon,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdminBonusAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });

  // Bonus overview stats
  const { data: bonusStats } = useQuery({
    queryKey: ['bonusStats', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          *,
          bonuses_new(name, type)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (error) throw error;

      const totalBonuses = data?.length || 0;
      const activeBonuses = data?.filter(b => b.status === 'active').length || 0;
      const completedBonuses = data?.filter(b => b.status === 'completed').length || 0;
      const totalValue = data?.reduce((sum, b) => sum + (b.granted_amount || 0), 0) || 0;
      const completionRate = totalBonuses > 0 ? (completedBonuses / totalBonuses) * 100 : 0;

      return {
        totalBonuses,
        activeBonuses,
        completedBonuses,
        totalValue,
        completionRate
      };
    }
  });

  // Bonus type distribution
  const { data: bonusTypeData } = useQuery({
    queryKey: ['bonusTypeDistribution', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          bonuses_new(type, name)
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (error) throw error;

      const typeCount: Record<string, number> = {};
      data?.forEach(item => {
        const type = item.bonuses_new?.type || 'unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      });

      return Object.entries(typeCount).map(([type, count]) => ({
        name: type,
        value: count
      }));
    }
  });

  // Daily bonus claims
  const { data: dailyClaimsData } = useQuery({
    queryKey: ['dailyBonusClaims', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select('created_at, granted_amount')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at');

      if (error) throw error;

      const dailyData: Record<string, { claims: number; value: number }> = {};
      
      data?.forEach(bonus => {
        const date = format(new Date(bonus.created_at), 'yyyy-MM-dd');
        if (!dailyData[date]) {
          dailyData[date] = { claims: 0, value: 0 };
        }
        dailyData[date].claims += 1;
        dailyData[date].value += bonus.granted_amount || 0;
      });

      return Object.entries(dailyData).map(([date, data]) => ({
        date,
        claims: data.claims,
        value: data.value
      }));
    }
  });

  // Top performing bonuses
  const { data: topBonuses } = useQuery({
    queryKey: ['topBonuses', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bonus_tracking')
        .select(`
          bonus_id,
          bonuses_new(name, type),
          granted_amount,
          status
        `)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (error) throw error;

      const bonusStats: Record<string, {
        name: string;
        type: string;
        claims: number;
        totalValue: number;
        completions: number;
      }> = {};

      data?.forEach(item => {
        const bonusId = item.bonus_id;
        if (!bonusStats[bonusId]) {
          bonusStats[bonusId] = {
            name: item.bonuses_new?.name || 'Unknown',
            type: item.bonuses_new?.type || 'unknown',
            claims: 0,
            totalValue: 0,
            completions: 0
          };
        }
        bonusStats[bonusId].claims += 1;
        bonusStats[bonusId].totalValue += item.granted_amount || 0;
        if (item.status === 'completed') {
          bonusStats[bonusId].completions += 1;
        }
      });

      return Object.values(bonusStats)
        .sort((a, b) => b.claims - a.claims)
        .slice(0, 10);
    }
  });

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    format?: 'number' | 'currency' | 'percentage';
  }> = ({ title, value, change, icon, format = 'number' }) => {
    const formatValue = (val: string | number) => {
      if (format === 'currency') {
        return `₺${Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
      } else if (format === 'percentage') {
        return `${Number(val).toFixed(1)}%`;
      }
      return val.toLocaleString('tr-TR');
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{formatValue(value)}</p>
              {change !== undefined && (
                <div className="flex items-center mt-1">
                  {change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonus Analitikleri</h1>
          <p className="text-muted-foreground">Bonus performansı ve kullanım istatistikleri</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(dateRange.from, 'dd MMM', { locale: tr })} - {format(dateRange.to, 'dd MMM', { locale: tr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Toplam Bonus"
          value={bonusStats?.totalBonuses || 0}
          icon={<Gift className="h-5 w-5" />}
        />
        <StatCard
          title="Aktif Bonuslar"
          value={bonusStats?.activeBonuses || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Tamamlanan"
          value={bonusStats?.completedBonuses || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Toplam Değer"
          value={bonusStats?.totalValue || 0}
          format="currency"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Tamamlanma Oranı"
          value={bonusStats?.completionRate || 0}
          format="percentage"
          icon={<Percent className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="distribution">Dağılım</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Daily Claims Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Günlük Bonus Talepleri</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyClaimsData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: tr })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="claims" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                    name="Talep Sayısı"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Bonuses */}
          <Card>
            <CardHeader>
              <CardTitle>En Popüler Bonuslar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBonuses?.map((bonus, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{bonus.name}</p>
                        <p className="text-sm text-muted-foreground">{bonus.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{bonus.claims} talep</p>
                      <p className="text-sm text-muted-foreground">
                        ₺{bonus.totalValue.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          {/* Bonus Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Bonus Türü Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bonusTypeData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bonusTypeData?.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance metrics will be added here */}
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Performans metrikleri yakında eklenecek</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};