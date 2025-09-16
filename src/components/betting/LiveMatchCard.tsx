import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Star,
  BarChart3,
  TrendingUp
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

interface LiveMatchCardProps {
  match: LiveMatch;
  onAddToBetSlip: (match: LiveMatch, odds: LiveOdds) => void;
  onShowDetails: (match: LiveMatch) => void;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
  match,
  onAddToBetSlip,
  onShowDetails
}) => {
  // Group odds by market type
  const mainOdds = match.odds.filter(odds => 
    odds.market_type === '1X2' || odds.market_type === 'ML'
  );
  
  const otherOdds = match.odds.filter(odds => 
    odds.market_type !== '1X2' && odds.market_type !== 'ML'
  ).slice(0, 2); // Show max 2 additional markets

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

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      {match.is_featured && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
            <Star className="w-3 h-3 mr-1" />
            Öne Çıkan
          </Badge>
        </div>
      )}
      
      <CardContent className="p-2 md:p-4">
        {/* Mobile Compact Layout */}
        <div className="md:hidden">
          {/* League and Time Header */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {match.league}
            </Badge>
            <div className="flex items-center gap-2">
               <Badge variant="destructive" className="text-red-600 bg-red-50 border-red-200">
                 <Clock className="w-3 h-3 mr-1" />
                 {match.match_time || `${match.match_minute}'`}
               </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onShowDetails(match)}
                className="p-1"
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Teams Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{getTeamLogo(match.home_team_logo)}</span>
              <span className="font-medium text-sm truncate">{match.home_team}</span>
            </div>
            
            <div className="px-3">
              <div className="text-lg font-bold text-primary">
                {match.home_score} - {match.away_score}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="font-medium text-sm truncate">{match.away_team}</span>
              <span className="text-lg">{getTeamLogo(match.away_team_logo)}</span>
            </div>
          </div>

          {/* Main Odds Row */}
          {mainOdds.length > 0 && (
            <div className="grid grid-cols-3 gap-1 mb-2">
              {mainOdds.map((odds) => (
                <Button
                  key={odds.id}
                  variant="outline"
                  className="h-12 flex flex-col justify-center hover:bg-primary hover:text-primary-foreground"
                  onClick={() => onAddToBetSlip(match, odds)}
                >
                  <span className="text-xs opacity-75 leading-tight">{odds.selection_name}</span>
                  <span className="font-bold text-sm">{odds.odds_value.toFixed(2)}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {match.viewers_count?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0'}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowDetails(match)}
              className="text-xs text-primary h-6 px-2"
            >
              +{match.odds.length - mainOdds.length} oran daha
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {match.league}
              </Badge>
               <Badge variant="destructive" className="text-red-600 bg-red-50 border-red-200">
                 <Clock className="w-3 h-3 mr-1" />
                 {match.match_time || `${match.match_minute}'`}
               </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="w-3 h-3" />
                {match.viewers_count?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0'}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onShowDetails(match)}
                className="text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Teams and Score */}
          <div 
            className="grid grid-cols-3 items-center gap-4 mb-4 cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => onShowDetails(match)}
          >
            {/* Home Team */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="font-semibold text-lg truncate">{match.home_team}</span>
                <span className="text-2xl">{getTeamLogo(match.home_team_logo)}</span>
              </div>
            </div>
            
            {/* Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {match.home_score} - {match.away_score}
              </div>
              {match.period && (
                <p className="text-sm text-muted-foreground">{match.period}</p>
              )}
            </div>
            
            {/* Away Team */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTeamLogo(match.away_team_logo)}</span>
                <span className="font-semibold text-lg truncate">{match.away_team}</span>
              </div>
            </div>
          </div>

          {/* Main Odds */}
          {mainOdds.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {mainOdds[0]?.market_name}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {mainOdds.map((odds) => (
                  <Button
                    key={odds.id}
                    variant="outline"
                    className="h-12 flex flex-col gap-1 hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={() => onAddToBetSlip(match, odds)}
                  >
                    <span className="text-xs opacity-75">{odds.selection_name}</span>
                    <span className="font-bold">{odds.odds_value.toFixed(2)}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Markets */}
          {otherOdds.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {otherOdds.reduce((acc, odds) => {
                const existingMarket = acc.find(item => item.market === odds.market_name);
                if (existingMarket) {
                  existingMarket.odds.push(odds);
                } else {
                  acc.push({ market: odds.market_name, odds: [odds] });
                }
                return acc;
              }, [] as { market: string; odds: LiveOdds[] }[]).map((market, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{market.market}</p>
                  <div className="flex gap-1">
                    {market.odds.map((odds) => (
                      <Button
                        key={odds.id}
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => onAddToBetSlip(match, odds)}
                      >
                        <div className="text-center">
                          <div className="text-xs opacity-75">{odds.selection_name}</div>
                          <div className="font-semibold">{odds.odds_value.toFixed(2)}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show More Odds Link */}
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShowDetails(match)}
              className="text-primary hover:text-primary/80"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              +{match.odds.length - mainOdds.length - otherOdds.length} oran daha
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMatchCard;