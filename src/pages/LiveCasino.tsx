import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Users, Star, Crown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';

interface LiveTable {
  id: string;
  name: string;
  game: string;
  dealer: string;
  minBet: number;
  maxBet: number;
  viewers: number;
  thumbnail: string;
  isVip: boolean;
  provider: string;
}

const LiveCasino = () => {
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const gameCategories = [
    { id: 'all', name: 'Hepsi', icon: '🎮' },
    { id: 'roulette', name: 'Rulet', icon: '🎯' },
    { id: 'blackjack', name: 'Blackjack', icon: '🃏' },
    { id: 'baccarat', name: 'Baccarat', icon: '💎' },
  ];

  const liveTables: LiveTable[] = [
    {
      id: '1',
      name: 'GuduBet Lightning Rulet',
      game: 'roulette',
      dealer: 'Elena',
      minBet: 1,
      maxBet: 1000,
      viewers: 1247,
      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=250&fit=crop',
      isVip: false,
      provider: 'evolution'
    },
    {
      id: '2',
      name: 'GuduBet Özel Stüdyo',
      game: 'blackjack',
      dealer: 'Ayşe',
      minBet: 5,
      maxBet: 2500,
      viewers: 856,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      isVip: true,
      provider: 'pragmatic'
    },
    {
      id: '3',
      name: 'GuduBet VIP Blackjack',
      game: 'blackjack',
      dealer: 'Zeynep',
      minBet: 25,
      maxBet: 10000,
      viewers: 287,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      isVip: true,
      provider: 'authentic'
    }
  ];

  const filteredTables = selectedGame === 'all' 
    ? liveTables 
    : liveTables.filter(table => table.game === selectedGame);

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative h-80 md:h-96 bg-gradient-to-r from-red-900 via-purple-900 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              CANLI CASİNO
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-white/90">
              Gerçek krupiyerlerle canlı casino deneyimi
            </p>
            <div className="flex justify-center items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{liveTables.reduce((sum, table) => sum + table.viewers, 0).toLocaleString()} aktif oyuncu</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                <span>{liveTables.length} masa</span>
              </div>
            </div>
            <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold">
              Şimdi Oyna
            </Button>
          </div>
        </div>
      </div>

      {/* Game Categories */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gameCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedGame === category.id ? "default" : "ghost"}
                onClick={() => setSelectedGame(category.id)}
                className="whitespace-nowrap text-white hover:bg-gray-800"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <Card key={table.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-black border-gray-800 overflow-hidden">
              <div className="relative">
                <img
                  src={table.thumbnail}
                  alt={table.name}
                  className="w-full h-48 object-cover"
                />
                
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    🔴 CANLI
                  </Badge>
                </div>
                
                {table.isVip && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/70 rounded-full px-2 py-1 flex items-center gap-1 text-white text-xs">
                    <Users className="w-3 h-3" />
                    {table.viewers.toLocaleString()}
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Play className="w-5 h-5 mr-2" />
                    Masaya Katıl
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-white font-semibold text-center">{table.name}</h3>
                <p className="text-gray-400 text-sm text-center">Krupiye: {table.dealer}</p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
                  <span>Min: ₺{table.minBet}</span>
                  <span>Max: ₺{table.maxBet.toLocaleString()}</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Oyna
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LiveCasino;