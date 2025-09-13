import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  created_at: string;
}

const RecentActivityCard = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    setupRealtimeSubscription();
  }, []);

  const loadActivities = async () => {
    try {
      // Get recent user registrations
      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent deposits (from deposits table)
      const { data: deposits } = await supabase
        .from('deposits')
        .select('id, amount, created_at, user_id, status')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('id, amount, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent bonus requests
      const { data: bonusRequests } = await supabase
        .from('bonus_requests')
        .select('id, bonus_type, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      // Collect all user IDs
      const userIds = new Set<string>();
      deposits?.forEach(d => userIds.add(d.user_id));
      payments?.forEach(p => userIds.add(p.user_id));
      withdrawals?.forEach(w => userIds.add(w.user_id));
      bonusRequests?.forEach(b => userIds.add(b.user_id));

      // Get user profiles
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', Array.from(userIds));

      // Create user profiles map for easy lookup
      const userProfilesMap = new Map();
      userProfiles?.forEach(profile => {
        userProfilesMap.set(profile.id, profile);
      });

      // Combine all activities
      const allActivities: Activity[] = [];

      // Add user registrations
      newUsers?.forEach(user => {
        const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'İsimsiz Kullanıcı';
        allActivities.push({
          id: `user_${user.id}`,
          action: 'Yeni kullanıcı kaydı',
          user: userName,
          time: formatDistanceToNow(new Date(user.created_at), { 
            addSuffix: true,
            locale: tr
          }),
          type: 'success',
          created_at: user.created_at
        });
      });

      // Add deposits (from deposits table)
      deposits?.forEach(deposit => {
        const profile = userProfilesMap.get(deposit.user_id);
        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'İsimsiz Kullanıcı' : 'İsimsiz Kullanıcı';
        allActivities.push({
          id: `deposit_${deposit.id}`,
          action: `Para yatırma: ${deposit.amount} TL`,
          user: userName,
          time: formatDistanceToNow(new Date(deposit.created_at), { 
            addSuffix: true,
            locale: tr
          }),
          type: 'info',
          created_at: deposit.created_at
        });
      });

      // Add payments
      payments?.forEach(payment => {
        const profile = userProfilesMap.get(payment.user_id);
        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'İsimsiz Kullanıcı' : 'İsimsiz Kullanıcı';
        allActivities.push({
          id: `payment_${payment.id}`,
          action: `Para yatırma: ${payment.amount} TL`,
          user: userName,
          time: formatDistanceToNow(new Date(payment.created_at), { 
            addSuffix: true,
            locale: tr
          }),
          type: 'info',
          created_at: payment.created_at
        });
      });

      // Add withdrawals
      withdrawals?.forEach(withdrawal => {
        const profile = userProfilesMap.get(withdrawal.user_id);
        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'İsimsiz Kullanıcı' : 'İsimsiz Kullanıcı';
        allActivities.push({
          id: `withdrawal_${withdrawal.id}`,
          action: `Para çekme talebi: ${withdrawal.amount} TL`,
          user: userName,
          time: formatDistanceToNow(new Date(withdrawal.created_at), { 
            addSuffix: true,
            locale: tr
          }),
          type: 'warning',
          created_at: withdrawal.created_at
        });
      });

      // Add bonus requests
      bonusRequests?.forEach(request => {
        const profile = userProfilesMap.get(request.user_id);
        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'İsimsiz Kullanıcı' : 'İsimsiz Kullanıcı';
        allActivities.push({
          id: `bonus_${request.id}`,
          action: `Bonus talebi: ${request.bonus_type}`,
          user: userName,
          time: formatDistanceToNow(new Date(request.created_at), { 
            addSuffix: true,
            locale: tr
          }),
          type: 'info',
          created_at: request.created_at
        });
      });

      // Sort by created_at and take latest 15
      allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivities(allActivities.slice(0, 15));
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Subscribe to profiles (new users)
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        loadActivities();
      })
      .subscribe();

    // Subscribe to deposits
    const depositsChannel = supabase
      .channel('deposits_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'deposits' 
      }, () => {
        loadActivities();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'deposits' 
      }, () => {
        loadActivities();
      })
      .subscribe();

    // Subscribe to payments
    const paymentsChannel = supabase
      .channel('payments_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'payments' 
      }, () => {
        loadActivities();
      })
      .subscribe();

    // Subscribe to withdrawals
    const withdrawalsChannel = supabase
      .channel('withdrawals_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'withdrawals' 
      }, () => {
        loadActivities();
      })
      .subscribe();

    // Subscribe to bonus requests
    const bonusRequestsChannel = supabase
      .channel('bonus_requests_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bonus_requests' 
      }, () => {
        loadActivities();
      })
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(depositsChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(bonusRequestsChannel);
    };
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle>Son Aktiviteler</CardTitle>
        <CardDescription>Sistemdeki son işlemler ve aktiviteler (Canlı)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Yükleniyor...</div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
            {activities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Henüz aktivite bulunmuyor
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;