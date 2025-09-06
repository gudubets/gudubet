import React, { useState, useEffect } from 'react';
import { Search, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
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
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Oyunlar yükleniyor...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Canlı Casino – Gerçek Krupiyerlerle Oyna
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Blackjack, Rulet, Baccarat ve daha fazlası
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-[#FF4D00] hover:bg-[#FF4D00]/90 text-white px-8 py-3 text-lg"
              >
                <Play className="mr-2 h-5 w-5" />
                Hemen Oyna
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Panel */}
          <aside className="lg:w-80">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filtreler</h3>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Oyun Ara</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Oyun adı..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Provider Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sağlayıcı</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-6 w-full mb-8">
                {gameCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {gameCategories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {getFilteredGamesByCategory(category.id).map(game => (
                      <Card 
                        key={game.id} 
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <Button
                                className="bg-[#00C853] hover:bg-[#00C853]/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                size="sm"
                              >
                                <Play className="mr-1 h-4 w-4" />
                                Oyna
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-center">{game.name}</h3>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  {getFilteredGamesByCategory(category.id).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Bu kategoride oyun bulunamadı.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveCasino;