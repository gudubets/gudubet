import * as React from "react"
import { cn } from "@/lib/utils"

export interface Team {
  name: string
  logo: string
}

export interface MatchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  homeTeam: Team
  awayTeam: Team
}

const MatchCard = React.forwardRef<HTMLDivElement, MatchCardProps>(
  ({ className, homeTeam, awayTeam, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between p-4 bg-card border rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer",
          className
        )}
        {...props}
      >
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <img
            src={homeTeam.logo}
            alt={`${homeTeam.name} logo`}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <span className="font-bold text-card-foreground text-sm md:text-base truncate">
            {homeTeam.name}
          </span>
        </div>

        {/* VS */}
        <div className="px-4">
          <span className="text-muted-foreground font-medium text-xs md:text-sm">
            vs
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-bold text-card-foreground text-sm md:text-base truncate text-right">
            {awayTeam.name}
          </span>
          <img
            src={awayTeam.logo}
            alt={`${awayTeam.name} logo`}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        </div>
      </div>
    )
  }
)

MatchCard.displayName = "MatchCard"

export { MatchCard }