import React, { useState, useEffect } from 'react';
import { Search, Play, Star, Trophy, TrendingUp, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const LiveCasino = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [games, setGames] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch live casino games with provider info
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select(`
            *,
            game_providers (
              id,
              name,
              logo_url
            )
          `)
          .eq('is_live', true)
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('name');

        if (gamesError) throw gamesError;

        // Fetch providers
        const { data: providersData, error: providersError } = await supabase
          .from('game_providers')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (providersError) throw providersError;

        setGames(gamesData || []);
        setProviders([
          { id: 'all', name: 'Tüm Sağlayıcılar' },
          ...(providersData || [])
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const gameCategories = [
    { id: 'all', name: 'Tümü' },
    { id: 'blackjack', name: 'Blackjack' },
    { id: 'roulette', name: 'Rulet' },
    { id: 'baccarat', name: 'Baccarat' },
    { id: 'poker', name: 'Poker' },
    { id: 'show', name: 'Show Games' }
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || game.provider_id === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const getFilteredGamesByCategory = (category: string) => {
    if (category === 'all') return filteredGames;
    return filteredGames.filter(game => game.category === category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Oyunlar yükleniyor...</p>
        </div>
      </div>
    );
  }

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
                <a href="/" className="text-muted-foreground hover:text-white transition-colors">Ana Sayfa</a>
                <a href="/sports-betting" className="text-muted-foreground hover:text-white transition-colors">Spor</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">Canlı</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">Casino</a>
                <a href="/live-casino" className="text-primary border-b-2 border-primary pb-1">Canlı Casino</a>
                <a href="#" className="text-muted-foreground hover:text-white transition-colors">Promosyonlar</a>
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

        {/* Game Categories */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-8">
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-primary">
                  🎲 Canlı Casino
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🃏 Blackjack
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎰 Rulet
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  ♠️ Baccarat
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎪 Show Games
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
        {/* Left Sidebar */}
        <div className="w-64 bg-muted/30 min-h-screen border-r">
          {/* Quick Links */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Hızlı Linkler</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Trophy className="h-4 w-4 mr-2" />
                Öne Çıkan Masalar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Star className="h-4 w-4 mr-2" />
                VIP Masaları
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Zap className="h-4 w-4 mr-2" />
                Hızlı Masalar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-destructive">
                <Gift className="h-4 w-4 mr-2" />
                Bonus Masaları
              </Button>
            </div>
          </div>

          {/* Game Categories */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Oyun Kategorileri</h3>
            <div className="space-y-1">
              {gameCategories.map((category) => (
                <Button 
                  key={category.id}
                  variant="ghost" 
                  className="w-full justify-between text-sm hover:bg-muted text-muted-foreground"
                >
                  <span className="flex items-center">
                    <span className="mr-2">
                      {category.id === 'blackjack' && '🃏'}
                      {category.id === 'roulette' && '🎰'}
                      {category.id === 'baccarat' && '♠️'}
                      {category.id === 'poker' && '🎯'}
                      {category.id === 'show' && '🎪'}
                      {category.id === 'all' && '🎲'}
                    </span>
                    {category.name}
                  </span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    {Math.floor(Math.random() * 50) + 10}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Providers */}
          <div className="p-4">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Oyun Sağlayıcıları</h3>
            <div className="space-y-1">
              {providers.slice(1).map(provider => (
                <Button 
                  key={provider.id}
                  variant="ghost" 
                  className="w-full justify-start text-sm hover:bg-muted text-muted-foreground"
                >
                  {provider.name} <span className="ml-auto text-xs">{Math.floor(Math.random() * 20) + 5}</span>
                </Button>
              ))}
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
                  CANLI CASINO
                </h1>
                <p className="text-xl text-white mb-4">Gerçek Krupiyerlerle Oyna</p>
                <div className="flex space-x-2 justify-center">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-1 rounded ${i === 3 ? 'bg-red-500' : 'bg-white/50'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Game Tabs */}
          <div className="p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-6 w-full max-w-3xl">
                  {gameCategories.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="text-sm">
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {gameCategories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getFilteredGamesByCategory(category.id).length > 0 ? (
                      getFilteredGamesByCategory(category.id).map(game => (
                        <Card 
                          key={game.id} 
                          className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <CardContent className="p-0">
                            <div className="relative">
                              <img
                                src={game.thumbnail_url || '/placeholder.svg'}
                                alt={game.name}
                                className="w-full h-48 object-cover"
                              />
                              <img
                                src={game.game_providers?.logo_url || '/placeholder.svg'}
                                alt={game.game_providers?.name || 'Provider'}
                                className="absolute top-2 right-2 w-8 h-8 bg-white rounded p-1"
                              />
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <Button
                                  className="bg-teal-600 hover:bg-teal-700 text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                                  size="sm"
                                >
                                  <Play className="mr-1 h-4 w-4" />
                                  Oyna
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-center text-white">{game.name}</h3>
                              <p className="text-center text-slate-400 text-sm mt-1">
                                {game.game_providers?.name || 'Evolution Gaming'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      // Mock data for empty categories
                      Array.from({ length: 8 }, (_, i) => (
                        <Card 
                          key={i}
                          className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <CardContent className="p-0">
                            <div className="relative">
                              <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <span className="text-4xl">
                                  {category.id === 'blackjack' && '🃏'}
                                  {category.id === 'roulette' && '🎰'}
                                  {category.id === 'baccarat' && '♠️'}
                                  {category.id === 'poker' && '🎯'}
                                  {category.id === 'show' && '🎪'}
                                  {category.id === 'all' && '🎲'}
                                </span>
                              </div>
                              <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded p-1 flex items-center justify-center">
                                <span className="text-xs font-bold">E</span>
                              </div>
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <Button
                                  className="bg-teal-600 hover:bg-teal-700 text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                                  size="sm"
                                >
                                  <Play className="mr-1 h-4 w-4" />
                                  Oyna
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-center text-white">
                                {category.name} Masası {i + 1}
                              </h3>
                              <p className="text-center text-slate-400 text-sm mt-1">Evolution Gaming</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Live Tables */}
        <div className="w-80 bg-muted/30 min-h-screen border-l">
          <div className="sticky top-0">
            {/* Live Tables Header */}
            <div className="bg-destructive text-destructive-foreground p-4">
              <h3 className="font-semibold">Canlı Masalar</h3>
            </div>

            {/* Live Tables Content */}
            <div className="p-4 space-y-4">
              <Card className="bg-slate-800 border border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-white">Blackjack VIP</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Evolution Gaming</p>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Oyuncular:</span>
                    <span className="text-white">7/7</span>
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                    İzle
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-white">Auto Roulette</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Evolution Gaming</p>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Oyuncular:</span>
                    <span className="text-white">12/∞</span>
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                    Katıl
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="font-semibold text-white">Speed Baccarat</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Evolution Gaming</p>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-400">Oyuncular:</span>
                    <span className="text-white">3/8</span>
                  </div>
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white" size="sm">
                    Katıl
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Popular Games */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-red-400" />
                <h3 className="font-semibold text-white text-sm">Popüler Masalar</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Lightning Roulette</p>
                    <p className="text-xs text-slate-400">Evolution Gaming</p>
                    <p className="text-xs font-medium text-teal-400">Çarpanlar: 500x</p>
                  </div>
                  <div className="text-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-1"></div>
                    <span className="text-xs text-slate-400">CANLI</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Crazy Time</p>
                    <p className="text-xs text-slate-400">Evolution Gaming</p>
                    <p className="text-xs font-medium text-teal-400">Bonus Round</p>
                  </div>
                  <div className="text-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mb-1"></div>
                    <span className="text-xs text-slate-400">AÇIK</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Monopoly Live</p>
                    <p className="text-xs text-slate-400">Evolution Gaming</p>
                    <p className="text-xs font-medium text-teal-400">Mega Bonus</p>
                  </div>
                  <div className="text-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mb-1"></div>
                    <span className="text-xs text-slate-400">CANLI</span>
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

export default LiveCasino;