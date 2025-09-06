import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Star, Trophy, TrendingUp, Play, Zap, Gift, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/layout/Header';

const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto flex gap-0 relative">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }` 
            : 'relative'
          }
          w-64 bg-muted/30 min-h-screen border-r
        `}>
          {/* Mobile Sidebar Header */}
          {isMobile && (
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="text-destructive font-bold">GUDUBET</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
                className="text-white hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

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
        <div className={`flex-1 bg-background min-h-screen ${isMobile && isSidebarOpen ? 'ml-0' : ''}`}>
          {/* Hero Carousel */}
          <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
            <Carousel className="h-full" opts={{ loop: true, duration: 30 }}>
              <CarouselContent className="h-full">
                {/* Gates of Olympus */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">⚡</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          Gates of Olympus
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Zeus'un Gücüyle Kazanın</p>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Hemen Oyna
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Sweet Bonanza */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-pink-900 via-purple-900 to-red-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">🍭</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                          Sweet Bonanza
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Tatlı Kazançlar Seni Bekliyor</p>
                        <Button className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Şekerli Kazanç
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Canlı Masa Oyunları */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">🃏</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                          Canlı Masa Oyunları
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Gerçek Krupiyerlerle Oyna</p>
                        <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Masaya Otur
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Crazy Time */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-orange-900 via-red-900 to-yellow-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">🎡</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
                          Crazy Time
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Çılgın Kazançlar Burada</p>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Çılgınlığa Katıl
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Monopoly Live */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">🎩</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                          Monopoly Live
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Emlak İmparatorluğu Kur</p>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Şansını Dene
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Book of Ra */}
                <CarouselItem>
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-r from-yellow-900 via-amber-900 to-orange-900 overflow-hidden">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="relative z-10 h-full flex items-center justify-center px-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl md:text-6xl mb-2 md:mb-4">📖</div>
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                          Book of Ra
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white mb-2 md:mb-3 hidden sm:block">Antik Hazineleri Keşfet</p>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm">
                          Hazine Avı
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="left-2 sm:left-4 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10" />
              <CarouselNext className="right-2 sm:right-4 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10" />
            </Carousel>
          </div>

          {/* Featured Games */}
          <div className="p-3 sm:p-4 md:p-6">
            <div className="grid gap-4">
              <Card className="bg-background border-2 border-teal-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between bg-muted px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">Öne Çıkan Oyunlar</span>
                    </div>
                  </div>
                  
                   <div className="p-2 sm:p-4">
                     <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                       <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                         <CardContent className="p-2 sm:p-4">
                           <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                             <Play className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                           </div>
                           <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">Sweet Bonanza</h3>
                           <p className="text-slate-400 text-xs hidden sm:block">Pragmatic Play</p>
                           <Button className="w-full mt-2 sm:mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm py-1 sm:py-2">
                             Oyna
                           </Button>
                         </CardContent>
                       </Card>

                       <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                         <CardContent className="p-2 sm:p-4">
                           <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                             <Play className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                           </div>
                           <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">Gates of Olympus</h3>
                           <p className="text-slate-400 text-xs hidden sm:block">Pragmatic Play</p>
                           <Button className="w-full mt-2 sm:mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm py-1 sm:py-2">
                             Oyna
                           </Button>
                         </CardContent>
                       </Card>

                       <Card className="bg-slate-800 border border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                         <CardContent className="p-2 sm:p-4">
                           <div className="aspect-video bg-gradient-to-br from-red-600 to-orange-600 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                             <Play className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                           </div>
                           <h3 className="text-white font-semibold text-xs sm:text-sm mb-1">Book of Dead</h3>
                           <p className="text-slate-400 text-xs hidden sm:block">Play'n GO</p>
                           <Button className="w-full mt-2 sm:mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm py-1 sm:py-2">
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
