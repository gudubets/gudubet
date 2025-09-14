import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Zap, Gift, RotateCcw, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  value: number;
  color: string;
}

const SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', name: 'Kiraz', emoji: '🍒', value: 10, color: 'text-red-500' },
  { id: 'lemon', name: 'Limon', emoji: '🍋', value: 15, color: 'text-yellow-500' },
  { id: 'orange', name: 'Portakal', emoji: '🍊', value: 20, color: 'text-orange-500' },
  { id: 'plum', name: 'Erik', emoji: '🍇', value: 25, color: 'text-purple-500' },
  { id: 'bell', name: 'Çan', emoji: '🔔', value: 50, color: 'text-yellow-400' },
  { id: 'star', name: 'Yıldız', emoji: '⭐', value: 100, color: 'text-yellow-300' },
  { id: 'diamond', name: 'Elmas', emoji: '💎', value: 200, color: 'text-blue-400' },
  { id: 'seven', name: 'Yedi', emoji: '7️⃣', value: 500, color: 'text-red-400' }
];

const REEL_COUNT = 5;
const ROW_COUNT = 3;

export const CustomSlotGame: React.FC = () => {
  const [reels, setReels] = useState<SlotSymbol[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(10);
  const [winAmount, setWinAmount] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [spinSpeed, setSpinSpeed] = useState([50]);
  const [autoSpin, setAutoSpin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize reels
  useEffect(() => {
    const initialReels = Array(REEL_COUNT).fill(null).map(() =>
      Array(ROW_COUNT).fill(null).map(() =>
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      )
    );
    setReels(initialReels);
  }, []);

  const getRandomSymbol = (): SlotSymbol => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  };

  const checkWinlines = (currentReels: SlotSymbol[][]): number => {
    let totalWin = 0;
    
    // Check horizontal lines
    for (let row = 0; row < ROW_COUNT; row++) {
      const line = currentReels.map(reel => reel[row]);
      const win = calculateLineWin(line);
      totalWin += win;
    }
    
    // Check diagonal lines
    const diagonal1 = currentReels.map((reel, index) => reel[index % ROW_COUNT]);
    const diagonal2 = currentReels.map((reel, index) => reel[(ROW_COUNT - 1 - index) % ROW_COUNT]);
    
    totalWin += calculateLineWin(diagonal1);
    totalWin += calculateLineWin(diagonal2);
    
    return totalWin;
  };

  const calculateLineWin = (line: SlotSymbol[]): number => {
    const symbolCounts = line.reduce((acc, symbol) => {
      acc[symbol.id] = (acc[symbol.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let maxWin = 0;
    Object.entries(symbolCounts).forEach(([symbolId, count]) => {
      if (count >= 3) {
        const symbol = SYMBOLS.find(s => s.id === symbolId);
        if (symbol) {
          const multiplier = count === 3 ? 1 : count === 4 ? 3 : 10;
          maxWin = Math.max(maxWin, symbol.value * multiplier * bet / 10);
        }
      }
    });

    return maxWin;
  };

  const triggerFreeSpin = () => {
    const bonusChance = Math.random();
    if (bonusChance < 0.1) { // 10% chance
      const spinsWon = Math.floor(Math.random() * 10) + 5;
      setFreeSpins(prev => prev + spinsWon);
      toast.success(`🎉 ${spinsWon} Freespin Kazandınız!`);
    }
  };

  const spin = async () => {
    if (isSpinning) return;
    
    if (freeSpins === 0 && balance < bet) {
      toast.error('Yetersiz bakiye!');
      return;
    }

    setIsSpinning(true);
    setWinAmount(0);

    // Deduct bet if not freespin
    if (freeSpins === 0) {
      setBalance(prev => prev - bet);
    } else {
      setFreeSpins(prev => prev - 1);
    }

    // Spinning animation
    const spinDuration = Math.max(1000, 3000 - (spinSpeed[0] * 20));
    
    // Animate reels
    const animationSteps = Math.floor(spinDuration / 100);
    for (let i = 0; i < animationSteps; i++) {
      setTimeout(() => {
        setReels(prevReels => 
          prevReels.map(reel => 
            reel.map(() => getRandomSymbol())
          )
        );
      }, i * 100);
    }

    // Final result
    setTimeout(() => {
      const finalReels = Array(REEL_COUNT).fill(null).map(() =>
        Array(ROW_COUNT).fill(null).map(() => getRandomSymbol())
      );
      
      setReels(finalReels);
      
      const win = checkWinlines(finalReels);
      if (win > 0) {
        setWinAmount(win);
        setBalance(prev => prev + win);
        toast.success(`🎉 ${win} Puan Kazandınız!`);
      }
      
      triggerFreeSpin();
      setIsSpinning(false);
    }, spinDuration);
  };

  const startAutoSpin = () => {
    if (autoSpin) {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      setAutoSpin(false);
    } else {
      setAutoSpin(true);
      spinIntervalRef.current = setInterval(() => {
        if (!isSpinning && (balance >= bet || freeSpins > 0)) {
          spin();
        } else {
          setAutoSpin(false);
          if (spinIntervalRef.current) {
            clearInterval(spinIntervalRef.current);
          }
        }
      }, Math.max(2000, 4000 - (spinSpeed[0] * 30)));
    }
  };

  const buyFreeSpins = () => {
    const cost = bet * 50;
    if (balance >= cost) {
      setBalance(prev => prev - cost);
      setFreeSpins(prev => prev + 10);
      toast.success('10 Freespin satın alındı!');
    } else {
      toast.error('Yetersiz bakiye!');
    }
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-b from-purple-900 to-blue-900 border-gold">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <span className="text-3xl">🎰</span>
          Gelişmiş Slot Oyunu
        </CardTitle>
        
        {/* Game Stats */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-yellow-400 font-bold text-lg">{balance}</div>
            <div className="text-gray-300 text-sm">Bakiye</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold text-lg">{bet}</div>
            <div className="text-gray-300 text-sm">Bahis</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">{winAmount}</div>
            <div className="text-gray-300 text-sm">Kazanç</div>
          </div>
          {freeSpins > 0 && (
            <div className="text-center">
              <div className="text-pink-400 font-bold text-lg">{freeSpins}</div>
              <div className="text-gray-300 text-sm">Freespin</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Slot Machine */}
        <div className="bg-black/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-5 gap-2">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="space-y-2">
                {reel.map((symbol, rowIndex) => (
                  <div
                    key={`${reelIndex}-${rowIndex}`}
                    className={`h-16 w-16 mx-auto flex items-center justify-center text-3xl bg-gray-800 rounded-lg border-2 border-gray-600 ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    <span className={symbol.color}>{symbol.emoji}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Bet Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBet(Math.max(1, bet - 5))}
              disabled={isSpinning}
              className="text-white border-white/20"
            >
              -5
            </Button>
            <div className="text-white">Bahis: {bet}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBet(Math.min(balance, bet + 5))}
              disabled={isSpinning}
              className="text-white border-white/20"
            >
              +5
            </Button>
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-white">
              <Zap className="w-4 h-4" />
              <span>Hız: {spinSpeed[0]}%</span>
            </div>
            <Slider
              value={spinSpeed}
              onValueChange={setSpinSpeed}
              max={100}
              min={10}
              step={10}
              className="w-full max-w-xs mx-auto"
              disabled={isSpinning}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={spin}
              disabled={isSpinning || (balance < bet && freeSpins === 0)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {freeSpins > 0 ? 'Freespin' : 'Çevir'}
            </Button>

            <Button
              onClick={startAutoSpin}
              disabled={isSpinning || (balance < bet && freeSpins === 0)}
              variant={autoSpin ? "destructive" : "outline"}
              className={autoSpin ? "" : "text-white border-white/20"}
            >
              {autoSpin ? <Pause className="w-4 h-4 mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              {autoSpin ? 'Durdur' : 'Otomatik'}
            </Button>

            <Button
              onClick={buyFreeSpins}
              disabled={isSpinning || balance < bet * 50}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              Freespin Al ({bet * 50})
            </Button>

            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-black/30 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Ayarlar</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">
                  <div>RTP: %96.5</div>
                  <div>Volatilite: Yüksek</div>
                  <div>Max Kazanç: {bet * 1000}x</div>
                </div>
                <div className="text-gray-300">
                  <div>Paylines: 25</div>
                  <div>Freespin Şansı: %10</div>
                  <div>Bonus Buy: {bet * 50}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Symbol Values */}
        <div className="mt-6 bg-black/30 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3 text-center">Sembol Değerleri</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            {SYMBOLS.map(symbol => (
              <div key={symbol.id} className="text-xs">
                <div className={`text-lg ${symbol.color}`}>{symbol.emoji}</div>
                <div className="text-gray-400">{symbol.value}x</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};