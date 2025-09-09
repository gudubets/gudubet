import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight 
} from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import heroImage from '@/assets/hero-sports.jpg';

const HeroSection = () => {
  const { t } = useI18n();
  
  const stats = [
    { label: t('hero.active_users'), value: '50K+', icon: Users },
    { label: t('hero.daily_bets'), value: '₺2M+', icon: TrendingUp },
    { label: t('hero.win_rate'), value: '%94', icon: Award },
  ];

  const featuredMatches = [
    {
      id: 1,
      teams: 'Galatasaray vs Fenerbahçe',
      league: 'Süper Lig',
      time: '21:45',
      odds: { home: 1.85, draw: 3.20, away: 4.50 },
      isLive: false
    },
    {
      id: 2,
      teams: 'Manchester City vs Arsenal',
      league: 'Premier League',
      time: 'CANLI',
      odds: { home: 1.95, draw: 3.40, away: 3.75 },
      isLive: true
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-hero overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Sports Betting Hero"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Play className="w-3 h-3 mr-1" />
                {t('hero.live_betting_casino')}
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-gaming font-bold leading-tight">
                <span className="gradient-text-primary">{t('hero.ready_to_win')}</span>
                <br />
                <span className="text-foreground">{t('hero.are_you_ready')}</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                {t('hero.description')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white font-semibold h-14 px-8">
                {t('hero.start_now')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8">
                {t('hero.play_demo')}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="flex justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-gaming font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Matches Card */}
          <div className="space-y-6">
            <Card className="gaming-card-premium p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('hero.featured_matches')}</h3>
                  <Badge variant="secondary">{t('hero.current')}</Badge>
                </div>

                <div className="space-y-4">
                  {featuredMatches.map((match) => (
                    <div key={match.id} className="gaming-card p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{match.teams}</h4>
                            {match.isLive && (
                              <Badge variant="destructive" className="live-indicator">
                                {t('hero.live')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {match.league} • {match.time}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="h-10">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">1</div>
                            <div className="font-semibold">{match.odds.home}</div>
                          </div>
                        </Button>
                        <Button variant="outline" size="sm" className="h-10">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">X</div>
                            <div className="font-semibold">{match.odds.draw}</div>
                          </div>
                        </Button>
                        <Button variant="outline" size="sm" className="h-10">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">2</div>
                            <div className="font-semibold">{match.odds.away}</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-success hover:opacity-90">
                  {t('hero.see_all_matches')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;