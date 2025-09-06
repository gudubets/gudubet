import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  PlayCircle,
  Star,
  Eye
} from 'lucide-react';

const LiveScoresSection = () => {
  const liveMatches = [
    {
      id: 1,
      homeTeam: 'Real Madrid',
      awayTeam: 'Barcelona',
      homeScore: 2,
      awayScore: 1,
      minute: '78\'',
      league: 'La Liga',
      viewers: '125K',
      odds: { home: 1.45, draw: 4.20, away: 6.50 },
      isLive: true
    },
    {
      id: 2,
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      homeScore: 0,
      awayScore: 0,
      minute: '23\'',
      league: 'Premier League',
      viewers: '98K',
      odds: { home: 2.10, draw: 3.30, away: 3.40 },
      isLive: true
    },
    {
      id: 3,
      homeTeam: 'PSG',
      awayTeam: 'Bayern Munich',
      homeScore: 1,
      awayScore: 2,
      minute: 'HT',
      league: 'Champions League',
      viewers: '156K',
      odds: { home: 2.85, draw: 3.60, away: 2.30 },
      isLive: false
    }
  ];

  const upcomingMatches = [
    {
      id: 4,
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahçe',
      time: '21:45',
      date: 'Bugün',
      league: 'Süper Lig',
      odds: { home: 1.85, draw: 3.20, away: 4.50 }
    },
    {
      id: 5,
      homeTeam: 'Beşiktaş',
      awayTeam: 'Trabzonspor',
      time: '19:00',
      date: 'Yarın',
      league: 'Süper Lig',
      odds: { home: 2.10, draw: 3.10, away: 3.60 }
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Matches */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-gaming font-bold">
                <span className="gradient-text-primary">Canlı Maçlar</span>
              </h2>
              <Badge variant="destructive" className="live-indicator">
                <PlayCircle className="w-3 h-3 mr-1" />
                CANLI
              </Badge>
            </div>

            <div className="space-y-4">
              {liveMatches.map((match) => (
                <Card key={match.id} className="gaming-card-premium p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {match.league}
                      </Badge>
                      {match.isLive ? (
                        <Badge variant="destructive" className="live-indicator">
                          <Clock className="w-3 h-3 mr-1" />
                          {match.minute}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {match.minute}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-3 h-3" />
                        {match.viewers}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Teams and Score */}
                  <div className="grid grid-cols-3 items-center gap-4 mb-6">
                    <div className="text-right">
                      <h3 className="font-semibold text-lg">{match.homeTeam}</h3>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-gaming font-bold">
                        {match.homeScore} - {match.awayScore}
                      </div>
                    </div>
                    
                    <div className="text-left">
                      <h3 className="font-semibold text-lg">{match.awayTeam}</h3>
                    </div>
                  </div>

                  {/* Betting Odds */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" className="h-12 gaming-hover">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Ev Sahibi</div>
                        <div className="font-bold text-primary">{match.odds.home}</div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 gaming-hover">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Beraberlik</div>
                        <div className="font-bold text-primary">{match.odds.draw}</div>
                      </div>
                    </Button>
                    <Button variant="outline" size="sm" className="h-12 gaming-hover">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Deplasman</div>
                        <div className="font-bold text-primary">{match.odds.away}</div>
                      </div>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button className="w-full mt-6 bg-gradient-primary hover:opacity-90">
              Tüm Canlı Maçları Gör
            </Button>
          </div>

          {/* Upcoming Matches & Stats */}
          <div className="space-y-8">
            {/* Upcoming Matches */}
            <div>
              <h3 className="text-xl font-bold mb-4">Yaklaşan Maçlar</h3>
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <Card key={match.id} className="gaming-card p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline">{match.league}</Badge>
                        <span className="text-muted-foreground">
                          {match.date} {match.time}
                        </span>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-semibold">
                          {match.homeTeam} vs {match.awayTeam}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                          <span className="text-xs font-semibold">{match.odds.home}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                          <span className="text-xs font-semibold">{match.odds.draw}</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                          <span className="text-xs font-semibold">{match.odds.away}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Today's Stats */}
            <Card className="gaming-card p-6">
              <h3 className="text-lg font-bold mb-4">Günün İstatistikleri</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toplam Maç</span>
                  <span className="font-bold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Canlı Maç</span>
                  <span className="font-bold text-destructive">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toplam Bahis</span>
                  <span className="font-bold text-success">₺2.4M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">En Yüksek Oran</span>
                  <span className="font-bold text-gold">12.50</span>
                </div>
              </div>
            </Card>

            {/* Trending */}
            <Card className="gaming-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Trend Olanlar</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">El Clasico</span>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    125K
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Premier League</span>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    98K
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Süper Lig</span>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    67K
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveScoresSection;