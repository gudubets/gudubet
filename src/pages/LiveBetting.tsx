import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Users, 
  TrendingUp,
  Clock,
  BarChart3,
  Trash2,
  X
} from 'lucide-react';
import LiveMatchCard from '@/components/betting/LiveMatchCard';
import BettingSlip from '@/components/betting/BettingSlip';
import MatchDetailsModal from '@/components/betting/MatchDetailsModal';

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

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  selectionName: string;
  odds: number;
  market: string;
}

const LiveBetting = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('hepsi');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
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

  // Fetch live matches with odds
  const fetchLiveMatches = async () => {
    try {
      setLoading(true);
      
      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('live_matches')
        .select('*')
        .eq('status', 'live')
        .order('is_featured', { ascending: false })
        .order('viewers_count', { ascending: false });

      if (matchesError) throw matchesError;

      // Fetch all odds for the matches
      const matchIds = matchesData?.map(match => match.id) || [];
      const { data: oddsData, error: oddsError } = await supabase
        .from('live_odds')
        .select('*')
        .in('match_id', matchIds)
        .eq('is_active', true);

      if (oddsError) throw oddsError;

      // Group odds by match_id and combine with matches
      const matchesWithOdds = matchesData?.map(match => ({
        ...match,
        odds: oddsData?.filter(odds => odds.match_id === match.id) || []
      })) || [];

      setLiveMatches(matchesWithOdds);
    } catch (error) {
      console.error('Error fetching live matches:', error);
      toast({
        title: "Hata",
        description: "Canlı maçlar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
    
    // Set up real-time subscription for live matches
    const channel = supabase
      .channel('live-matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_matches'
        },
        () => {
          fetchLiveMatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_odds'
        },
        () => {
          fetchLiveMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter matches by sport
  const filteredMatches = selectedSport === 'hepsi' 
    ? liveMatches 
    : liveMatches.filter(match => match.sport_type === selectedSport);

  // Add bet to slip
  const addToBetSlip = (
    match: LiveMatch, 
    odds: LiveOdds
  ) => {
    const betSelection: BetSelection = {
      matchId: match.id,
      matchName: `${match.home_team} vs ${match.away_team}`,
      selection: odds.selection,
      selectionName: odds.selection_name,
      odds: odds.odds_value,
      market: odds.market_name
    };

    setBetSlip(prev => {
      const existing = prev.find(bet => 
        bet.matchId === match.id && bet.selection === odds.selection
      );
      if (existing) {
        return prev; // Don't add duplicate
      }
      return [...prev, betSelection];
    });

    toast({
      title: "Bahis Eklendi",
      description: `${odds.selection_name} - ${odds.odds_value} kupona eklendi.`,
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

    toast({
      title: "Canlı Bahis Onaylandı!",
      description: `${betSlip.length} bahis ile ₺${parseFloat(stakeAmount)} miktarında canlı bahsiniz onaylandı.`,
    });

    setBetSlip([]);
    setStakeAmount('');
  };

  // Show match details
  const showMatchDetails = (match: LiveMatch) => {
    setSelectedMatch(match);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Canlı Bahisler</h1>
              <Badge variant="destructive" className="animate-pulse">
                <Play className="w-3 h-3 mr-1" />
                🔴 CANLI
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{filteredMatches.reduce((sum, match) => sum + match.viewers_count, 0).toLocaleString()} izleyici</span>
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
                  onAddToBetSlip={addToBetSlip}
                  onShowDetails={showMatchDetails}
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

          {/* Betting Slip - Desktop */}
          <div className="hidden lg:block w-80">
            <BettingSlip
              betSlip={betSlip}
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

      {/* Mobile Betting Slip */}
      {betSlip.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
          <BettingSlip
            betSlip={betSlip}
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

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default LiveBetting;