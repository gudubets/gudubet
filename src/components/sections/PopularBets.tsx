import { Clock, Users, TrendingUp } from "lucide-react";

const mockMatches = [
  {
    id: 1,
    league: "Süper Lig",
    homeTeam: "Galatasaray",
    awayTeam: "Fenerbahçe",
    date: "15:30",
    status: "live",
    odds: {
      home: 2.15,
      draw: 3.40,
      away: 3.20,
    },
    viewers: 15420,
  },
  {
    id: 2,
    league: "Premier League",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    date: "18:00",
    status: "upcoming",
    odds: {
      home: 1.85,
      draw: 3.60,
      away: 4.20,
    },
    viewers: 8930,
  },
  {
    id: 3,
    league: "La Liga",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    date: "20:30",
    status: "upcoming",
    odds: {
      home: 2.10,
      draw: 3.30,
      away: 3.40,
    },
    viewers: 12350,
  },
  {
    id: 4,
    league: "NBA",
    homeTeam: "Lakers",
    awayTeam: "Warriors",
    date: "02:30",
    status: "upcoming",
    odds: {
      home: 1.95,
      draw: null,
      away: 1.85,
    },
    viewers: 5670,
  },
];

export function PopularBets() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Popüler Bahisler
        </h2>
        <span className="text-sm text-muted-foreground">
          Canlı güncelleniyor
        </span>
      </div>

      <div className="grid gap-4">
        {mockMatches.map((match) => (
          <div key={match.id} className="bet-card p-4">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                  {match.league}
                </span>
                {match.status === "live" && (
                  <div className="flex items-center gap-1 text-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">CANLI</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{match.viewers?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{match.date}</span>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-3 items-center gap-4 mb-4">
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{match.homeTeam}</h3>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-muted-foreground">VS</span>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{match.awayTeam}</h3>
              </div>
            </div>

            {/* Odds */}
            <div className="grid grid-cols-3 gap-3">
              <button className="odds-button group">
                <div className="text-xs text-muted-foreground mb-1">1</div>
                <div className="font-bold group-hover:text-current">
                  {match.odds.home}
                </div>
              </button>
              
              {match.odds.draw && (
                <button className="odds-button group">
                  <div className="text-xs text-muted-foreground mb-1">X</div>
                  <div className="font-bold group-hover:text-current">
                    {match.odds.draw}
                  </div>
                </button>
              )}
              
              <button className="odds-button group">
                <div className="text-xs text-muted-foreground mb-1">2</div>
                <div className="font-bold group-hover:text-current">
                  {match.odds.away}
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}