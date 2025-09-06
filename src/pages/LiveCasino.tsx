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
    <div className="min-h-screen bg-black text-white">
      {/* Header Navigation - Casibom Style */}
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <a href="/" className="text-yellow-400 font-bold text-xl">
                casibom
              </a>
              
              {/* Main Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">ANA SAYFA</a>
                <a href="/sports-betting" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">SPOR</a>
                <a href="/live-betting" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">CANLI BAHİS</a>
                <a href="/casino" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">CASINO</a>
                <a href="/live-casino" className="text-yellow-400 font-semibold text-sm border border-yellow-400 rounded px-2 py-1">CANLI CASINO</a>
                <a href="/promotions" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">BONUSLAR</a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">VIP PROGRAMI</a>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <Button className="bg-white text-black hover:bg-gray-100 font-semibold px-4 py-2 text-sm">
                GİRİŞ
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 text-sm">
                ÜYE OL
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <div className="bg-black">
        {/* Hero Banner - Crazy Time Style */}
        <div className="relative h-80 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-900 via-red-800 to-yellow-600"
            style={{
              backgroundImage: `linear-gradient(45deg, 
                rgba(139, 69, 19, 0.8), 
                rgba(220, 20, 60, 0.8), 
                rgba(255, 140, 0, 0.8),
                rgba(75, 0, 130, 0.8))`
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Crazy Time Logo */}
          <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-10">
            <div className="bg-red-800 rounded-full p-4 border-4 border-yellow-400">
              <div className="text-center">
                <h1 className="text-yellow-400 font-bold text-2xl">CRAZY</h1>
                <h1 className="text-white font-bold text-2xl">TIME</h1>
              </div>
            </div>
          </div>

          {/* Evolution Logo */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white rounded px-4 py-2">
              <span className="text-black font-bold">Evolution</span>
            </div>
          </div>

          {/* Play Button */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg rounded-lg">
              HEMEN OYNA
            </Button>
          </div>

          {/* Carousel Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {Array.from({ length: 8 }, (_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${i === 2 ? 'bg-yellow-400' : 'bg-white/50'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Category Buttons */}
        <div className="bg-black border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button className="bg-yellow-500 text-black hover:bg-yellow-600 px-4 py-2 rounded text-sm font-semibold">
                  🔥 POPÜLER
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  CASIBOM ORIGINAL
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  🎰 RULET
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  🃏 BLACKJACK
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  🎯 POKER
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  ♠️ BAKARA
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  💎 DROPS&WINS
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400 px-4 py-2 text-sm">
                  📂 DİĞER
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select defaultValue="providers">
                  <SelectTrigger className="w-48 bg-yellow-500 text-black border-none">
                    <SelectValue placeholder="OYUN SAĞLAYICILARI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="providers">OYUN SAĞLAYICILARI</SelectItem>
                    <SelectItem value="evolution">Evolution Gaming</SelectItem>
                    <SelectItem value="pragmatic">Pragmatic Play</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative">
                  <Input 
                    placeholder="Oyun ara"
                    className="w-64 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Casino Games Grid */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {/* Casibom Lightning Rulet */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-red-800 to-yellow-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">🎰</span>
                      </div>
                      <div className="text-white font-bold">Live Dealer</div>
                    </div>
                  </div>
                  
                  {/* Evolution Logo */}
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">Evolution</span>
                  </div>
                  
                  {/* Turkish Flag */}
                  <div className="absolute top-2 left-2 text-lg">🇹🇷</div>
                  
                  {/* Türkçe Badge */}
                  <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                    Türkçe
                  </div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Casibom Lightning Rulet</h3>
                </div>
              </CardContent>
            </Card>

            {/* Casibom Özel Studio */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-800 to-purple-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">🃏</span>
                      </div>
                      <div className="text-white font-bold">Live Dealer</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">Evolution</span>
                  </div>
                  
                  <div className="absolute top-2 left-2 text-lg">🇹🇷</div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Casibom Özel Stüdyo</h3>
                </div>
              </CardContent>
            </Card>

            {/* Casibom Özel Rulet */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-green-800 to-blue-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="text-white font-bold">Live Dealer</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">Evolution</span>
                  </div>
                  
                  <div className="absolute top-2 left-2 text-lg">🇹🇷</div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Casibom Özel Rulet</h3>
                </div>
              </CardContent>
            </Card>

            {/* Casibom Özel Stüdyo 2 */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-purple-800 to-pink-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">♠️</span>
                      </div>
                      <div className="text-white font-bold">Live Dealer</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">Evolution</span>
                  </div>
                  
                  <div className="absolute top-2 left-2 text-lg">🇹🇷</div>
                  
                  <div className="absolute bottom-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    Casibom Özel
                  </div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Casibom Özel Stüdyo</h3>
                </div>
              </CardContent>
            </Card>

            {/* Blackjack Lobby */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-green-800 rounded-lg p-4 mb-2 mx-auto">
                        <span className="text-white text-xl font-bold">Lobby</span>
                      </div>
                      <div className="text-white font-bold">Multiple Tables</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">ImagineLive</span>
                  </div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Blackjack Lobby</h3>
                </div>
              </CardContent>
            </Card>

            {/* Casibom VIP Blackjack */}
            <Card className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-yellow-800 to-orange-600 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="relative z-10 text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                        <span className="text-2xl">👑</span>
                      </div>
                      <div className="text-white font-bold">VIP Table</div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                    <span className="text-black text-xs font-bold">casibom</span>
                  </div>
                  
                  <div className="absolute top-2 left-2 text-lg">🇹🇷</div>
                  
                  <div className="absolute bottom-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                    VIP
                  </div>
                </div>
                
                <div className="p-3 bg-black">
                  <h3 className="text-white font-semibold text-center">Casibom VIP Blackjack</h3>
                </div>
              </CardContent>
            </Card>

            {/* More games with different themes */}
            {Array.from({ length: 14 }, (_, i) => (
              <Card key={`game-${i}`} className="bg-gray-900 border border-gray-700 overflow-hidden hover:border-yellow-400 transition-colors cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className={`w-full h-48 bg-gradient-to-br ${
                      i % 5 === 0 ? 'from-red-800 to-pink-600' :
                      i % 5 === 1 ? 'from-blue-800 to-cyan-600' :
                      i % 5 === 2 ? 'from-green-800 to-emerald-600' :
                      i % 5 === 3 ? 'from-purple-800 to-violet-600' :
                      'from-orange-800 to-yellow-600'
                    } flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-black/30"></div>
                      <div className="relative z-10 text-center">
                        <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mb-2 mx-auto">
                          <span className="text-2xl">
                            {i % 4 === 0 && '🎰'}
                            {i % 4 === 1 && '🃏'}
                            {i % 4 === 2 && '♠️'}
                            {i % 4 === 3 && '🎯'}
                          </span>
                        </div>
                        <div className="text-white font-bold">Live Dealer</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 bg-white rounded px-2 py-1">
                      <span className="text-black text-xs font-bold">
                        {i % 3 === 0 ? 'Evolution' : i % 3 === 1 ? 'Pragmatic' : 'Ezugi'}
                      </span>
                    </div>
                    
                    {i % 3 === 0 && <div className="absolute top-2 left-2 text-lg">🇹🇷</div>}
                  </div>
                  
                  <div className="p-3 bg-black">
                    <h3 className="text-white font-semibold text-center">
                      {i % 4 === 0 && `Lightning Roulette ${i + 1}`}
                      {i % 4 === 1 && `Blackjack VIP ${i + 1}`}
                      {i % 4 === 2 && `Speed Baccarat ${i + 1}`}
                      {i % 4 === 3 && `Poker Room ${i + 1}`}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCasino;