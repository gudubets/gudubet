import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import FloatingSupportButton from '@/components/ui/floating-support-button';
import { useI18n } from '@/hooks/useI18n';
import { Send } from 'lucide-react';
import treasureImage from '@/assets/treasure.png';
const Index = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    t
  } = useI18n();
  return <div className="min-h-screen bg-black">
      <Header />
      
      {/* Main Content */}
      <div className="bg-black min-h-screen">
        {/* Hero Section - Animated Advertisement Slider */}
        <div className="relative">
          <Carousel className="h-80 md:h-96" opts={{
          loop: true,
          duration: 30
        }}>
            <CarouselContent className="h-full">
              {/* Slide 1 - Main Bonus Banner */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-red-800 via-red-600 to-orange-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  {/* Animated Decorative Elements */}
                  <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400/20 animate-pulse"></div>
                  <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-orange-400/30 animate-bounce"></div>
                  <div className="absolute top-1/3 right-1/4 text-6xl opacity-20 animate-spin">🎰</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-20 animate-pulse">🎲</div>
                  
                  <div className="relative z-10 h-full w-full cursor-pointer" onClick={() => setIsRegistrationModalOpen(true)}>
                    <img 
                      src="/lovable-uploads/820d571f-8704-4eaf-8b48-fa3174655991.png" 
                      alt="Gudubet Hoşgeldin Bonusu 500 TL" 
                      className="w-full h-full object-cover"
                      style={{ 
                        imageRendering: 'crisp-edges',
                        objectPosition: 'center -3rem'
                      }}
                    />
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 2 - VIP Program */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-purple-800 via-purple-600 to-pink-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-purple-400/20 animate-pulse"></div>
                  <div className="absolute bottom-10 left-10 w-16 h-16 rounded-full bg-pink-400/30 animate-bounce"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30 animate-pulse">💎</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30 animate-bounce">👑</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                        <span className="text-yellow-300 animate-pulse">VIP</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-purple-300">
                          ÖZEL AVANTAJLAR
                        </h2>
                      </div>
                      <div className="flex justify-center items-center space-x-4 mb-6">
                        <div className="text-center animate-fade-in">
                          <div className="text-3xl mb-1">💎</div>
                          <div className="text-lg font-bold text-yellow-300">%25</div>
                        </div>
                        <div className="text-center animate-fade-in" style={{
                        animationDelay: '0.2s'
                      }}>
                          <div className="text-3xl mb-1">🎁</div>
                          <div className="text-lg font-bold text-yellow-300">BONUS</div>
                        </div>
                      </div>
                      <Button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform" onClick={() => navigate('/vip')}>
                        VIP OL
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="text-8xl md:text-9xl opacity-80 animate-pulse">👑</div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 3 - Live Casino */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-15 left-15 w-14 h-14 rounded-full bg-green-400/20 animate-pulse"></div>
                  <div className="absolute bottom-15 right-15 w-18 h-18 rounded-full bg-emerald-400/30 animate-bounce"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30 animate-spin">🃏</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30 animate-pulse">🎯</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="flex-1 flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-emerald-300 animate-pulse">CANLI</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-emerald-300">
                          CASİNO DENEYİMİ
                        </h2>
                      </div>
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform" onClick={() => navigate('/live-casino')}>
                        OYNA
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                      <div className="text-8xl md:text-9xl opacity-80 animate-bounce">🎲</div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 4 - Sports Betting */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-blue-400/20 animate-pulse"></div>
                  <div className="absolute bottom-12 left-12 w-14 h-14 rounded-full bg-cyan-400/30 animate-bounce"></div>
                  <div className="absolute top-1/4 right-1/3 text-5xl opacity-30 animate-bounce">⚽</div>
                  <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-30 animate-pulse">🏀</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-cyan-300 animate-pulse">SPOR</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-6 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-cyan-300">
                          BAHİS HEYECANI
                        </h2>
                      </div>
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform" onClick={() => navigate('/sports-betting')}>
                        BAHİS YAP
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 5 - Jackpot */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-yellow-800 via-yellow-600 to-amber-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-8 left-8 w-20 h-20 rounded-full bg-yellow-400/20 animate-spin"></div>
                  <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-amber-400/30 animate-pulse"></div>
                  <div className="absolute top-1/5 right-1/4 text-6xl opacity-40 animate-bounce">💰</div>
                  <div className="absolute bottom-1/5 left-1/4 text-5xl opacity-40 animate-spin">🎰</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-pulse">
                        <span className="text-yellow-300">JACKPOT</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4 animate-slide-in-right">
                        <h2 className="text-2xl md:text-3xl font-bold text-yellow-300">
                          ₺5.847.293
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6 animate-fade-in">Büyük ikramiye seni bekliyor!</p>
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform" onClick={() => navigate('/casino')}>
                        ŞANSINI DENE
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 6 - Mobile App */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-indigo-800 via-indigo-600 to-blue-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-10 left-10 w-18 h-18 rounded-lg bg-indigo-400/20 animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-16 h-16 rounded-lg bg-blue-400/30 animate-bounce"></div>
                  <div className="absolute top-1/3 left-1/4 text-5xl opacity-30 animate-pulse">📱</div>
                  <div className="absolute bottom-1/3 right-1/4 text-4xl opacity-30 animate-bounce">📲</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-blue-300 animate-pulse">MOBİL</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-blue-300">
                          UYGULAMA
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6 animate-fade-in">Her yerden bahis yap, kazan!</p>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform">
                        İNDİR
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 7 - Weekly Tournament */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-rose-800 via-rose-600 to-pink-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-rose-400/20 animate-spin"></div>
                  <div className="absolute bottom-12 left-12 w-18 h-18 rounded-full bg-pink-400/30 animate-pulse"></div>
                  <div className="absolute top-1/4 left-1/3 text-5xl opacity-30 animate-bounce">🏆</div>
                  <div className="absolute bottom-1/4 right-1/3 text-4xl opacity-30 animate-spin">⭐</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-pink-300 animate-pulse">TURNUVA</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-pink-300">
                          HAFTALIK YARIŞMA
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6 animate-fade-in">₺100.000 ödül havuzu!</p>
                      <Button className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform">
                        KATIL
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Slide 8 - Cashback Bonus */}
              <CarouselItem>
                <div className="relative h-80 md:h-96 bg-gradient-to-br from-teal-800 via-teal-600 to-cyan-500 overflow-hidden animate-fade-in">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
                  
                  <div className="absolute top-14 left-14 w-16 h-16 rounded-full bg-teal-400/20 animate-pulse"></div>
                  <div className="absolute bottom-14 right-14 w-14 h-14 rounded-full bg-cyan-400/30 animate-bounce"></div>
                  <div className="absolute top-1/3 right-1/4 text-5xl opacity-30 animate-spin">💸</div>
                  <div className="absolute bottom-1/3 left-1/4 text-4xl opacity-30 animate-pulse">🔄</div>
                  
                  <div className="relative z-10 h-full flex items-center justify-center px-8 md:px-16">
                    <div className="w-full flex flex-col items-center justify-center text-center animate-scale-in">
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        <span className="text-teal-300 animate-pulse">%20</span>
                      </h1>
                      <div className="bg-black/80 rounded-lg px-6 py-3 inline-block mb-4 animate-slide-in-right">
                        <h2 className="text-xl md:text-2xl font-bold text-teal-300">
                          KAYIP BONUSU
                        </h2>
                      </div>
                      <p className="text-white text-lg mb-6 animate-fade-in">Kaybettiğin paranın %20'si geri!</p>
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-3 text-lg rounded-full animate-bounce hover:animate-none hover:scale-110 transition-transform">
                        AL
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            
            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {Array.from({
              length: 8
            }, (_, i) => <div key={i} className={`w-3 h-3 rounded-full bg-white/50 animate-pulse`} style={{
              animationDelay: `${i * 0.2}s`
            }}></div>)}
            </div>
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
                    <p className="text-xs opacity-75 mt-2">{t('gudubet_telegram')}</p>
                  </div>
                  <Send className="w-16 h-16 opacity-80" />
                </div>
              </CardContent>
            </Card>

            {/* VIP Program */}
            <Card className="bg-gradient-to-r from-green-600 to-emerald-500 border-none text-white overflow-hidden">
              <CardContent className="p-6 relative bg-cover bg-center bg-no-repeat" style={{
              backgroundImage: `url(${treasureImage})`
            }}>
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
                  <Button className="bg-white text-green-600 font-bold hover:bg-gray-100" onClick={() => navigate('/vip')}>
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
      <RegistrationModal isOpen={isRegistrationModalOpen} onClose={() => setIsRegistrationModalOpen(false)} />

      {/* Floating Support Button */}
      <FloatingSupportButton />
    </div>;
};
export default Index;