import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  Play, 
  TrendingUp, 
  Zap,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { toast } from 'sonner';

interface Game {
  id: string;
  title: string;
  provider: string;
  thumbnail: string;
  category: string;
  isPopular: boolean;
  isNew: boolean;
  rtp?: number;
}

const Casino = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Hepsi', icon: '🎮' },
    { id: 'slots', name: 'Slot', icon: '🎰' },
    { id: 'table', name: 'Masa Oyunları', icon: '🃏' },
    { id: 'jackpot', name: 'Jackpot', icon: '💎' },
    { id: 'new', name: 'Yeni', icon: '⭐' },
    { id: 'popular', name: 'Popüler', icon: '🔥' },
  ];

  // Mock games data
  useEffect(() => {
    const mockGames: Game[] = [
      {
        id: '1',
        title: 'Gates of Olympus',
        provider: 'Pragmatic Play',
        thumbnail: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=300&h=200&fit=crop',
        category: 'slots',
        isPopular: true,
        isNew: false,
        rtp: 96.5
      },
      {
        id: '2',
        title: 'Sweet Bonanza',
        provider: 'Pragmatic Play',
        thumbnail: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=300&h=200&fit=crop',
        category: 'slots',
        isPopular: true,
        isNew: false,
        rtp: 96.48
      },
      {
        id: '3',
        title: 'Book of Dead',
        provider: 'Play\'n GO',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
        category: 'slots',
        isPopular: false,
        isNew: true,
        rtp: 94.25
      },
      {
        id: '4',
        title: 'Lightning Roulette',
        provider: 'Evolution',
        thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop',
        category: 'table',
        isPopular: true,
        isNew: false,
        rtp: 97.3
      },
      {
        id: '5',
        title: 'Mega Moolah',
        provider: 'Microgaming',
        thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
        category: 'jackpot',
        isPopular: true,
        isNew: false,
        rtp: 88.12
      },
      {
        id: '6',
        title: 'Blackjack Classic',
        provider: 'NetEnt',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
        category: 'table',
        isPopular: false,
        isNew: true,
        rtp: 99.28
      }
    ];

    setTimeout(() => {
      setGames(mockGames);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter games based on search and category
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'new') {
        matchesCategory = game.isNew;
      } else if (selectedCategory === 'popular') {
        matchesCategory = game.isPopular;
      } else {
        matchesCategory = game.category === selectedCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  const playGame = (gameId: string) => {
    // Navigate to slot game for slot games
    if (gameId === '1' || gameId === '2' || gameId === '3') { // Slot games
      // Map game IDs to actual slot game slugs
      const gameMapping: { [key: string]: string } = {
        '1': 'treasure-quest',
        '2': 'lucky-fruits', 
        '3': 'treasure-quest'
      };
      
      const slug = gameMapping[gameId] || 'treasure-quest';
      window.location.href = `/slot/${slug}`;
    } else {
      console.log(`Playing game ${gameId}`);
      toast.success('Oyun yakında açılacak!');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Header */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Casino Oyunları</h1>
              <p className="text-muted-foreground">
                {filteredGames.length} oyun bulundu
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Oyun ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="flex items-center gap-2"
                onClick={() => setSelectedCategory(category.id)}
              >
                <span>{category.icon}</span>
                {category.name}
                {category.id !== 'all' && (
                  <Badge variant="secondary" className="ml-1">
                    {category.id === 'new' 
                      ? games.filter(g => g.isNew).length
                      : category.id === 'popular' 
                      ? games.filter(g => g.isPopular).length
                      : games.filter(g => g.category === category.id).length
                    }
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          {/* Providers */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Sağlayıcılar:</span>
            {Array.from(new Set(games.map(g => g.provider))).map(provider => (
              <Badge key={provider} variant="outline" className="text-xs">
                {provider} ({games.filter(g => g.provider === provider).length})
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content - Games */}
        <div className="w-full">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Oyunlar yükleniyor...</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredGames.map((game) => (
                      <Card key={game.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-105 bg-black border-gray-800">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={game.thumbnail}
                              alt={game.title}
                              className="w-full h-32 object-cover rounded-t-lg"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-lg">
                              <Button
                                size="sm"
                                onClick={() => playGame(game.id)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Oyna
                              </Button>
                            </div>
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex gap-1">
                              {game.isNew && (
                                <Badge className="bg-green-500 text-xs">
                                  Yeni
                                </Badge>
                              )}
                              {game.isPopular && (
                                <Badge className="bg-red-500 text-xs">
                                  Popüler
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 text-white truncate">
                              {game.title}
                            </h3>
                            <p className="text-xs text-gray-400 mb-2">
                              {game.provider}
                            </p>
                            {game.rtp && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">RTP:</span>
                                <span className="text-green-400">{game.rtp}%</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredGames.map((game) => (
                      <Card key={game.id} className="group hover:shadow-lg transition-shadow bg-black border-gray-800">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={game.thumbnail}
                              alt={game.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-white">{game.title}</h3>
                                {game.isNew && (
                                  <Badge className="bg-green-500 text-xs">Yeni</Badge>
                                )}
                                {game.isPopular && (
                                  <Badge className="bg-red-500 text-xs">Popüler</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mb-1">{game.provider}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Kategori: {categories.find(c => c.id === game.category)?.name}</span>
                                {game.rtp && (
                                  <span className="text-green-400">RTP: {game.rtp}%</span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => playGame(game.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Oyna
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredGames.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Arama kriterlerinize uygun oyun bulunamadı.
                    </p>
                  </div>
                )}
                </>
              )}
          </div>
        </div>

      <Footer />
    </div>
  );
};

export default Casino;