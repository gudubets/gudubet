import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Calendar, Trophy, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  odds: number;
}

const SportsBetting = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');

  // Mock data for matches
  const matches = [
    {
      id: '1',
      league: 'Premier League',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      homeTeamLogo: '🔴',
      awayTeamLogo: '🔴',
      date: '2024-01-15',
      time: '20:00',
      odds: { home: 2.45, draw: 3.20, away: 2.85 },
      isLive: false,
      sport: 'football'
    },
    {
      id: '2',
      league: 'NBA',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      homeTeamLogo: '🏀',
      awayTeamLogo: '🏀',
      date: '2024-01-15',
      time: '22:30',
      odds: { home: 1.95, away: 1.85 },
      isLive: true,
      sport: 'basketball'
    },
    {
      id: '3',
      league: 'Süper Lig',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahçe',
      homeTeamLogo: '🟡',
      awayTeamLogo: '🔵',
      date: '2024-01-16',
      time: '19:00',
      odds: { home: 2.10, draw: 3.45, away: 3.20 },
      isLive: false,
      sport: 'football'
    }
  ];

  const addToBetSlip = (match: any, selection: string, odds: number) => {
    const betSelection: BetSelection = {
      matchId: match.id,
      matchName: `${match.homeTeam} vs ${match.awayTeam}`,
      selection,
      odds
    };

    setBetSlip(prev => {
      const existing = prev.find(bet => bet.matchId === match.id);
      if (existing) {
        return prev.map(bet => bet.matchId === match.id ? betSelection : bet);
      }
      return [...prev, betSelection];
    });
  };

  const removeFromBetSlip = (matchId: string) => {
    setBetSlip(prev => prev.filter(bet => bet.matchId !== matchId));
  };

  const totalOdds = betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialWin = parseFloat(stakeAmount) * totalOdds || 0;

  const filteredMatches = matches.filter(match => {
    const sportMatch = selectedSport === 'all' || match.sport === selectedSport;
    const searchMatch = searchQuery === '' || 
      match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase());
    const leagueMatch = selectedLeague === 'all' || match.league === selectedLeague;
    
    return sportMatch && searchMatch && leagueMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary/20 to-primary/10 py-16">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-sports.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Spor Bahisleri
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Futbol, Basketbol, Tenis ve daha fazlası – En iyi oranlarla bahis yap!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Sports Tabs */}
            <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value="football">⚽ Futbol</TabsTrigger>
                <TabsTrigger value="basketball">🏀 Basketbol</TabsTrigger>
                <TabsTrigger value="tennis">🎾 Tenis</TabsTrigger>
                <TabsTrigger value="esports">🎮 E-Spor</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Takım ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedDate} onValueChange={setSelectedDate}>
                    <SelectTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Bugün</SelectItem>
                      <SelectItem value="tomorrow">Yarın</SelectItem>
                      <SelectItem value="3days">3 Gün İçinde</SelectItem>
                      <SelectItem value="week">Bu Hafta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                    <SelectTrigger>
                      <Trophy className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Lig Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ligler</SelectItem>
                      <SelectItem value="Premier League">Premier League</SelectItem>
                      <SelectItem value="Süper Lig">Süper Lig</SelectItem>
                      <SelectItem value="NBA">NBA</SelectItem>
                      <SelectItem value="La Liga">La Liga</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Canlı Bahis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matches List */}
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{match.league}</Badge>
                        {match.isLive && (
                          <Badge variant="destructive" className="animate-pulse">
                            CANLI
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {match.date} • {match.time}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Teams */}
                      <div className="col-span-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{match.homeTeamLogo}</span>
                            <span className="font-semibold">{match.homeTeam}</span>
                          </div>
                          <span className="text-muted-foreground font-medium">VS</span>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{match.awayTeam}</span>
                            <span className="text-2xl">{match.awayTeamLogo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Odds */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToBetSlip(match, `${match.homeTeam} Kazanır`, match.odds.home)}
                          className="flex-1 flex flex-col py-3"
                        >
                          <span className="text-xs text-muted-foreground">1</span>
                          <span className="font-bold">{match.odds.home}</span>
                        </Button>

                        {match.odds.draw && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToBetSlip(match, 'Beraberlik', match.odds.draw)}
                            className="flex-1 flex flex-col py-3"
                          >
                            <span className="text-xs text-muted-foreground">X</span>
                            <span className="font-bold">{match.odds.draw}</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToBetSlip(match, `${match.awayTeam} Kazanır`, match.odds.away)}
                          className="flex-1 flex flex-col py-3"
                        >
                          <span className="text-xs text-muted-foreground">2</span>
                          <span className="font-bold">{match.odds.away}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Betting Slip Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Bahis Kuponu
                  <Badge variant="secondary">{betSlip.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {betSlip.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Henüz bahis seçmediniz</p>
                    <p className="text-sm">Maçlardaki oranları tıklayın</p>
                  </div>
                ) : (
                  <>
                    {/* Selected Bets */}
                    <div className="space-y-3">
                      {betSlip.map((bet) => (
                        <div key={bet.matchId} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{bet.matchName}</p>
                              <p className="text-xs text-muted-foreground">{bet.selection}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromBetSlip(bet.matchId)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Oran:</span>
                            <span className="font-bold text-primary">{bet.odds.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Stake Input */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Bahis Miktarı (₺)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                    </div>

                    {/* Summary */}
                    <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Toplam Oran:</span>
                        <span className="font-bold">{totalOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Bahis Miktarı:</span>
                        <span>₺{parseFloat(stakeAmount) || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-primary">
                        <span>Olası Kazanç:</span>
                        <span>₺{potentialWin.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <Button 
                      className="w-full" 
                      disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                    >
                      Bahsi Onayla
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBetting;