import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Calendar, Trophy, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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
  const [activeTab, setActiveTab] = useState('betslip');
  const [confirmedBets, setConfirmedBets] = useState<any[]>([]);
  const { toast } = useToast();

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

  const handleConfirmBet = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir bahis miktarı girin.",
        variant: "destructive"
      });
      return;
    }

    if (betSlip.length === 0) {
      toast({
        title: "Hata", 
        description: "Lütfen en az bir bahis seçin.",
        variant: "destructive"
      });
      return;
    }

    // Bahis bilgilerini kaydet
    const confirmedBet = {
      id: Date.now().toString(),
      bets: [...betSlip],
      stakeAmount: parseFloat(stakeAmount),
      totalOdds: totalOdds,
      potentialWin: potentialWin,
      date: new Date().toLocaleString('tr-TR'),
      status: 'Beklemede'
    };

    setConfirmedBets(prev => [...prev, confirmedBet]);

    // Bahis onaylama işlemi
    toast({
      title: "Bahis Onaylandı!",
      description: `${betSlip.length} bahis ile ₺${parseFloat(stakeAmount)} miktarında bahsiniz onaylandı. Olası kazanç: ₺${potentialWin.toFixed(2)}`,
    });

    // Kuponu temizle
    setBetSlip([]);
    setStakeAmount('');
    
    // "Bahislerim" sekmesine geç
    setActiveTab('mybets');
  };

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
            <div className="sticky top-4 space-y-4">
              {/* Bet Slip Card */}
              <Card className="bg-muted/30">
                {/* Header with tabs */}
                <div className="flex">
                  <div 
                    className={`px-4 py-3 rounded-t-lg flex items-center gap-2 font-semibold cursor-pointer transition-colors ${
                      activeTab === 'betslip' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setActiveTab('betslip')}
                  >
                    Bahis kuponu
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {betSlip.length}
                    </Badge>
                  </div>
                  <div 
                    className={`px-4 py-3 rounded-tr-lg flex-1 text-center font-medium cursor-pointer transition-colors ${
                      activeTab === 'mybets' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setActiveTab('mybets')}
                  >
                    Bahislerim
                    {confirmedBets.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                        {confirmedBets.length}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {activeTab === 'betslip' ? (
                    // Bahis Kuponu İçeriği
                    betSlip.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-2">
                          Bahis kuponun bulunmamaktadir. Bahis yapmak için herhangi bir bahis oranina tikla.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Selected Bets */}
                        <div className="space-y-3">
                          {betSlip.map((bet) => (
                            <div key={bet.matchId} className="bg-background/50 rounded-lg p-3 border">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{bet.matchName}</p>
                                  <p className="text-xs text-muted-foreground">{bet.selection}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromBetSlip(bet.matchId)}
                                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Oran:</span>
                                <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-bold">
                                  {bet.odds.toFixed(2)}
                                </div>
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
                            className="bg-background/50"
                          />
                        </div>

                        {/* Summary */}
                        <div className="space-y-2 bg-background/30 p-3 rounded-lg border">
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
                          className="w-full bg-destructive hover:bg-destructive/90" 
                          disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                          onClick={handleConfirmBet}
                        >
                          Bahsi Onayla
                        </Button>
                      </>
                    )
                  ) : (
                    // Bahislerim İçeriği
                    confirmedBets.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-2">
                          Henüz onaylanmış bahsiniz bulunmuyor.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Bahis yapmak için "Bahis kuponu" sekmesini kullanın.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {confirmedBets.map((bet) => (
                          <div key={bet.id} className="bg-background/50 rounded-lg p-3 border">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-sm">Bahis #{bet.id.slice(-4)}</p>
                                <p className="text-xs text-muted-foreground">{bet.date}</p>
                              </div>
                              <Badge 
                                variant={bet.status === 'Beklemede' ? 'secondary' : 'default'}
                                className="text-xs"
                              >
                                {bet.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 mb-2">
                              {bet.bets.map((selection: any, index: number) => (
                                <div key={index} className="text-xs">
                                  <span className="font-medium">{selection.matchName}</span>
                                  <span className="text-muted-foreground"> - {selection.selection}</span>
                                  <span className="float-right font-bold">{selection.odds.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                              <div>
                                <span className="text-muted-foreground block">Bahis</span>
                                <span className="font-semibold">₺{bet.stakeAmount}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Toplam Oran</span>
                                <span className="font-semibold">{bet.totalOdds.toFixed(2)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Olası Kazanç</span>
                                <span className="font-semibold text-green-600">₺{bet.potentialWin.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Popular Bets Section */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    Popüler Bahisler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Popular bet examples */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-background/50 rounded border hover:bg-background/70 cursor-pointer transition-colors">
                      <div>
                        <p className="text-sm font-medium">Ermenistan v Portekiz</p>
                        <p className="text-xs text-muted-foreground">Maç Kazananı</p>
                        <p className="text-xs font-medium">Portekiz</p>
                      </div>
                      <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-bold">
                        1.12
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-background/50 rounded border hover:bg-background/70 cursor-pointer transition-colors">
                      <div>
                        <p className="text-sm font-medium">Gürcistan v Bulgaristan</p>
                        <p className="text-xs text-muted-foreground">Maç Kazananı</p>
                        <p className="text-xs font-medium">Gürcistan</p>
                      </div>
                      <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-bold">
                        1.43
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-background/50 rounded border hover:bg-background/70 cursor-pointer transition-colors">
                      <div>
                        <p className="text-sm font-medium">Türkiye v İspanya</p>
                        <p className="text-xs text-muted-foreground">Maç Kazananı</p>
                        <p className="text-xs font-medium">İspanya</p>
                      </div>
                      <div className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-sm font-bold">
                        1.55
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBetting;