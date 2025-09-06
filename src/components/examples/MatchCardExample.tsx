import { MatchCard } from "@/components/ui/match-card"

const MatchCardExample = () => {
  return (
    <div className="p-6 space-y-4 bg-background">
      <h2 className="text-2xl font-bold mb-4">Maç Kartı Örnekleri</h2>
      
      {/* Example with flags (current data structure) */}
      <MatchCard
        homeTeam={{ name: "İrlanda", flag: "🇮🇪" }}
        awayTeam={{ name: "Macaristan", flag: "🇭🇺" }}
      />
      
      <MatchCard
        homeTeam={{ name: "Belçika", flag: "🇧🇪" }}
        awayTeam={{ name: "Kazakistan", flag: "🇰🇿" }}
      />
      
      <MatchCard
        homeTeam={{ name: "Real Madrid", flag: "🇪🇸" }}
        awayTeam={{ name: "Barcelona", flag: "🇪🇸" }}
      />
      
      {/* Example with actual logo URLs (for future use) */}
      <MatchCard
        homeTeam={{ 
          name: "Manchester United", 
          logo: "https://logos.sportmonks.com/football/teams/9/9.png" 
        }}
        awayTeam={{ 
          name: "Liverpool", 
          logo: "https://logos.sportmonks.com/football/teams/10/10.png" 
        }}
      />
    </div>
  )
}

export default MatchCardExample