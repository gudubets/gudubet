import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  TrendingUp,
  Target,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';

interface LiveMatch {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score: number;
  away_score: number;
  period?: string;
  match_minute?: number;
  match_time?: string;
  sport_type: string;
  league?: string;
  status: string;
  viewers_count: number;
  is_featured: boolean;
  odds: LiveOdds[];
}

interface LiveOdds {
  id: string;
  market_type: string;
  market_name: string;
  selection: string;
  selection_name: string;
  odds_value: number;
  is_active: boolean;
}

interface MatchDetailsModalProps {
  match: LiveMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  isOpen,
  onClose
}) => {
  if (!match) return null;

  const getSportIcon = (sportType: string) => {
    switch (sportType) {
      case 'futbol': return '⚽';
      case 'basketbol': return '🏀';
      case 'tenis': return '🎾';
      case 'e-spor': return '🎮';
      default: return '🎯';
    }
  };

  const getTeamLogo = (logo?: string) => {
    return logo || getSportIcon(match.sport_type);
  };

  // Group odds by market type
  const groupedOdds = match.odds.reduce((acc, odds) => {
    if (!acc[odds.market_name]) {
      acc[odds.market_name] = [];
    }
    acc[odds.market_name].push(odds);
    return acc;
  }, {} as Record<string, LiveOdds[]>);

  // Mock statistics - in a real app, these would come from the API
  const mockStats = {
    possession: { home: 65, away: 35 },
    shots: { home: 8, away: 4 },
    shotsOnTarget: { home: 3, away: 2 },
    corners: { home: 5, away: 2 },
    fouls: { home: 7, away: 12 },
    yellowCards: { home: 1, away: 3 },
    redCards: { home: 0, away: 0 }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maç Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{match.league}</Badge>
                  <Badge variant="destructive" className="animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    {match.match_time || `${match.match_minute}'`}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{match.viewers_count.toLocaleString()} izleyici</span>
                </div>
              </div>

              {/* Teams and Score */}
              <div className="grid grid-cols-3 items-center gap-4">
                {/* Home Team */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{getTeamLogo(match.home_team_logo)}</div>
                  <h3 className="font-bold text-lg">{match.home_team}</h3>
                </div>
                
                {/* Score */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {match.home_score} - {match.away_score}
                  </div>
                  {match.period && (
                    <Badge variant="secondary">{match.period}</Badge>
                  )}
                </div>
                
                {/* Away Team */}
                <div className="text-center">
                  <div className="text-4xl mb-2">{getTeamLogo(match.away_team_logo)}</div>
                  <h3 className="font-bold text-lg">{match.away_team}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="odds" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="odds">
                <TrendingUp className="w-4 h-4 mr-2" />
                Oranlar
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                İstatistikler
              </TabsTrigger>
              <TabsTrigger value="live">
                <Activity className="w-4 h-4 mr-2" />
                Canlı Takip
              </TabsTrigger>
            </TabsList>

            {/* Odds Tab */}
            <TabsContent value="odds" className="space-y-4">
              {Object.entries(groupedOdds).map(([marketName, odds]) => (
                <Card key={marketName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{marketName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {odds.map((odd) => (
                        <Button
                          key={odd.id}
                          variant="outline"
                          className="h-16 flex flex-col gap-1 hover:bg-primary hover:text-primary-foreground"
                        >
                          <span className="text-sm font-medium">{odd.selection_name}</span>
                          <span className="text-lg font-bold">{odd.odds_value.toFixed(2)}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maç İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Possession */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Top Kontrolü</span>
                      <span className="text-sm text-muted-foreground">
                        {mockStats.possession.home}% - {mockStats.possession.away}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${mockStats.possession.home}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Other Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.shots.home}</div>
                      <div className="text-sm text-muted-foreground">Şut</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.shots.away}</div>
                      <div className="text-sm text-muted-foreground">Şut</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.shotsOnTarget.home}</div>
                      <div className="text-sm text-muted-foreground">İsabetli Şut</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.shotsOnTarget.away}</div>
                      <div className="text-sm text-muted-foreground">İsabetli Şut</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.corners.home}</div>
                      <div className="text-sm text-muted-foreground">Korner</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{mockStats.corners.away}</div>
                      <div className="text-sm text-muted-foreground">Korner</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Live Updates Tab */}
            <TabsContent value="live" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Canlı Olaylar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock live events */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        ⚽
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">GOL! {match.home_team}</p>
                        <p className="text-sm text-muted-foreground">34. dakika</p>
                      </div>
                      <Badge variant="outline">{match.home_score}-{match.away_score}</Badge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        🟨
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Sarı Kart - {match.away_team}</p>
                        <p className="text-sm text-muted-foreground">29. dakika</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        ⚡
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Oyun Başladı</p>
                        <p className="text-sm text-muted-foreground">1. dakika</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchDetailsModal;
