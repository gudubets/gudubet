import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  DollarSign,
  Gamepad2,
  User,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  session_token: string;
  balance_start: number;
  balance_end: number;
  total_bet: number;
  total_win: number;
  rounds_played: number;
  started_at: string;
  ended_at: string | null;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  games?: {
    name: string;
    game_type: string;
    provider_id: string;
    game_providers?: {
      name: string;
    };
  };
}

interface GameRound {
  id: string;
  session_id: string;
  game_id: string;
  user_id: string;
  round_number: number;
  bet_amount: number;
  win_amount: number;
  balance_before: number;
  balance_after: number;
  played_at: string;
  status: string;
  external_round_id: string;
  game_result: any;
}

const AdminGameSessions = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [rounds, setRounds] = useState<GameRound[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showRounds, setShowRounds] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadGameSessions();
  }, [dateFilter, gameFilter, statusFilter]);

  const loadGameSessions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('game_sessions')
        .select(`
          *,
          users:user_id(first_name, last_name, email, username),
          games:game_id(
            name, 
            game_type, 
            provider_id,
            game_providers:provider_id(name)
          )
        `)
        .order('started_at', { ascending: false });

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('started_at', startDate.toISOString());
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions((data as GameSession[]) || []);
    } catch (error) {
      console.error('Error loading game sessions:', error);
      toast({
        title: "Hata",
        description: "Oyun seansları yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGameRounds = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('session_id', sessionId)
        .order('played_at', { ascending: false });

      if (error) throw error;
      setRounds(data || []);
      setSelectedSession(sessionId);
      setShowRounds(true);
    } catch (error) {
      console.error('Error loading game rounds:', error);
      toast({
        title: "Hata",
        description: "Oyun turları yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const filteredSessions = sessions.filter(session => {
    const userEmail = session.users?.email || '';
    const userName = `${session.users?.first_name || ''} ${session.users?.last_name || ''}`.trim();
    const gameName = session.games?.name || '';
    
    const matchesSearch = 
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_token.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGame = gameFilter === 'all' || session.games?.game_type === gameFilter;
    
    return matchesSearch && matchesGame;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary">Tamamlandı</Badge>;
      case 'abandoned':
        return <Badge variant="destructive">Terk Edildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'Devam ediyor';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}s ${diffMins % 60}dk`;
    }
    return `${diffMins}dk`;
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Kullanıcı,Oyun,Oturum ID,Başlangıç Bakiye,Bitiş Bakiye,Toplam Bahis,Toplam Kazanç,Tur Sayısı,Başlama Zamanı,Bitiş Zamanı,Durum,IP Adresi\n"
      + filteredSessions.map(session => 
          `"${session.users?.email}","${session.games?.name}","${session.session_token}","${session.balance_start}","${session.balance_end || ''}","${session.total_bet}","${session.total_win}","${session.rounds_played}","${new Date(session.started_at).toLocaleString('tr-TR')}","${session.ended_at ? new Date(session.ended_at).toLocaleString('tr-TR') : 'Devam ediyor'}","${session.status}","${session.ip_address || ''}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `oyun_seansları_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-gaming font-bold">Oyun Aktivite Takibi</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={exportData} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            CSV İndir
          </Button>
          <div className="text-sm text-muted-foreground">
            Toplam {sessions.length} seans
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif Seanslar
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Bahis
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{sessions.reduce((sum, s) => sum + (s.total_bet || 0), 0).toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Kazanç
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{sessions.reduce((sum, s) => sum + (s.total_win || 0), 0).toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Tur
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, s) => sum + (s.rounds_played || 0), 0).toLocaleString('tr-TR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Oyun seanslarını filtrele ve ara</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Kullanıcı, oyun veya token ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tarih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Son 7 gün</SelectItem>
                <SelectItem value="month">Son 30 gün</SelectItem>
                <SelectItem value="all">Tümü</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Oyun Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Oyunlar</SelectItem>
                <SelectItem value="slot">Slot</SelectItem>
                <SelectItem value="casino">Casino</SelectItem>
                <SelectItem value="live">Canlı Casino</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="abandoned">Terk Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Game Sessions Table */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Oyun Seansları</CardTitle>
          <CardDescription>
            Detaylı oyun seans bilgileri ve kullanıcı aktiviteleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Oyun</TableHead>
                  <TableHead>Seans ID</TableHead>
                  <TableHead>Başlangıç Bakiye</TableHead>
                  <TableHead>Toplam Bahis</TableHead>
                  <TableHead>Toplam Kazanç</TableHead>
                  <TableHead>Tur Sayısı</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Başlama Zamanı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {session.users?.username || `${session.users?.first_name || ''} ${session.users?.last_name || ''}`.trim() || 'Bilinmiyor'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.users?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.games?.name || 'Bilinmiyor'}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.games?.game_providers?.name} - {session.games?.game_type}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {session.session_token.substring(0, 8)}...
                    </TableCell>
                    <TableCell>₺{session.balance_start?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>₺{session.total_bet?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>₺{session.total_win?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{session.rounds_played}</TableCell>
                    <TableCell>{formatDuration(session.started_at, session.ended_at)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(session.started_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.started_at).toLocaleTimeString('tr-TR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session.status)}</TableCell>
                    <TableCell className="text-xs">
                      {session.ip_address || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadGameRounds(session.id)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Turları Gör
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Oyun seansı bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Rounds Modal/Section */}
      {showRounds && selectedSession && (
        <Card className="gaming-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Oyun Turları</CardTitle>
                <CardDescription>Seans ID: {selectedSession}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowRounds(false)}>
                Kapat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tur No</TableHead>
                  <TableHead>Bahis Tutarı</TableHead>
                  <TableHead>Kazanç</TableHead>
                  <TableHead>Önceki Bakiye</TableHead>
                  <TableHead>Sonraki Bakiye</TableHead>
                  <TableHead>Oynama Zamanı</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => (
                  <TableRow key={round.id}>
                    <TableCell>#{round.round_number}</TableCell>
                    <TableCell>₺{round.bet_amount?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell className={round.win_amount > 0 ? 'text-success' : ''}>
                      ₺{round.win_amount?.toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell>₺{round.balance_before?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>₺{round.balance_after?.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {new Date(round.played_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(round.played_at).toLocaleTimeString('tr-TR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(round.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminGameSessions;