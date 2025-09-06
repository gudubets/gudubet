import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Trophy, 
  Zap, 
  Target,
  ArrowRight,
  Users,
  Star
} from 'lucide-react';
import casinoImage from '@/assets/casino-games.jpg';
import slotImage from '@/assets/slot-machines.jpg';

const GameCategories = () => {
  const categories = [
    {
      id: 'sports',
      title: 'Spor Bahisleri',
      description: 'Futbol, basketbol, tenis ve e-spor bahisleri',
      icon: Trophy,
      image: '/placeholder.svg',
      gradient: 'from-primary to-blue-600',
      stats: { games: '500+', players: '25K' },
      featured: ['Futbol', 'Basketbol', 'Tenis', 'E-Spor']
    },
    {
      id: 'casino',
      title: 'Canlı Casino',
      description: 'Gerçek krupiyelerle canlı oyunlar',
      icon: Target,
      image: casinoImage,
      gradient: 'from-accent to-green-600',
      stats: { games: '50+', players: '12K' },
      featured: ['Rulet', 'Blackjack', 'Baccarat', 'Poker']
    },
    {
      id: 'slots',
      title: 'Slot Oyunları',
      description: 'Binlerce slot makinesi ve jackpot',
      icon: Zap,
      image: slotImage,
      gradient: 'from-gold to-yellow-500',
      stats: { games: '2000+', players: '30K' },
      featured: ['Mega Jackpot', 'Video Slots', 'Klasik Slots', 'Bonus Games']
    },
    {
      id: 'bingo',
      title: 'Tombala & Loto',
      description: 'Şans oyunları ve tombala çekilişleri',
      icon: Gamepad2,
      image: '/placeholder.svg',
      gradient: 'from-purple-500 to-pink-500',
      stats: { games: '25+', players: '8K' },
      featured: ['90 Top Tombala', 'Süper Loto', 'Sayısal Loto', 'Çılgın Sayısal']
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-gaming font-bold mb-4">
            <span className="gradient-text-primary">Oyun Kategorileri</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Spor bahislerinden casino oyunlarına, binlerce oyun seçeneği ile 
            en iyi oyun deneyimini yaşayın.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <Card 
              key={category.id} 
              className="gaming-card-premium relative overflow-hidden group cursor-pointer gaming-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90`} />
              </div>

              <div className="relative p-8 h-80">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    <Star className="w-3 h-3 mr-1" />
                    Popüler
                  </Badge>
                </div>

                <div className="space-y-4 mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="text-white/80">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <Gamepad2 className="w-4 h-4" />
                      {category.stats.games} Oyun
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {category.stats.players} Oyuncu
                    </div>
                  </div>

                  {/* Featured Games */}
                  <div className="flex flex-wrap gap-2">
                    {category.featured.map((game) => (
                      <Badge 
                        key={game} 
                        variant="outline" 
                        className="bg-white/10 text-white border-white/30 text-xs"
                      >
                        {game}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                  variant="outline"
                >
                  Oyunlara Göz At
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Promotions */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Özel Promosyonlar</h3>
            <p className="text-muted-foreground">
              Yeni üyelere özel bonuslar ve kampanyalar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="gaming-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-success mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Hoş Geldin Bonusu</h4>
              <p className="text-2xl font-bold text-success mb-2">%100</p>
              <p className="text-sm text-muted-foreground">
                İlk yatırımınıza 2000₺'ye kadar bonus
              </p>
            </Card>

            <Card className="gaming-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-gold mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h4 className="font-semibold mb-2">Free Spin</h4>
              <p className="text-2xl font-bold text-gold mb-2">50</p>
              <p className="text-sm text-muted-foreground">
                Popüler slot oyunlarında bedava çevirme
              </p>
            </Card>

            <Card className="gaming-card p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2">Canlı Casino</h4>
              <p className="text-2xl font-bold text-primary mb-2">%25</p>
              <p className="text-sm text-muted-foreground">
                Canlı casino oyunlarında kayıp bonusu
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameCategories;