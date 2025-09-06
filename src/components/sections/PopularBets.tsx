import { Eye, TrendingUp } from "lucide-react";

const mockMatches = [
  {
    id: 1,
    league: "Türkiye v İspanya",
    homeTeam: "Üst 2.5",
    matchDetails: "Üst/Alt 2.5 Gol",
    time: "15:30",
    status: "live",
    homeOdds: 1.58,
    viewers: 1250
  },
  {
    id: 2,
    league: "Almanya v Kuzey İrlanda",
    homeTeam: "Almanya",
    matchDetails: "Maç Kazananı",
    time: "21:00",
    status: "upcoming",
    homeOdds: 1.13,
    viewers: 2100
  },
  {
    id: 3,
    league: "Avusturya v Güney Kıbrıs",
    homeTeam: "Avusturya",
    matchDetails: "Maç Kazananı",
    time: "18:30",
    status: "live",
    homeOdds: 1.25,
    viewers: 890
  }
];

export function PopularBets() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Popüler Bahisler</h2>
      </div>

      <div className="grid gap-3">
        {mockMatches.map((match) => (
          <div key={match.id} className="bet-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {match.league}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{match.viewers}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">{match.homeTeam}</div>
                <div className="text-xs text-muted-foreground">{match.matchDetails}</div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button className="odds-button text-sm min-w-[60px]">
                  {match.homeOdds}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mt-4">
          <button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2 rounded-lg font-medium">
            Tüm Maçlar
          </button>
        </div>
      </div>
    </section>
  );
}