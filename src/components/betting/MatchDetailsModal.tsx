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

  // Group odds by market type with expanded betting markets
  const expandedOdds: LiveOdds[] = [
    // Match Result (1X2)
    { id: '1', market_type: '1X2', market_name: 'Maç Sonucu', selection: '1', selection_name: match.home_team, odds_value: 2.45, is_active: true },
    { id: '2', market_type: '1X2', market_name: 'Maç Sonucu', selection: 'X', selection_name: 'Beraberlik', odds_value: 3.20, is_active: true },
    { id: '3', market_type: '1X2', market_name: 'Maç Sonucu', selection: '2', selection_name: match.away_team, odds_value: 2.85, is_active: true },
    
    // Double Chance
    { id: '4', market_type: 'DC', market_name: 'Çifte Şans', selection: '1X', selection_name: `${match.home_team} veya Beraberlik`, odds_value: 1.32, is_active: true },
    { id: '5', market_type: 'DC', market_name: 'Çifte Şans', selection: '12', selection_name: `${match.home_team} veya ${match.away_team}`, odds_value: 1.24, is_active: true },
    { id: '6', market_type: 'DC', market_name: 'Çifte Şans', selection: 'X2', selection_name: `Beraberlik veya ${match.away_team}`, odds_value: 1.58, is_active: true },
    
    // Over/Under 2.5 Goals
    { id: '7', market_type: 'O/U', market_name: 'Toplam Gol 2.5', selection: 'Over', selection_name: 'Üst 2.5', odds_value: 1.85, is_active: true },
    { id: '8', market_type: 'O/U', market_name: 'Toplam Gol 2.5', selection: 'Under', selection_name: 'Alt 2.5', odds_value: 1.95, is_active: true },
    
    // Over/Under 1.5 Goals
    { id: '9', market_type: 'O/U1.5', market_name: 'Toplam Gol 1.5', selection: 'Over', selection_name: 'Üst 1.5', odds_value: 1.25, is_active: true },
    { id: '10', market_type: 'O/U1.5', market_name: 'Toplam Gol 1.5', selection: 'Under', selection_name: 'Alt 1.5', odds_value: 3.75, is_active: true },
    
    // Over/Under 3.5 Goals
    { id: '11', market_type: 'O/U3.5', market_name: 'Toplam Gol 3.5', selection: 'Over', selection_name: 'Üst 3.5', odds_value: 3.45, is_active: true },
    { id: '12', market_type: 'O/U3.5', market_name: 'Toplam Gol 3.5', selection: 'Under', selection_name: 'Alt 3.5', odds_value: 1.28, is_active: true },
    
    // Both Teams to Score
    { id: '13', market_type: 'BTTS', market_name: 'Karşılıklı Gol', selection: 'Yes', selection_name: 'Evet', odds_value: 1.65, is_active: true },
    { id: '14', market_type: 'BTTS', market_name: 'Karşılıklı Gol', selection: 'No', selection_name: 'Hayır', odds_value: 2.15, is_active: true },
    
    // First Half Result
    { id: '15', market_type: '1H', market_name: 'İlk Yarı Sonucu', selection: '1', selection_name: match.home_team, odds_value: 2.80, is_active: true },
    { id: '16', market_type: '1H', market_name: 'İlk Yarı Sonucu', selection: 'X', selection_name: 'Beraberlik', odds_value: 2.25, is_active: true },
    { id: '17', market_type: '1H', market_name: 'İlk Yarı Sonucu', selection: '2', selection_name: match.away_team, odds_value: 3.15, is_active: true },
    
    // Handicap Asian -1
    { id: '18', market_type: 'AH', market_name: 'Asya Handikap (-1)', selection: '1', selection_name: `${match.home_team} (-1)`, odds_value: 3.85, is_active: true },
    { id: '19', market_type: 'AH', market_name: 'Asya Handikap (-1)', selection: '2', selection_name: `${match.away_team} (+1)`, odds_value: 1.25, is_active: true },
    
    // Correct Score
    { id: '20', market_type: 'CS', market_name: 'Doğru Skor', selection: '1-0', selection_name: '1-0', odds_value: 8.50, is_active: true },
    { id: '21', market_type: 'CS', market_name: 'Doğru Skor', selection: '2-0', selection_name: '2-0', odds_value: 12.00, is_active: true },
    { id: '22', market_type: 'CS', market_name: 'Doğru Skor', selection: '2-1', selection_name: '2-1', odds_value: 9.25, is_active: true },
    { id: '23', market_type: 'CS', market_name: 'Doğru Skor', selection: '1-1', selection_name: '1-1', odds_value: 6.75, is_active: true },
    { id: '24', market_type: 'CS', market_name: 'Doğru Skor', selection: '0-0', selection_name: '0-0', odds_value: 8.25, is_active: true },
    { id: '25', market_type: 'CS', market_name: 'Doğru Skor', selection: '0-1', selection_name: '0-1', odds_value: 11.50, is_active: true },
    { id: '26', market_type: 'CS', market_name: 'Doğru Skor', selection: '1-2', selection_name: '1-2', odds_value: 13.75, is_active: true },
    { id: '27', market_type: 'CS', market_name: 'Doğru Skor', selection: '0-2', selection_name: '0-2', odds_value: 15.25, is_active: true },
    
    // Half Time/Full Time
    { id: '28', market_type: 'HT/FT', market_name: 'İlk Yarı / Maç Sonucu', selection: '1/1', selection_name: `${match.home_team}/${match.home_team}`, odds_value: 3.45, is_active: true },
    { id: '29', market_type: 'HT/FT', market_name: 'İlk Yarı / Maç Sonucu', selection: 'X/1', selection_name: `Beraberlik/${match.home_team}`, odds_value: 5.25, is_active: true },
    { id: '30', market_type: 'HT/FT', market_name: 'İlk Yarı / Maç Sonucu', selection: 'X/X', selection_name: 'Beraberlik/Beraberlik', odds_value: 4.85, is_active: true },
    { id: '31', market_type: 'HT/FT', market_name: 'İlk Yarı / Maç Sonucu', selection: 'X/2', selection_name: `Beraberlik/${match.away_team}`, odds_value: 7.25, is_active: true },
    { id: '32', market_type: 'HT/FT', market_name: 'İlk Yarı / Maç Sonucu', selection: '2/2', selection_name: `${match.away_team}/${match.away_team}`, odds_value: 4.15, is_active: true },
    
    // Team Total Goals
    { id: '33', market_type: 'TTG', market_name: `${match.home_team} Toplam Gol`, selection: 'Over1.5', selection_name: 'Üst 1.5', odds_value: 2.65, is_active: true },
    { id: '34', market_type: 'TTG', market_name: `${match.home_team} Toplam Gol`, selection: 'Under1.5', selection_name: 'Alt 1.5', odds_value: 1.45, is_active: true },
    { id: '35', market_type: 'TTG2', market_name: `${match.away_team} Toplam Gol`, selection: 'Over1.5', selection_name: 'Üst 1.5', odds_value: 3.15, is_active: true },
    { id: '36', market_type: 'TTG2', market_name: `${match.away_team} Toplam Gol`, selection: 'Under1.5', selection_name: 'Alt 1.5', odds_value: 1.32, is_active: true },
    
    // Cards
    { id: '37', market_type: 'Cards', market_name: 'Toplam Kart 3.5', selection: 'Over', selection_name: 'Üst 3.5', odds_value: 1.75, is_active: true },
    { id: '38', market_type: 'Cards', market_name: 'Toplam Kart 3.5', selection: 'Under', selection_name: 'Alt 3.5', odds_value: 2.05, is_active: true },
    
    // Corners
    { id: '39', market_type: 'Corners', market_name: 'Toplam Korner 9.5', selection: 'Over', selection_name: 'Üst 9.5', odds_value: 1.85, is_active: true },
    { id: '40', market_type: 'Corners', market_name: 'Toplam Korner 9.5', selection: 'Under', selection_name: 'Alt 9.5', odds_value: 1.95, is_active: true },
    
    // Next Goal
    { id: '41', market_type: 'NextGoal', market_name: 'Sonraki Gol', selection: '1', selection_name: match.home_team, odds_value: 1.95, is_active: true },
    { id: '42', market_type: 'NextGoal', market_name: 'Sonraki Gol', selection: '2', selection_name: match.away_team, odds_value: 2.45, is_active: true },
    { id: '43', market_type: 'NextGoal', market_name: 'Sonraki Gol', selection: 'None', selection_name: 'Gol Olmaz', odds_value: 4.25, is_active: true },
  ];

  const allOdds = [...match.odds, ...expandedOdds];
  const groupedOdds = allOdds.reduce((acc, odds) => {
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
                   <Badge variant="destructive" className="text-red-600 bg-red-50 border-red-200">
                     <Clock className="w-3 h-3 mr-1" />
                     {match.match_time || `${match.match_minute}'`}
                   </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{match.viewers_count?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0'} izleyici</span>
                </div>
              </div>

              {/* Teams and Score */}
              <div className="grid grid-cols-3 items-center gap-2 md:gap-4">
                {/* Home Team */}
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2">{getTeamLogo(match.home_team_logo)}</div>
                  <h3 className="font-bold text-sm md:text-base truncate px-1">{match.home_team}</h3>
                </div>
                
                {/* Score */}
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-bold text-primary mb-2">
                    {match.home_score} - {match.away_score}
                  </div>
                  {match.period && (
                    <Badge variant="secondary" className="text-xs">{match.period}</Badge>
                  )}
                </div>
                
                {/* Away Team */}
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2">{getTeamLogo(match.away_team_logo)}</div>
                  <h3 className="font-bold text-sm md:text-base truncate px-1">{match.away_team}</h3>
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
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {odds.map((odd) => (
                        <Button
                          key={odd.id}
                          variant="outline"
                          className="h-12 flex flex-col justify-center hover:bg-primary hover:text-primary-foreground"
                        >
                          <span className="text-xs font-medium truncate">{odd.selection_name}</span>
                          <span className="text-sm font-bold">{odd.odds_value.toFixed(2)}</span>
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
