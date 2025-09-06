import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Trophy, TrendingUp, Play, Zap, Gift } from 'lucide-react';

const Index = () => {
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
                <a href="/" className="text-primary border-b-2 border-primary pb-1">Ana Sayfa</a>
                <a href="/sports-betting" className="text-muted-foreground hover:text-white transition-colors">Spor</a>
                <a href="/live-betting" className="text-muted-foreground hover:text-white transition-colors">Canlı</a>
                <a href="/casino" className="text-muted-foreground hover:text-white transition-colors">Casino</a>
                <a href="/live-casino" className="text-muted-foreground hover:text-white transition-colors">Canlı Casino</a>
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
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎰 Slot Oyunları
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🃏 Masa Oyunları
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎲 Canlı Casino
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎯 Jackpot
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎮 Sanal Sporlar
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
                Öne Çıkan Oyunlar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Star className="h-4 w-4 mr-2" />
                Yeni Oyunlar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Zap className="h-4 w-4 mr-2" />
                Hızlı Oyunlar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-destructive">
                <Gift className="h-4 w-4 mr-2" />
                Bonus Oyunları
              </Button>
            </div>
          </div>

          {/* Game Categories */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Oyun Kategorileri</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-between text-sm hover:bg-muted text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-2">🎰</span>
                  Slot Oyunları
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">450</span>
              </Button>
              <Button variant="ghost" className="w-full justify-between text-sm hover:bg-muted text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-2">🃏</span>
                  Masa Oyunları
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">120</span>
              </Button>
              <Button variant="ghost" className="w-full justify-between text-sm hover:bg-muted text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-2">🎲</span>
                  Canlı Casino
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">85</span>
              </Button>
              <Button variant="ghost" className="w-full justify-between text-sm hover:bg-muted text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-2">🎯</span>
                  Jackpot
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">45</span>
              </Button>
            </div>
          </div>

          {/* Providers */}
          <div className="p-4">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Oyun Sağlayıcıları</h3>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Pragmatic Play <span className="ml-auto text-xs">150</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                Evolution Gaming <span className="ml-auto text-xs">85</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted text-muted-foreground">
                NetEnt <span className="ml-auto text-xs">95</span>
              </Button>
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
                  GUDUBET
                </h1>
                <p className="text-xl text-white mb-4">En İyi Casino Oyunları Burada</p>
                <div className="flex space-x-2 justify-center">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-1 rounded ${i === 5 ? 'bg-red-500' : 'bg-white/50'}`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Games */}
          <div className="p-6">
            <div className="grid gap-4">
              <Card className="bg-background border-2 border-teal-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between bg-muted px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">Öne Çıkan Oyunlar</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-3 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-1">Sweet Bonanza</h3>
                          <p className="text-slate-400 text-xs">Pragmatic Play</p>
                          <Button className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                            Oyna
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-3 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-1">Gates of Olympus</h3>
                          <p className="text-slate-400 text-xs">Pragmatic Play</p>
                          <Button className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                            Oyna
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gradient-to-br from-red-600 to-orange-600 rounded-lg mb-3 flex items-center justify-center">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-sm mb-1">Book of Dead</h3>
                          <p className="text-slate-400 text-xs">Play'n GO</p>
                          <Button className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white">
                            Oyna
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Casino Section */}
            <Card className="mt-4 bg-slate-800 border border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Canlı Casino</h3>
                    <p className="text-sm text-teal-400">Gerçek krupiyerlerle oyna</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-700 border border-slate-600 hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-green-600 to-emerald-600 rounded mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">♠️</span>
                      </div>
                      <h4 className="text-white text-sm font-medium">Blackjack</h4>
                      <p className="text-slate-400 text-xs">Evolution</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border border-slate-600 hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-red-600 to-rose-600 rounded mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">🎰</span>
                      </div>
                      <h4 className="text-white text-sm font-medium">Rulet</h4>
                      <p className="text-slate-400 text-xs">Evolution</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border border-slate-600 hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-purple-600 to-violet-600 rounded mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">🃏</span>
                      </div>
                      <h4 className="text-white text-sm font-medium">Baccarat</h4>
                      <p className="text-slate-400 text-xs">Evolution</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700 border border-slate-600 hover:border-teal-500 transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-yellow-600 to-amber-600 rounded mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">🎲</span>
                      </div>
                      <h4 className="text-white text-sm font-medium">Poker</h4>
                      <p className="text-slate-400 text-xs">Evolution</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Promotions */}
        <div className="w-80 bg-muted/30 min-h-screen border-l">
          <div className="sticky top-0">
            {/* Promotions Header */}
            <div className="bg-destructive text-destructive-foreground p-4">
              <h3 className="font-semibold">Aktif Promosyonlar</h3>
            </div>

            {/* Promotions Content */}
            <div className="p-4 space-y-4">
              <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5" />
                    <span className="font-semibold">Hoşgeldin Bonusu</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">%100 Bonus + 100 Freespin</p>
                  <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
                    Bonus Al
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Günlük Cashback</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">%10 Kayıp İadesi</p>
                  <Button className="w-full bg-white text-green-600 hover:bg-gray-100">
                    Detaylar
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold">Haftalık Turnuva</span>
                  </div>
                  <p className="text-sm opacity-90 mb-3">50.000₺ Ödül Havuzu</p>
                  <Button className="w-full bg-white text-orange-600 hover:bg-gray-100">
                    Katıl
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Winners */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <h3 className="font-semibold text-white text-sm">Son Kazananlar</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div>
                    <p className="text-sm font-medium text-white">Mehmet K.</p>
                    <p className="text-xs text-slate-400">Sweet Bonanza</p>
                  </div>
                  <div className="text-green-400 font-bold text-sm">
                    ₺2,450
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div>
                    <p className="text-sm font-medium text-white">Ayşe M.</p>
                    <p className="text-xs text-slate-400">Gates of Olympus</p>
                  </div>
                  <div className="text-green-400 font-bold text-sm">
                    ₺1,890
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div>
                    <p className="text-sm font-medium text-white">Ali D.</p>
                    <p className="text-xs text-slate-400">Book of Dead</p>
                  </div>
                  <div className="text-green-400 font-bold text-sm">
                    ₺3,200
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

export default Index;
