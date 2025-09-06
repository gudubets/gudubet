import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Users, 
  TrendingUp,
  Clock,
  BarChart3,
  Trash2,
  X,
  Calendar,
  Star,
  History
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  match_date: string;
  match_time: string;
  sport_type: string;
  league: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  is_featured: boolean;
}

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  odds: number;
}

interface ConfirmedBet {
  id: string;
  bets: BetSelection[];
  stakeAmount: number;
  totalOdds: number;
  potentialWin: number;
  date: string;
  status: string;
}

const SportsBetting = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('hepsi');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [confirmedBets, setConfirmedBets] = useState<ConfirmedBet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('betslip');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sportFilters = [
    { id: 'hepsi', name: 'Hepsi', icon: '🎯' },
    { id: 'futbol', name: 'Futbol', icon: '⚽' },
    { id: 'basketbol', name: 'Basketbol', icon: '🏀' },
    { id: 'tenis', name: 'Tenis', icon: '🎾' },
    { id: 'e-spor', name: 'E-Spor', icon: '🎮' },
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMatches: Match[] = [
        {
          id: '1',
          home_team: 'Manchester United',
          away_team: 'Liverpool',
          match_date: '2024-01-20',
          match_time: '17:00',
          sport_type: 'futbol',
          league: 'Premier League',
          home_odds: 2.1,
          draw_odds: 3.2,
          away_odds: 3.5,
          is_featured: true
        },
        {
          id: '2',
          home_team: 'Barcelona',
          away_team: 'Real Madrid',
          match_date: '2024-01-21',
          match_time: '20:00',
          sport_type: 'futbol',
          league: 'La Liga',
          home_odds: 1.8,
          draw_odds: 3.6,
          away_odds: 4.2,
          is_featured: true
        },
        {
          id: '3',
          home_team: 'Lakers',
          away_team: 'Warriors',
          match_date: '2024-01-20',
          match_time: '02:00',
          sport_type: 'basketbol',
          league: 'NBA',
          home_odds: 1.9,
          draw_odds: 0,
          away_odds: 1.9,
          is_featured: false
        }
      ];
      
      setMatches(mockMatches);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  // Filter matches by sport
  const filteredMatches = selectedSport === 'hepsi' 
    ? matches 
    : matches.filter(match => match.sport_type === selectedSport);

  // Add bet to slip
  const addToBetSlip = (match: Match, selection: string, odds: number) => {
    const betSelection: BetSelection = {
      matchId: match.id,
      matchName: `${match.home_team} vs ${match.away_team}`,
      selection,
      odds
    };

    setBetSlip(prev => {
      const existing = prev.find(bet => bet.matchId === match.id);
      if (existing) {
        return prev.map(bet => 
          bet.matchId === match.id ? betSelection : bet
        );
      }
      return [...prev, betSelection];
    });

    toast({
      title: "Bahis Eklendi",
      description: `${selection} - ${odds} kupona eklendi.`,
    });
  };

  // Remove bet from slip
  const removeFromBetSlip = (index: number) => {
    setBetSlip(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate total odds and potential win
  const totalOdds = betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialWin = parseFloat(stakeAmount) * totalOdds || 0;

  // Confirm bet
  const confirmBet = () => {
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

    const confirmedBet: ConfirmedBet = {
      id: Date.now().toString(),
      bets: [...betSlip],
      stakeAmount: parseFloat(stakeAmount),
      totalOdds: totalOdds,
      potentialWin: potentialWin,
      date: new Date().toLocaleString('tr-TR'),
      status: 'Beklemede'
    };

    setConfirmedBets(prev => [...prev, confirmedBet]);

    toast({
      title: "Bahis Onaylandı!",
      description: `${betSlip.length} bahis ile ₺${parseFloat(stakeAmount)} miktarında bahsiniz onaylandı.`,
    });

    setBetSlip([]);
    setStakeAmount('');
    setActiveTab('mybets');
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Spor Bahisleri</h1>
              <Badge variant="secondary">
                <Trophy className="w-3 h-3 mr-1" />
                {matches.length} Maç
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Bugün {filteredMatches.length} maç</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content - Matches */}
          <div className="flex-1">
            {/* Sport Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {sportFilters.map((sport) => (
                <Button
                  key={sport.id}
                  variant={selectedSport === sport.id ? "default" : "outline"}
                  onClick={() => setSelectedSport(sport.id)}
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{sport.icon}</span>
                  {sport.name}
                  {sport.id !== 'hepsi' && (
                    <Badge variant="secondary" className="ml-2">
                      {matches.filter(m => m.sport_type === sport.id).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Maçlar yükleniyor...</p>
              </div>
            )}

            {/* Matches List */}
            <div className="space-y-4">
              {filteredMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">
                          {match.league}
                        </div>
                        {match.is_featured && (
                          <Badge variant="destructive">
                            <Star className="w-3 h-3 mr-1" />
                            Öne Çıkan
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {match.match_date} - {match.match_time}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-lg font-semibold mb-1">
                          {match.home_team} vs {match.away_team}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToBetSlip(match, `${match.home_team} Kazanır`, match.home_odds)}
                          className="min-w-16"
                        >
                          <div className="text-center">
                            <div className="text-xs">1</div>
                            <div className="font-bold">{match.home_odds}</div>
                          </div>
                        </Button>

                        {match.draw_odds > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToBetSlip(match, 'Beraberlik', match.draw_odds)}
                            className="min-w-16"
                          >
                            <div className="text-center">
                              <div className="text-xs">X</div>
                              <div className="font-bold">{match.draw_odds}</div>
                            </div>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToBetSlip(match, `${match.away_team} Kazanır`, match.away_odds)}
                          className="min-w-16"
                        >
                          <div className="text-center">
                            <div className="text-xs">2</div>
                            <div className="font-bold">{match.away_odds}</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!loading && filteredMatches.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {selectedSport === 'hepsi' 
                    ? 'Henüz maç bulunmuyor.' 
                    : `${sportFilters.find(s => s.id === selectedSport)?.name} kategorisinde maç bulunmuyor.`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Betting Slip - Desktop */}
          <div className="hidden lg:block w-80">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Kupon</CardTitle>
                  <Badge variant="secondary">{betSlip.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex border-b mb-4">
                  <Button
                    variant={activeTab === 'betslip' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('betslip')}
                    className="flex-1 rounded-none"
                  >
                    Kupon ({betSlip.length})
                  </Button>
                  <Button
                    variant={activeTab === 'mybets' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('mybets')}
                    className="flex-1 rounded-none"
                  >
                    Bahislerim ({confirmedBets.length})
                  </Button>
                </div>

                {activeTab === 'betslip' && (
                  <div className="space-y-4">
                    {betSlip.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Kuponunuz boş</p>
                        <p className="text-sm">Bahis yapmak için oranları seçin</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {betSlip.map((bet, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="text-sm font-medium">{bet.matchName}</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromBetSlip(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">{bet.selection}</div>
                                <div className="font-bold">{bet.odds}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3 pt-3 border-t">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Bahis Miktarı (₺)</label>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Toplam Oran:</span>
                              <span className="font-bold">{totalOdds.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Kazanç:</span>
                              <span className="font-bold text-green-600">₺{potentialWin.toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            onClick={confirmBet}
                            className="w-full"
                            disabled={betSlip.length === 0 || !stakeAmount}
                          >
                            Bahsi Onayla
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'mybets' && (
                  <div className="space-y-4">
                    {confirmedBets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Henüz bahsiniz yok</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {confirmedBets.map((bet) => (
                          <div key={bet.id} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm font-medium">
                                {bet.bets.length} Bahis
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {bet.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Miktar:</span>
                                <span>₺{bet.stakeAmount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Oran:</span>
                                <span>{bet.totalOdds.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Kazanç:</span>
                                <span className="font-bold text-green-600">₺{bet.potentialWin.toFixed(2)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {bet.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Betting Slip */}
      {betSlip.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">
              {betSlip.length} bahis • Oran: {totalOdds.toFixed(2)}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setBetSlip([])}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Miktar"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={confirmBet} disabled={!stakeAmount}>
              Onayla (₺{potentialWin.toFixed(2)})
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SportsBetting;