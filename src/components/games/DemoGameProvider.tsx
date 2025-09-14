import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalGameFrame } from './ExternalGameFrame';
import { Play, Star, Zap } from 'lucide-react';

interface DemoGame {
  id: string;
  name: string;
  provider: 'NetEnt' | 'EGT' | 'Pragmatic Play';
  thumbnail: string;
  demoUrl: string;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  category: string;
  featured?: boolean;
}

// Demo game configurations for major providers
const DEMO_GAMES: DemoGame[] = [
  // NetEnt Games
  {
    id: 'netent-starburst',
    name: 'Starburst',
    provider: 'NetEnt',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop',
    demoUrl: 'https://www.netent.com/games/starburst-demo',
    rtp: 96.1,
    volatility: 'low',
    category: 'slot',
    featured: true
  },
  {
    id: 'netent-gonzo',
    name: "Gonzo's Quest",
    provider: 'NetEnt',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
    demoUrl: 'https://www.netent.com/games/gonzos-quest-demo',
    rtp: 95.97,
    volatility: 'medium',
    category: 'slot',
    featured: true
  },
  {
    id: 'netent-dead-or-alive',
    name: 'Dead or Alive',
    provider: 'NetEnt',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    demoUrl: 'https://www.netent.com/games/dead-or-alive-demo',
    rtp: 96.82,
    volatility: 'high',
    category: 'slot'
  },
  // EGT Games
  {
    id: 'egt-burning-hot',
    name: 'Burning Hot',
    provider: 'EGT',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop',
    demoUrl: 'https://www.egt-interactive.com/games/burning-hot-demo',
    rtp: 96.45,
    volatility: 'medium',
    category: 'slot',
    featured: true
  },
  {
    id: 'egt-fruit-cocktail',
    name: 'Fruit Cocktail',
    provider: 'EGT',
    thumbnail: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&h=200&fit=crop',
    demoUrl: 'https://www.egt-interactive.com/games/fruit-cocktail-demo',
    rtp: 95.85,
    volatility: 'low',
    category: 'slot'
  },
  {
    id: 'egt-rise-of-ra',
    name: 'Rise of Ra',
    provider: 'EGT',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    demoUrl: 'https://www.egt-interactive.com/games/rise-of-ra-demo',
    rtp: 97.11,
    volatility: 'high',
    category: 'slot'
  },
  // Pragmatic Play Games
  {
    id: 'pragmatic-wolf-gold',
    name: 'Wolf Gold',
    provider: 'Pragmatic Play',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs25wolfgold',
    rtp: 96.01,
    volatility: 'medium',
    category: 'slot',
    featured: true
  },
  {
    id: 'pragmatic-sweet-bonanza',
    name: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    thumbnail: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&h=200&fit=crop',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20fruitsw',
    rtp: 96.48,
    volatility: 'high',
    category: 'slot',
    featured: true
  },
  {
    id: 'pragmatic-gates-olympus',
    name: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20olympgate',
    rtp: 96.5,
    volatility: 'high',  
    category: 'slot'
  },
  {
    id: 'pragmatic-big-bass-bonanza',
    name: 'Big Bass Bonanza',
    provider: 'Pragmatic Play',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
    demoUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs10bbbonanza',
    rtp: 96.71,
    volatility: 'medium',
    category: 'slot'
  }
];

interface DemoGameProviderProps {
  selectedProvider?: 'NetEnt' | 'EGT' | 'Pragmatic Play' | 'all';
  showFeatured?: boolean;
  limit?: number;
}

export const DemoGameProvider: React.FC<DemoGameProviderProps> = ({
  selectedProvider = 'all',
  showFeatured = false,
  limit
}) => {
  const [selectedGame, setSelectedGame] = useState<DemoGame | null>(null);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);

  // Filter games based on props
  let filteredGames = DEMO_GAMES;
  
  if (selectedProvider !== 'all') {
    filteredGames = filteredGames.filter(game => game.provider === selectedProvider);
  }
  
  if (showFeatured) {
    filteredGames = filteredGames.filter(game => game.featured);
  }
  
  if (limit) {
    filteredGames = filteredGames.slice(0, limit);
  }

  const handlePlayDemo = (game: DemoGame) => {
    setSelectedGame(game);
    setGameDialogOpen(true);
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'NetEnt': return 'bg-blue-600';
      case 'EGT': return 'bg-purple-600';
      case 'Pragmatic Play': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <Card key={game.id} className="group cursor-pointer hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 bg-gray-900 border-gray-700">
            <CardHeader className="p-0 relative">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    onClick={() => handlePlayDemo(game)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Demo Oyna
                  </Button>
                </div>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge className={`${getProviderColor(game.provider)} text-white text-xs`}>
                    {game.provider}
                  </Badge>
                  {game.featured && (
                    <Badge className="bg-yellow-500 text-black text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Öne Çıkan
                    </Badge>
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <Badge className={`${getVolatilityColor(game.volatility)} text-white text-xs`}>
                    {game.volatility.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <CardTitle className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                {game.name}
              </CardTitle>
              
              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span>RTP: {game.rtp}%</span>
                <span className="capitalize">{game.category}</span>
              </div>
              
              <Button
                onClick={() => handlePlayDemo(game)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Demo Oyna
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Game Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-6xl w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold text-white">
              {selectedGame?.name} - {selectedGame?.provider} Demo
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedGame?.provider} sağlayıcısından {selectedGame?.name} demo oyunu
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 p-6 pt-0">
            {selectedGame && (
              <ExternalGameFrame
                gameUrl={selectedGame.demoUrl}
                gameTitle={selectedGame.name}
                provider={selectedGame.provider}
                onClose={() => setGameDialogOpen(false)}
                onError={(error) => {
                  console.error('Demo game error:', error);
                  setGameDialogOpen(false);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};