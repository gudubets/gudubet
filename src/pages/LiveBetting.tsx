import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Users, 
  TrendingUp,
  Clock,
  Play,
  Tv,
  Calendar,
  Star
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import LiveMatchCard from '@/components/betting/LiveMatchCard';
import BettingSlip from '@/components/betting/BettingSlip';
import MatchDetailsModal from '@/components/betting/MatchDetailsModal';

interface LiveMatch {
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
  is_live: boolean;
  minute: number;
  home_score: number;
  away_score: number;
  viewers_count: number;
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

const LiveBetting = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('hepsi');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [confirmedBets, setConfirmedBets] = useState<ConfirmedBet[]>([]);
  const [activeTab, setActiveTab] = useState<string>('betslip');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
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
    const fetchLiveMatches = async () => {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMatches: LiveMatch[] = [
        {
          id: '1',
          home_team: 'Barcelona',
          away_team: 'Real Madrid',
          match_date: '2024-01-20',
          match_time: '17:00',
          sport_type: 'futbol',
          league: 'El Clasico',
          home_odds: 2.1,
          draw_odds: 3.2,
          away_odds: 3.5,
          is_live: true,
          minute: 67,
          home_score: 2,
          away_score: 1,
          viewers_count: 125000
        },
      ];
      
      setLiveMatches(mockMatches);
      setLoading(false);
    };

    fetchLiveMatches();
  }, []);

  const filteredMatches = selectedSport === 'hepsi' 
    ? liveMatches 
    : liveMatches.filter(match => match.sport_type === selectedSport);

  const addToBetSlip = (match: LiveMatch, selection: string, odds: number) => {
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Canlı Bahisler</h1>
                <Badge className="bg-red-500 text-white animate-pulse">
                  🔴 CANLI
                </Badge>
                <Badge variant="secondary">
                  <Trophy className="w-3 h-3 mr-1" />
                  {liveMatches.length} Maç
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{filteredMatches.reduce((sum, match) => sum + match.viewers_count, 0).toLocaleString()} izleyici</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sport Filters */}
        <div className="container mx-auto px-4 py-6">
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
                    {liveMatches.filter(m => m.sport_type === sport.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Canlı maçlar yükleniyor...</p>
            </div>
          )}

          {/* Live Matches List */}
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <LiveMatchCard
                key={match.id}
                match={match}
                onBetSelect={addToBetSlip}
                onDetailsClick={(match) => {
                  setSelectedMatch(match);
                  setIsDetailsOpen(true);
                }}
              />
            ))}
          </div>

          {!loading && filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {selectedSport === 'hepsi' 
                  ? 'Şu anda canlı maç bulunmuyor.' 
                  : `${sportFilters.find(s => s.id === selectedSport)?.name} kategorisinde canlı maç bulunmuyor.`
                }
              </p>
            </div>
          )}
        </div>
      </main>

      <MatchDetailsModal
        match={selectedMatch}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default LiveBetting;