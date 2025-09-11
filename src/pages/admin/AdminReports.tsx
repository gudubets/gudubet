import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar 
} from 'recharts';
import { TrendingUp, DollarSign, Gift, Users } from 'lucide-react';

interface PaymentDaily {
  payment_date: string;
  transaction_count: number;
  total_amount: number;
  successful_count: number;
  successful_amount: number;
  avg_amount: number;
}

interface BonusKPI {
  bonus_date: string;
  total_bonuses: number;
  active_bonuses: number;
  completed_bonuses: number;
  total_bonus_amount: number;
  completed_bonus_amount: number;
}

interface BonusCost {
  bonus_name: string;
  times_granted: number;
  total_cost: number;
  avg_cost_per_grant: number;
  completed_count: number;
}

export default function AdminReports() {
  // Fetch daily payment metrics
  const { data: paymentsDaily, isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentsDaily'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_payments_daily')
        .select('*')
        .order('payment_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as PaymentDaily[];
    },
  });

  // Fetch bonus KPIs
  const { data: bonusKPIs, isLoading: bonusLoading } = useQuery({
    queryKey: ['bonusKPIs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bonus_kpis')
        .select('*')
        .order('bonus_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as BonusKPI[];
    },
  });

  // Fetch bonus costs
  const { data: bonusCosts, isLoading: costsLoading } = useQuery({
    queryKey: ['bonusCosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_bonus_costs')
        .select('*')
        .limit(10);

      if (error) throw error;
      return data as BonusCost[];
    },
  });

  // Calculate summary metrics
  const totalPayments = paymentsDaily?.reduce((sum, day) => sum + (day.successful_amount || 0), 0) || 0;
  const totalBonusCost = bonusCosts?.reduce((sum, bonus) => sum + (bonus.total_cost || 0), 0) || 0;
  const avgDailyPayments = paymentsDaily?.length ? totalPayments / paymentsDaily.length : 0;
  const totalActiveBonuses = bonusKPIs?.[0]?.active_bonuses || 0;

  // Prepare chart data (reverse for chronological order)
  const chartData = paymentsDaily?.slice().reverse().map(day => ({
    date: new Date(day.payment_date).toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    amount: day.successful_amount || 0,
    count: day.successful_count || 0
  })) || [];

  const bonusChartData = bonusKPIs?.slice().reverse().map(day => ({
    date: new Date(day.bonus_date).toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    amount: day.total_bonus_amount || 0,
    count: day.total_bonuses || 0
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Operations dashboard with key performance indicators
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{totalPayments.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ₺{avgDailyPayments.toLocaleString('tr-TR')}/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonus Costs</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{totalBonusCost.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total granted bonuses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bonuses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveBonuses}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bonusCosts?.length ? 
                ((bonusCosts.reduce((sum, b) => sum + (b.completed_count || 0), 0) / 
                  bonusCosts.reduce((sum, b) => sum + (b.times_granted || 0), 0)) * 100).toFixed(1) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Bonus completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Deposits Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Deposits (Last 30 Days)</CardTitle>
          <CardDescription>
            Daily deposit amounts and transaction counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              Loading chart data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `₺${Number(value).toLocaleString('tr-TR')}` : value,
                    name === 'amount' ? 'Amount' : 'Count'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="amount"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bonus KPIs Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Bonus Activity</CardTitle>
          <CardDescription>
            Bonus grants and completion trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bonusLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              Loading bonus data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bonusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'amount' ? `₺${Number(value).toLocaleString('tr-TR')}` : value,
                    name === 'amount' ? 'Amount' : 'Count'
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bonus Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bonus Performance</CardTitle>
          <CardDescription>
            Cost analysis and performance metrics by bonus type
          </CardDescription>
        </CardHeader>
        <CardContent>
          {costsLoading ? (
            <div className="py-8 text-center">Loading bonus costs...</div>
          ) : !bonusCosts?.length ? (
            <div className="py-8 text-center text-muted-foreground">
              No bonus data available
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bonus Name</TableHead>
                  <TableHead className="text-right">Times Granted</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Completed</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bonusCosts.map((bonus, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bonus.bonus_name}</TableCell>
                    <TableCell className="text-right">{bonus.times_granted || 0}</TableCell>
                    <TableCell className="text-right">
                      ₺{(bonus.total_cost || 0).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      ₺{(bonus.avg_cost_per_grant || 0).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">{bonus.completed_count || 0}</TableCell>
                    <TableCell className="text-right">
                      {bonus.times_granted ? 
                        ((bonus.completed_count || 0) / bonus.times_granted * 100).toFixed(1) 
                        : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}