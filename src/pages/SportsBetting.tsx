import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import BettingSlip from '@/components/betting/BettingSlip';
import MatchDetailsModal from '@/components/betting/MatchDetailsModal';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_team_logo?: string;
  away_team_logo?: string;
  home_score: number;
  away_score: number;
  match_date: string;
  match_time: string;
  sport_type: string;
  league: string;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  is_featured: boolean;
  status: string;
  viewers_count: number;
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sportFilters = [
    { id: 'hepsi', name: 'Hepsi', icon: '🎯' },
    { id: 'futbol', name: 'Futbol', icon: '⚽' },
    { id: 'basketbol', name: 'Basketbol', icon: '🏀' },
    { id: 'tenis', name: 'Tenis', icon: '🎾' },
    { id: 'e-spor', name: 'E-Spor', icon: '🎮' },
  ];

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        // Fetch matches with odds
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select(`
            *,
            leagues (
              name,
              sport_id,
              sports (name)
            ),
            odds (*)
          `)
          .eq('status', 'scheduled')
          .order('match_date', { ascending: true })
          .limit(10);

        if (matchesError) throw matchesError;

        // Transform data to match interface
        const transformedMatches: Match[] = (matchesData || []).map(match => ({
          id: match.id,
          home_team: match.home_team,
          away_team: match.away_team,
          home_team_logo: match.home_team_logo,
          away_team_logo: match.away_team_logo,
          home_score: match.home_score || 0,
          away_score: match.away_score || 0,
          match_date: new Date(match.match_date).toLocaleDateString('tr-TR'),
          match_time: new Date(match.match_date).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          sport_type: match.leagues?.sports?.name?.toLowerCase() || 'futbol',
          league: match.leagues?.name || 'Bilinmeyen Liga',
          home_odds: match.odds?.find(o => o.selection === '1')?.odds_value || 1.5,
          draw_odds: match.odds?.find(o => o.selection === 'X')?.odds_value || 3.0,
          away_odds: match.odds?.find(o => o.selection === '2')?.odds_value || 2.5,
          is_featured: match.is_featured || false,
          status: match.status,
          viewers_count: 0,
          odds: match.odds?.map(odd => ({
            id: odd.id,
            market_type: odd.market_type,
            market_name: odd.market_name,
            selection: odd.selection,
            selection_name: odd.selection === '1' ? match.home_team : 
                           odd.selection === 'X' ? 'Beraberlik' : 
                           odd.selection === '2' ? match.away_team : odd.selection,
            odds_value: odd.odds_value,
            is_active: odd.is_active
          })) || []
        }));

        setMatches(transformedMatches);
      } catch (error) {
        console.error('Error fetching matches:', error);
        // Fall back to mock data if there's an error
        const mockMatches: Match[] = [
          {
            id: '1',
            home_team: 'Manchester United',
            away_team: 'Liverpool',
            home_score: 0,
            away_score: 0,
            match_date: new Date().toLocaleDateString('tr-TR'),
            match_time: '17:00',
            sport_type: 'futbol',
            league: 'Premier League',
            home_odds: 2.1,
            draw_odds: 3.2,
            away_odds: 3.5,
            is_featured: true,
            status: 'scheduled',
            viewers_count: 0,
            odds: [
              {
                id: '1',
                market_type: '1X2',
                market_name: 'Maç Sonucu',
                selection: '1',
                selection_name: 'Manchester United',
                odds_value: 2.1,
                is_active: true
              },
              {
                id: '2',
                market_type: '1X2',
                market_name: 'Maç Sonucu',
                selection: 'X',
                selection_name: 'Beraberlik',
                odds_value: 3.2,
                is_active: true
              },
              {
                id: '3',
                market_type: '1X2',
                market_name: 'Maç Sonucu',
                selection: '2',
                selection_name: 'Liverpool',
                odds_value: 3.5,
                is_active: true
              }
            ]
          }
        ];
        setMatches(mockMatches);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  const filteredMatches = selectedSport === 'hepsi' 
    ? matches 
    : matches.filter(match => match.sport_type === selectedSport);

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

  const removeFromBetSlip = (index: number) => {
    setBetSlip(prev => prev.filter((_, i) => i !== index));
  };

  const totalOdds = betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  const potentialWin = parseFloat(stakeAmount) * totalOdds || 0;

  const confirmBet = async () => {
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

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Hata",
          description: "Bahis yapmak için giriş yapmanız gerekir.",
          variant: "destructive"
        });
        return;
      }

      // Create betslip
      const { data: betslipData, error: betslipError } = await supabase
        .from('betslips')
        .insert({
          user_id: user.id,
          slip_type: betSlip.length === 1 ? 'single' : 'multiple',
          total_stake: parseFloat(stakeAmount),
          total_odds: totalOdds,
          potential_win: potentialWin,
          status: 'pending'
        })
        .select()
        .single();

      if (betslipError) throw betslipError;

      // Create betslip items
      const betslipItems = betSlip.map(bet => ({
        betslip_id: betslipData.id,
        match_id: bet.matchId,
        odds_id: bet.matchId + '_' + Math.random(), // This should be actual odds ID
        selection: bet.selection,
        odds_value: bet.odds,
        stake: parseFloat(stakeAmount) / betSlip.length, // Equal distribution for now
        market_type: '1X2',
        market_name: 'Maç Sonucu'
      }));

      const { error: itemsError } = await supabase
        .from('betslip_items')
        .insert(betslipItems);

      if (itemsError) throw itemsError;

      const confirmedBet: ConfirmedBet = {
        id: betslipData.id,
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
    } catch (error) {
      console.error('Error creating bet:', error);
      toast({
        title: "Hata",
        description: "Bahis oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
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

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Matches Section */}
            <div className="lg:col-span-3">
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
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">
                            {match.match_date} - {match.match_time}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedMatch(match);
                              setIsDetailsOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div 
                            className="text-lg font-semibold mb-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              setSelectedMatch(match);
                              setIsDetailsOpen(true);
                            }}
                          >
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

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMatch(match);
                              setIsDetailsOpen(true);
                            }}
                            className="text-primary hover:text-primary/80 ml-2"
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Detaylar
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

            {/* Add BettingSlip Component */}
            <div className="hidden lg:block lg:col-span-1">
              <BettingSlip
                betSlip={betSlip}
                confirmedBets={confirmedBets}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                stakeAmount={stakeAmount}
                onStakeChange={setStakeAmount}
                onRemoveBet={removeFromBetSlip}
                onConfirmBet={confirmBet}
                totalOdds={totalOdds}
                potentialWin={potentialWin}
              />
            </div>
          </div>
        </div>

        {/* Add BettingSlip Component */}
        <div className="hidden lg:block lg:col-span-1">
          <BettingSlip
            betSlip={betSlip}
            confirmedBets={confirmedBets}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            stakeAmount={stakeAmount}
            onStakeChange={setStakeAmount}
            onRemoveBet={removeFromBetSlip}
            onConfirmBet={confirmBet}
            totalOdds={totalOdds}
            potentialWin={potentialWin}
          />
        </div>
      </main>

      {/* Mobile BettingSlip */}
      {betSlip.length > 0 && (
        <div className="lg:hidden">
          <BettingSlip
            betSlip={betSlip}
            confirmedBets={confirmedBets}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            stakeAmount={stakeAmount}
            onStakeChange={setStakeAmount}
            onRemoveBet={removeFromBetSlip}
            onConfirmBet={confirmBet}
            totalOdds={totalOdds}
            potentialWin={potentialWin}
            isMobile={true}
          />
        </div>
      )}

      <MatchDetailsModal
        match={selectedMatch}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default SportsBetting;