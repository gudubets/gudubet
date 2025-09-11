import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserDevice {
  id: string;
  user_id: string;
  device_fp: string;
  first_seen_ip: string | null;
  last_seen_ip: string | null;
  user_agent: string | null;
  platform: string | null;
  language: string | null;
  timezone: string | null;
  screen: string | null;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

interface DeviceEvent {
  id: string;
  user_id: string;
  device_fp: string;
  ip: string | null;
  event: string;
  meta: any;
  created_at: string;
}

export default function DevicesManager() {
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'devices' | 'events'>('devices');
  const { toast } = useToast();

  const loadDevices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('user_devices')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(200);

      if (userIdFilter) {
        query = query.eq('user_id', userIdFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDevices((data as UserDevice[]) || []);
    } catch (error: any) {
      console.error('Error loading devices:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load devices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('device_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (userIdFilter) {
        query = query.eq('user_id', userIdFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents((data as DeviceEvent[]) || []);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'devices') {
      loadDevices();
    } else {
      loadEvents();
    }
  }, [userIdFilter, activeTab]);

  const getPlatformIcon = (platform: string) => {
    if (platform?.toLowerCase().includes('mobile') || platform?.toLowerCase().includes('android') || platform?.toLowerCase().includes('iphone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    if (platform?.toLowerCase().includes('tablet') || platform?.toLowerCase().includes('ipad')) {
      return <Tablet className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getTrustBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-600">Trusted ({score})</Badge>;
    }
    if (score >= 50) {
      return <Badge className="bg-yellow-600">Medium ({score})</Badge>;
    }
    return <Badge variant="destructive">Risky ({score})</Badge>;
  };

  const formatFingerprint = (fp: string) => {
    return `${fp.slice(0, 8)}...${fp.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Management</h1>
        <div className="text-sm text-muted-foreground">
          Monitor user devices and activity
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>Filter devices and events by user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Filter by user ID..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => activeTab === 'devices' ? loadDevices() : loadEvents()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-4">
        <Button
          variant={activeTab === 'devices' ? 'default' : 'outline'}
          onClick={() => setActiveTab('devices')}
        >
          Devices ({devices.length})
        </Button>
        <Button
          variant={activeTab === 'events' ? 'default' : 'outline'}
          onClick={() => setActiveTab('events')}
        >
          Events ({events.length})
        </Button>
      </div>

      {/* Devices Table */}
      {activeTab === 'devices' && (
        <Card>
          <CardHeader>
            <CardTitle>User Devices</CardTitle>
            <CardDescription>All registered user devices</CardDescription>
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
                    <TableHead>User</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Screen</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {device.user_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs" title={device.device_fp}>
                          {formatFingerprint(device.device_fp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(device.platform)}
                          <span className="text-xs">{device.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTrustBadge(device.trust_score)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {device.last_seen_ip || 'Unknown'}
                          </div>
                          <div>{device.language || 'Unknown'} / {device.timezone || 'Unknown'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{device.screen || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {new Date(device.updated_at).toLocaleString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && devices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No devices found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      {activeTab === 'events' && (
        <Card>
          <CardHeader>
            <CardTitle>Device Events</CardTitle>
            <CardDescription>Recent device activity events</CardDescription>
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
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Fingerprint</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="text-xs">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {event.user_id.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.event}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {formatFingerprint(event.device_fp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">{event.ip || 'Unknown'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {event.meta?.platform && (
                            <div>Platform: {event.meta.platform}</div>
                          )}
                          {event.meta?.user_agent && (
                            <div className="truncate max-w-32" title={event.meta.user_agent}>
                              UA: {event.meta.user_agent.slice(0, 30)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {!loading && events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No events found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}