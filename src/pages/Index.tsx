import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const navigate = useNavigate();
  return <div className="min-h-screen bg-black">
      <Header />
      
      {/* Main Content */}
      <div className="bg-black min-h-screen">
        {/* Hero Section */}
        <div className="relative">
          <Carousel className="h-80 md:h-96" opts={{
          loop: true,
          duration: 30
        }}>
            <CarouselContent className="h-full">
              {/* Main Bonus Banner */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-red-800 via-red-600 to-orange-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400/20 animate-pulse"></div>
                  <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-orange-400/30 animate-bounce"></div>
                  <div className="absolute top-1/3 right-1/4 text-6xl opacity-20">🎰</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-20">🎲</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-between px-8 md:px-16">
                    <div className="flex-1">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-yellow-300 text-6xl md:text-8xl">2000TL</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-yellow-300">
                          HOŞ GELDİN BONUSU
                        </h2>
                      </div>
                      <div className="text-center">
                        <Button 
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg rounded-full"
                          onClick={() => setIsRegistrationModalOpen(true)}
                        >
                          ÜYE OL
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="text-8xl md:text-9xl opacity-80">🎰</div>
                    </div>
                  </div>
                  
                  {/* Pagination Dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {Array.from({
                    length: 5
                  }, (_, i) => <div key={i} className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-white/50'}`}></div>)}
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Promotional Banners Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Address Bar */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-500 rounded-lg p-4 mb-6 text-center">
            <p className="text-black font-semibold">
              Güncel adresimiz için: <span className="bg-yellow-300 px-2 py-1 rounded">t.ly/gudubetadres</span> linkini kullanınız
            </p>
          </div>

          {/* Three Banner Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Telegram Channel */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 border-none text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">KANALA</h3>
                    <h3 className="text-2xl font-bold mb-2">KATIL</h3>
                    <p className="text-sm opacity-90">+200K ABONE</p>
                    <p className="text-xs opacity-75 mt-2">CASİBOM TELEGRAM'DA →</p>
                  </div>
                  <div className="text-6xl opacity-80">📱</div>
                </div>
              </CardContent>
            </Card>

            {/* VIP Program */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-500 border-none text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%15</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%20</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">💎</div>
                      <div className="text-sm font-bold">%25</div>
                    </div>
                  </div>
                  <Button 
                    className="bg-white text-green-600 font-bold hover:bg-gray-100"
                    onClick={() => navigate('/vip')}
                  >
                    VIP PROGRAMI →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App */}
            <Card className="bg-gradient-to-r from-orange-600 to-red-500 border-none text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-6xl">📱</div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold mb-2">MOBİL</h3>
                    <h3 className="text-xl font-bold mb-2">UYGULAMA</h3>
                    <Button className="bg-white text-orange-600 font-bold hover:bg-gray-100 text-sm">
                      İNDİR →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Winners Section */}
          <div className="mb-8">
            <h2 className="text-yellow-400 text-xl font-bold mb-4">SON KAZANANLAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[{
              name: 'Y.S.',
              game: 'Golden Penny x1000',
              amount: '31.594,50',
              avatar: '🎮'
            }, {
              name: 'S.S.',
              game: 'Flaming Hot Extreme VIP Bell...',
              amount: '42.960,00',
              avatar: '🔥'
            }, {
              name: 'O.A.',
              game: 'Book of Fallen',
              amount: '25.000,00',
              avatar: '📚'
            }, {
              name: 'M.S.',
              game: 'Gates of Olympus Super Scatter',
              amount: '32.294,50',
              avatar: '⚡'
            }].map((winner, index) => <Card key={index} className="bg-gray-900 border-gray-700 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">{winner.avatar}</div>
                      <div className="flex-1">
                        <div className="font-bold text-yellow-400">{winner.name}</div>
                        <div className="text-xs text-gray-400 truncate">{winner.game}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-400">₺{winner.amount}</div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setIsRegistrationModalOpen(false)} 
      />
    </div>;
};
export default Index;