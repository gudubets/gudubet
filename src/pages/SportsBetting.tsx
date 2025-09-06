import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Calendar, Trophy, TrendingUp, Plus, Trash2, Clock, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  odds: number;
}

const SportsBetting = () => {
  const [selectedSport, setSelectedSport] = useState('futbol');
  const [searchQuery, setSearchQuery] = useState('');
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('betslip');
  const [confirmedBets, setConfirmedBets] = useState<any[]>([]);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sports categories for sidebar
  const sportsCategories = [
    { id: 'futbol', name: 'Futbol', icon: '⚽', count: 156 },
    { id: 'basketball', name: 'Basketbol', icon: '🏀', count: 45 },
    { id: 'tenis', name: 'Tenis', icon: '🎾', count: 67 },
    { id: 'masa-tenisi', name: 'Masa Tenisi', icon: '🏓', count: 23 },
    { id: 'voleybol', name: 'Voleybol', icon: '🏐', count: 18 },
    { id: 'esports', name: 'E-Spor', icon: '🎮', count: 89 },
    { id: 'hentbol', name: 'Hentbol', icon: '🤾', count: 12 }
  ];

  // Mock featured matches with enhanced data
  const featuredMatches = [
    {
      id: '1',
      league: 'UEFA Şampiyonlar Ligi',
      homeTeam: 'İrlanda',
      awayTeam: 'Macaristan',
      homeTeamFlag: '🇮🇪',
      awayTeamFlag: '🇭🇺',
      status: 'Önce',
      time: '2:40',
      odds: { 
        home: 2.40, 
        draw: null, 
        away: 2.80,
        special: [
          { name: '1.5 Gol Üstü', odds: 1.85 },
          { name: '8.5 Üstü Korner', odds: 2.15 }
        ]
      },
      isLive: false,
      isFeatured: true
    },
    {
      id: '2',
      league: 'UEFA Şampiyonlar Ligi',
      homeTeam: 'Belçika',
      awayTeam: 'Kazakistan',
      homeTeamFlag: '🇧🇪',
      awayTeamFlag: '🇰🇿',
      status: 'Önce',
      time: '2:45',
      odds: { 
        home: 2.45, 
        draw: null, 
        away: 2.45,
        special: [
          { name: '1.5 Gol Üstü', odds: 1.90 },
          { name: '8.5 Üstü Korner', odds: 2.25 }
        ]
      },
      isLive: false,
      isFeatured: true
    },
    {
      id: '3',
      league: 'FIFA Dünya Kupası Elemeleri - UEFA',
      homeTeam: 'Letonya',
      awayTeam: 'Sırbistan',
      homeTeamFlag: '🇱🇻',
      awayTeamFlag: '🇷🇸',
      homeScore: 0,
      awayScore: 1,
      status: 'Canlı',
      time: '26:31 İlk Yarı',
      odds: { 
        home: 2.5, 
        draw: 3.40, 
        away: 2.80,
        special: [
          { name: 'Üst/Alt 2.5 Gol', odds: 1.58, selection: 'Ü 2.5' },
          { name: 'Karşılıklı Gol Olur', odds: 2.40 }
        ]
      },
      isLive: true
    }
  ];

  // Get Turkish translation of team/country name
  const getTeamNameInTurkish = (teamName: string): string => {
    const turkishNames: { [key: string]: string } = {
      // Countries
      'England': 'İngiltere',
      'Ireland': 'İrlanda',
      'Hungary': 'Macaristan',
      'Latvia': 'Letonya',
      'Serbia': 'Sırbistan',
      'Belgium': 'Belçika',
      'Kazakhstan': 'Kazakistan',
      'Austria': 'Avusturya',
      'Cyprus': 'Kıbrıs',
      'San Marino': 'San Marino',
      'Bosnia & Herzegovina': 'Bosna Hersek',
      'Armenia': 'Ermenistan',
      'Portugal': 'Portekiz',
      'Andorra': 'Andorra',
      'Spain': 'İspanya',
      
      // English Teams
      'Doncaster Rovers': 'Doncaster Rovers',
      'Bradford City': 'Bradford City',
      'Cheltenham Town': 'Cheltenham Town',
      'Accrington Stanley': 'Accrington Stanley',
      'Barrow': 'Barrow',
      'Swindon Town': 'Swindon Town',
      'Bolton Wanderers': 'Bolton Wanderers',
      'Wimbledon': 'Wimbledon',
      'Walsall': 'Walsall',
      'Chesterfield FC': 'Chesterfield FC',
      'Colchester United': 'Colchester United',
      'Crewe Alexandra': 'Crewe Alexandra',
      'Harrogate Town': 'Harrogate Town',
      'Crawley Town': 'Crawley Town',
      'Rotherham United': 'Rotherham United',
      'Exeter City': 'Exeter City',
      'Notts County': 'Notts County',
      'Fleetwood Town': 'Fleetwood Town',
      'Huddersfield Town': 'Huddersfield Town',
      'Peterborough United': 'Peterborough United',
      'Port Vale': 'Port Vale',
      'Leyton Orient': 'Leyton Orient',
      'Lincoln City': 'Lincoln City',
      'Wigan Athletic': 'Wigan Athletic',
      'Wycombe Wanderers': 'Wycombe Wanderers',
      'Mansfield Town': 'Mansfield Town',
      'Plymouth Argyle': 'Plymouth Argyle',
      'Stockport County FC': 'Stockport County FC',
      'Salford City': 'Salford City',
      'Tranmere Rovers': 'Tranmere Rovers',
      'Barnet': 'Barnet',
      'Shrewsbury Town': 'Shrewsbury Town',
      'Cambridge United': 'Cambridge United',
      'Oldham Athletic': 'Oldham Athletic',
      'Milton Keynes Dons': 'Milton Keynes Dons',
      'Grimsby Town': 'Grimsby Town',
      'Bromley FC': 'Bromley FC',
      'Gillingham': 'Gillingham',
      
      // Spanish Teams
      'Deportivo La Coruña': 'Deportivo La Coruña',
      'Sporting Gijón': 'Sporting Gijón',
      'Zaragoza': 'Zaragoza',
      'Real Valladolid CF': 'Real Valladolid CF',
      
      // Brazilian Teams
      'Botafogo': 'Botafogo',
      'Atletico Paranaense': 'Atletico Paranaense'
    };
    
    return turkishNames[teamName] || teamName;
  };

  // Get country flag by team/country name
  const getCountryFlag = (teamName: string): string => {
    const flagMap: { [key: string]: string } = {
      // European Countries
      'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Ireland': '🇮🇪',
      'Hungary': '🇭🇺',
      'Latvia': '🇱🇻',
      'Serbia': '🇷🇸',
      'Belgium': '🇧🇪',
      'Kazakhstan': '🇰🇿',
      'Austria': '🇦🇹',
      'Cyprus': '🇨🇾',
      'San Marino': '🇸🇲',
      'Bosnia & Herzegovina': '🇧🇦',
      'Armenia': '🇦🇲',
      'Portugal': '🇵🇹',
      'Andorra': '🇦🇩',
      'Spain': '🇪🇸',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Italy': '🇮🇹',
      'Netherlands': '🇳🇱',
      
      // Turkish Teams
      'Galatasaray': '🇹🇷',
      'Fenerbahçe': '🇹🇷',
      'Beşiktaş': '🇹🇷',
      'Trabzonspor': '🇹🇷',
      
      // English Teams (use England flag)
      'Doncaster Rovers': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Bradford City': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Cheltenham Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Accrington Stanley': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Barrow': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Swindon Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Bolton Wanderers': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Wimbledon': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Walsall': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Chesterfield FC': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Colchester United': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Crewe Alexandra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Harrogate Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Crawley Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Rotherham United': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Exeter City': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Notts County': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Fleetwood Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Huddersfield Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Peterborough United': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Port Vale': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Leyton Orient': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Lincoln City': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Wigan Athletic': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Wycombe Wanderers': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Mansfield Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Plymouth Argyle': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Stockport County FC': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Salford City': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Tranmere Rovers': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Barnet': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Shrewsbury Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Cambridge United': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Oldham Athletic': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Milton Keynes Dons': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Grimsby Town': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Bromley FC': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'Gillingham': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      
      // Spanish Teams
      'Deportivo La Coruña': '🇪🇸',
      'Sporting Gijón': '🇪🇸',
      'Zaragoza': '🇪🇸',
      'Real Valladolid CF': '🇪🇸',
      
      // Brazilian Teams
      'Botafogo': '🇧🇷',
      'Atletico Paranaense': '🇧🇷',
      
      // Default for other teams
      'default': '⚽'
    };
    
    console.log('Getting flag for team:', teamName, '-> Flag:', flagMap[teamName] || flagMap['default']);
    return flagMap[teamName] || flagMap['default'];
  };

  // Fetch live matches from API
  const fetchLiveMatches = async () => {
    setLoading(true);
    try {
      console.log('Fetching matches for sport:', selectedSport);
      const { data, error } = await supabase.functions.invoke('sports-proxy', {
        body: { 
          sport: selectedSport === 'futbol' ? 'soccer' : selectedSport.toLowerCase(),
          region: 'us'
        }
      });

      console.log('API Response:', { data, error });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      if (data && data.matches) {
        console.log('Received matches:', data.matches.length, data.matches);
        
        // Transform API data to match UI format
        const transformedMatches = data.matches.map((match: any) => {
          const homeFlag = getCountryFlag(match.homeTeam);
          const awayFlag = getCountryFlag(match.awayTeam);
          const homeTurkish = getTeamNameInTurkish(match.homeTeam);
          const awayTurkish = getTeamNameInTurkish(match.awayTeam);
          
          console.log('Match:', match.homeTeam, '->', homeTurkish, homeFlag, '|', match.awayTeam, '->', awayTurkish, awayFlag);
          
          return {
            id: match.id,
            league: match.league,
            homeTeam: homeTurkish,
            awayTeam: awayTurkish,
            homeTeamFlag: homeFlag,
            awayTeamFlag: awayFlag,
            status: match.status === 'upcoming' ? 'Önce' : 'Canlı',
            time: new Date(match.startTime).toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            odds: {
              home: match.odds.home,
              draw: match.odds.draw,
              away: match.odds.away,
              special: [
                { name: '1.5 Gol Üstü', odds: 1.85 },
                { name: '8.5 Üstü Korner', odds: 2.15 }
              ]
            },
            isLive: match.status === 'live',
            isFeatured: false
          };
        });
        
        console.log('Transformed matches:', transformedMatches);
        setLiveMatches(transformedMatches);
      } else {
        console.log('No matches in response:', data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMatches();
  }, [selectedSport]);

  // Use real data when available, fallback to mock data
  console.log('Live matches count:', liveMatches.length);
  console.log('Display matches will be:', liveMatches.length > 0 ? 'live data' : 'mock data');
  const displayMatches = liveMatches.length > 0 ? liveMatches.slice(0, 5) : featuredMatches;

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
      {/* Header Navigation */}
      <header className="bg-slate-900 border-b border-border">
        {/* Main Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <a href="/" className="bg-destructive px-4 py-2 rounded hover:bg-destructive/90 transition-colors cursor-pointer">
                <span className="text-destructive-foreground font-bold">GUDUBET</span>
              </a>
              
              {/* Main Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/" className="text-white hover:text-primary transition-colors">Ana Sayfa</a>
                <a href="/sports-betting" className="text-primary border-b-2 border-primary pb-1">Spor</a>
                <a href="/live-betting" className="text-muted-foreground hover:text-white transition-colors">Canlı</a>
                <a href="/casino" className="text-muted-foreground hover:text-white transition-colors">Casino</a>
                <a href="/live-casino" className="text-muted-foreground hover:text-white transition-colors">Canlı Casino</a>
                <a href="/promotions" className="text-muted-foreground hover:text-white transition-colors">Promosyonlar</a>
                <Select>
                  <SelectTrigger className="w-32 bg-transparent border-none text-muted-foreground hover:text-white">
                    <SelectValue placeholder="Daha Fazla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tournaments">Turnuvalar</SelectItem>
                    <SelectItem value="statistics">İstatistikler</SelectItem>
                    <SelectItem value="results">Sonuçlar</SelectItem>
                  </SelectContent>
                </Select>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <span className="text-lg">💬</span>
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Giriş Yap
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Üye Ol
              </Button>
            </div>
          </div>
        </div>

        {/* Sports Categories */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-8">
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'futbol' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('futbol')}
                >
                  ⚽ Futbol
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'basketball' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('basketball')}
                >
                  🏀 Basketbol
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'tenis' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('tenis')}
                >
                  🎾 Tenis
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'masa-tenisi' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('masa-tenisi')}
                >
                  🏓 Masa Tenisi
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'voleybol' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('voleybol')}
                >
                  🏐 Voleybol
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'esports' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('esports')}
                >
                  🎮 E-Spor
                </Button>
                <Button
                  variant="ghost"
                  className={`text-sm hover:bg-white/5 ${
                    selectedSport === 'hentbol' ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('hentbol')}
                >
                  🤾 Hentbol
                </Button>
              </div>
              
              <Button variant="ghost" className="text-muted-foreground hover:text-white text-sm">
                🔍 Ara
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-0">
        {/* Left Sidebar - Sports Categories */}
        <div className="w-64 bg-muted/30 min-h-screen border-r">
          {/* Quick Links */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Hızlı Linkler</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Trophy className="h-4 w-4 mr-2" />
                Öne Çıkan Maçlar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Star className="h-4 w-4 mr-2" />
                FIFA Dünya Kupası ...
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Star className="h-4 w-4 mr-2" />
                FIFA Dünya Kupası ...
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-destructive">
                🎲 Gates of Betboo 10...
              </Button>
            </div>
          </div>

          {/* Today's Matches */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Günün Maçları</h3>
            <div className="space-y-1">
              {sportsCategories.map((sport) => (
                <Button
                  key={sport.id}
                  variant="ghost"
                  className={`w-full justify-between text-sm hover:bg-muted ${
                    selectedSport === sport.id ? 'bg-muted text-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={() => setSelectedSport(sport.id)}
                >
                  <span className="flex items-center">
                    <span className="mr-2">{sport.icon}</span>
                    {sport.name}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {sport.count}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* All Sports */}
          <div className="p-4">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Tüm Sporlar</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Futbol <span className="ml-auto text-xs">62</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Basketbol <span className="ml-auto text-xs">7</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Tenis <span className="ml-auto text-xs">30</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-background min-h-screen">
          {/* Hero Banner */}
          <div className="relative h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-orange-900 overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  YÜKSEK ORAN
                </h1>
                <div className="flex space-x-2 justify-center">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-1 rounded ${i === 7 ? 'bg-red-500' : 'bg-white/50'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Matches */}
          <div className="p-6">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Canlı maçlar yükleniyor...</p>
              </div>
            )}
            <div className="grid gap-4">
              {displayMatches.map((match) => (
                <Card key={match.id} className="bg-background border-2 border-teal-500 overflow-hidden">
                  <CardContent className="p-0">
                    {match.isFeatured && (
                      <div className="flex items-center justify-between bg-muted px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{match.homeTeam} v {match.awayTeam}</span>
                        </div>
                        {match.isLive && (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="animate-pulse">CANLI</Badge>
                            <span className="text-sm text-teal-400">{match.time}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-4">
                      {/* Match Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-2xl">{match.homeTeamFlag}</span>
                          <span className="font-semibold text-white">{match.homeTeam}</span>
                          {match.isLive && (
                            <span className="text-2xl font-bold text-teal-400">
                              {match.homeScore} - {match.awayScore}
                            </span>
                          )}
                        </div>
                        <div className="text-center px-4">
                          <span className="text-sm text-slate-400">vs</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          {match.isLive && (
                            <span className="text-2xl font-bold text-teal-400">
                              {match.awayScore} - {match.homeScore}
                            </span>
                          )}
                          <span className="font-semibold text-white">{match.awayTeam}</span>
                          <span className="text-2xl">{match.awayTeamFlag}</span>
                        </div>
                      </div>

                      {/* Special Bets */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {match.odds.special?.map((bet, index) => (
                          <div key={index} className="text-sm text-slate-300">
                            <div className="flex items-center justify-between">
                              <span>{bet.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToBetSlip(match, bet.name, bet.odds)}
                                className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                              >
                                {bet.odds.toFixed(2)}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Main Odds */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3"
                          onClick={() => addToBetSlip(match, `${match.homeTeam} Kazanır`, match.odds.home)}
                        >
                          <div className="text-center">
                            <div className="text-xs opacity-75">Önce</div>
                            <div className="text-lg">{match.odds.home.toFixed(2)}</div>
                          </div>
                        </Button>
                        
                        <Button
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3"
                          onClick={() => addToBetSlip(match, `${match.awayTeam} Kazanır`, match.odds.away)}
                        >
                          <div className="text-center">
                            <div className="text-xs opacity-75">Şimdi</div>
                            <div className="text-lg">{match.odds.away.toFixed(2)}</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Live Match Example */}
            <Card className="mt-4 bg-slate-800 border border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">FIFA Dünya Kupası Elemeleri - UEFA</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="destructive" className="animate-pulse">Canlı</Badge>
                      <span className="text-sm text-teal-400">26:31 İlk Yarı</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Letonya</div>
                    <div className="text-3xl font-bold text-teal-400">0</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400">-</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">Sırbistan</div>
                    <div className="text-3xl font-bold text-teal-400">1</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-400">Üst/Alt 2.5 Gol</div>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600">
                          Ü 2.5 <span className="ml-1 font-bold">1.58</span>
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600">
                          A 2.5 <span className="ml-1 font-bold">2.25</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xs text-slate-400">Karşılıklı Gol Olur</div>
                      <div className="flex gap-2 mt-1">
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600">
                          Evet <span className="ml-1 font-bold">2.40</span>
                        </Button>
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600">
                          Hayır <span className="ml-1 font-bold">1.50</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Betting Slip */}
        <div className="w-80 bg-muted/30 min-h-screen border-l">
          <div className="sticky top-0">
            {/* Bet Slip Header */}
            <div className="flex">
              <Button
                variant="ghost"
                className={`flex-1 py-3 rounded-none font-semibold ${
                  activeTab === 'betslip' 
                    ? 'bg-destructive text-destructive-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setActiveTab('betslip')}
              >
                Bahis kuponu 
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                  {betSlip.length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                className={`flex-1 py-3 rounded-none font-semibold ${
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
              </Button>
            </div>

            {/* Bet Slip Content */}
            <div className="p-4">
              {activeTab === 'betslip' ? (
                betSlip.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-sm mb-2">
                      Bahis kuponun bulunmamaktadır. Bahis yapmak için herhangi bir bahis oranına tıkla.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
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

                    <Separator className="bg-slate-600" />

                    {/* Stake Input */}
                    <div>
                      <label className="text-sm font-medium mb-2 block text-white">
                        Bahis Miktarı (₺)
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    {/* Summary */}
                    <div className="space-y-2 bg-slate-700 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Toplam Oran:</span>
                        <span className="font-bold text-white">{totalOdds.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Bahis Miktarı:</span>
                        <span className="text-white">₺{parseFloat(stakeAmount) || 0}</span>
                      </div>
                      <Separator className="bg-slate-600" />
                      <div className="flex justify-between font-bold text-green-400">
                        <span>Olası Kazanç:</span>
                        <span>₺{potentialWin.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 font-bold" 
                      disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                      onClick={handleConfirmBet}
                    >
                      Bahsi Onayla
                    </Button>
                  </div>
                )
              ) : (
                // My Bets Content
                confirmedBets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm mb-2">
                      Henüz onaylanmış bahsiniz bulunmuyor.
                    </p>
                    <p className="text-xs text-slate-500">
                      Bahis yapmak için "Bahis kuponu" sekmesini kullanın.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {confirmedBets.map((bet) => (
                      <div key={bet.id} className="bg-slate-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm text-white">Bahis #{bet.id.slice(-4)}</p>
                            <p className="text-xs text-slate-400">{bet.date}</p>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                            {bet.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 mb-2">
                          {bet.bets.map((selection: any, index: number) => (
                            <div key={index} className="text-xs text-slate-300">
                              <span className="font-medium">{selection.matchName}</span>
                              <span className="text-slate-400"> - {selection.selection}</span>
                              <span className="float-right font-bold text-white">{selection.odds.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Separator className="bg-slate-600 my-2" />
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Bahis</span>
                            <span className="font-semibold text-white">₺{bet.stakeAmount}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Toplam Oran</span>
                            <span className="font-semibold text-white">{bet.totalOdds.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Olası Kazanç</span>
                            <span className="font-semibold text-green-400">₺{bet.potentialWin.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Popular Bets Section */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-red-400" />
                <h3 className="font-semibold text-white text-sm">Popüler Bahisler</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Ermenistan v Portekiz</p>
                    <p className="text-xs text-slate-400">Maç Kazananı</p>
                    <p className="text-xs font-medium text-teal-400">Portekiz</p>
                  </div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    1.12
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Gürcistan v Bulgaristan</p>
                    <p className="text-xs text-slate-400">Maç Kazananı</p>
                    <p className="text-xs font-medium text-teal-400">Gürcistan</p>
                  </div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    1.43
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Türkiye v İspanya</p>
                    <p className="text-xs text-slate-400">Maç Kazananı</p>
                    <p className="text-xs font-medium text-teal-400">İspanya</p>
                  </div>
                  <div className="bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    1.55
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsBetting;