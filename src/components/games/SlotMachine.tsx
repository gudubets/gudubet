import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, RotateCcw, Coins, TrendingUp, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUserBalance } from '@/hooks/useUserBalance';
import { User } from '@supabase/supabase-js';

interface SlotMachineProps {
  gameSlug: string;
  user: User | null;
}

interface SlotGame {
  id: string;
  name: string;
  slug: string;
  provider: string;
  rtp: number;
  min_bet: number;
  max_bet: number;
  reels: number;
  rows: number;
  symbols: string[] | any;
  paytable: any;
}

interface SpinResult {
  sessionId: string;
  result: {
    reels: string[][];
    winAmount: number;
    winningLines: number[];
    multiplier: number;
    isWin: boolean;
  };
  newBalance: {
    balance: number;
    bonusBalance: number;
    total: number;
  };
}

const symbolEmojis: { [key: string]: string } = {
  cherry: '🍒',
  lemon: '🍋',
  orange: '🍊',
  plum: '🟣',
  bell: '🔔',
  bar: '⬛',
  seven: '7️⃣',
  wild: '🌟',
  scatter: '💎',
  watermelon: '🍉',
  grape: '🍇'
};

export const SlotMachine: React.FC<SlotMachineProps> = ({ gameSlug, user }) => {
  const [game, setGame] = useState<SlotGame | null>(null);
  const [betAmount, setBetAmount] = useState(1.0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const balanceData = useUserBalance(user);

  useEffect(() => {
    loadGame();
  }, [gameSlug]);

  const loadGame = async () => {
    try {
      const { data, error } = await supabase
        .from('slot_games')
        .select('*')
        .eq('slug', gameSlug)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setGame(data);
      setBetAmount(data.min_bet);
      
      // Parse symbols if they're JSON
      const symbols = Array.isArray(data.symbols) ? data.symbols : JSON.parse(data.symbols as string);
      
      // Initialize reels with random symbols
      const initialReels: string[][] = [];
      for (let i = 0; i < data.reels; i++) {
        initialReels[i] = [];
        for (let j = 0; j < data.rows; j++) {
          const randomIndex = Math.floor(Math.random() * symbols.length);
          initialReels[i][j] = symbols[randomIndex];
        }
      }
      setReels(initialReels);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game:', error);
      toast.error('Oyun yüklenemedi');
      setLoading(false);
    }
  };

  const spin = async () => {
    if (!game || !user || isSpinning) return;
    
    if (balanceData.total_balance < betAmount) {
      toast.error('Yetersiz bakiye');
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);

    try {
      // Parse symbols if they're JSON
      const symbols = Array.isArray(game.symbols) ? game.symbols : JSON.parse(game.symbols as string);
      
      // Animate spinning
      const spinDuration = 2000; // 2 seconds
      const spinInterval = setInterval(() => {
        const animatedReels: string[][] = [];
        for (let i = 0; i < game.reels; i++) {
          animatedReels[i] = [];
          for (let j = 0; j < game.rows; j++) {
            const randomIndex = Math.floor(Math.random() * symbols.length);
            animatedReels[i][j] = symbols[randomIndex];
          }
        }
        setReels(animatedReels);
      }, 100);

      // Call backend spin function
      const { data, error } = await supabase.functions.invoke('slot-game', {
        body: {
          gameSlug: game.slug,
          betAmount,
          sessionId
        }
      });

      clearInterval(spinInterval);

      if (error) throw error;

      const result: SpinResult = data;
      
      // Set final result
      setReels(result.result.reels);
      setLastWin(result.result.winAmount);
      setWinningLines(result.result.winningLines);
      setSessionId(result.sessionId);

      if (result.result.isWin) {
        toast.success(`Kazandınız! ${result.result.winAmount.toFixed(2)} TL`);
      }

    } catch (error) {
      console.error('Spin error:', error);
      toast.error('Çevirme hatası');
    } finally {
      setIsSpinning(false);
    }
  };

  const adjustBet = (change: number) => {
    if (!game) return;
    
    const newBet = Math.max(
      game.min_bet,
      Math.min(game.max_bet, betAmount + change)
    );
    setBetAmount(newBet);
  };

  const maxBet = () => {
    if (!game) return;
    setBetAmount(Math.min(game.max_bet, balanceData.total_balance));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Oyun bulunamadı</p>
      </div>
    );
  }

  // Check if this is an external provider game (iframe-based)
  const isExternalGame = game.provider === 'Pragmatic Play' || game.provider === 'Evolution' || game.provider?.toLowerCase().includes('external');

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-primary/20 to-secondary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{game.name}</h1>
              <p className="text-muted-foreground">{game.provider}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                RTP: {game.rtp}%
              </Badge>
              <p className="text-sm text-muted-foreground">
                Bahis: {game.min_bet} - {game.max_bet} TL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Container */}
      {isExternalGame ? (
        /* External Provider Game - Responsive Iframe */
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe 
                src={`https://demogamesfree.pragmaticplay.net/gs2c/html5Game.do?extGame=1&symbol=${gameSlug}&jurisdictionID=99&lobbyURL=https://demogamesfree.pragmaticplay.net/gs2c/common/html5Launcher.do`}
                className="absolute top-0 left-0 w-full h-full border-0"
                allowFullScreen
                title={game.name}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Custom Slot Machine */
        <Card className="bg-gradient-to-b from-yellow-900/20 to-yellow-800/10 border-yellow-600/30">
          <CardContent className="p-8">
            {/* Reels */}
            <div className="mb-6">
              <div 
                className={`grid gap-2 justify-center ${
                  game.reels === 5 ? 'grid-cols-5' : 'grid-cols-3'
                }`}
              >
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="space-y-2">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={`${reelIndex}-${symbolIndex}`}
                        className={`
                          w-16 h-16 md:w-20 md:h-20 bg-black/50 border-2 border-yellow-500/50 
                          rounded-lg flex items-center justify-center text-2xl md:text-3xl
                          transition-all duration-200
                          ${winningLines.includes(symbolIndex) ? 
                            'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/50' : 
                            ''
                          }
                          ${isSpinning ? 'animate-pulse' : ''}
                        `}
                      >
                        {symbolEmojis[symbol] || symbol}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Winning Display */}
            {lastWin > 0 && (
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-300/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-2xl font-bold">{lastWin.toFixed(2)} TL</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Kazanç</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bet Amount */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium mb-2 block">Bahis Miktarı</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustBet(-0.1)}
                      disabled={betAmount <= game.min_bet}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      min={game.min_bet}
                      max={game.max_bet}
                      step="0.1"
                      className="text-center"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjustBet(0.1)}
                      disabled={betAmount >= game.max_bet}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={maxBet}
                    className="w-full mt-2"
                  >
                    Max Bahis
                  </Button>
                </CardContent>
              </Card>

              {/* Spin Button */}
              <Card>
                <CardContent className="p-4 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={spin}
                    disabled={isSpinning || !user || balanceData.total_balance < betAmount}
                    className={`w-full h-16 text-lg font-bold ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}
                  >
                    {isSpinning ? (
                      <RotateCcw className="w-6 h-6 animate-spin mr-2" />
                    ) : (
                      <Play className="w-6 h-6 mr-2" />
                    )}
                    {isSpinning ? 'Çeviriyor...' : 'ÇEVİR'}
                  </Button>
                </CardContent>
              </Card>

              {/* Balance */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm font-medium mb-2 block">Bakiye</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ana Bakiye:</span>
                      <span className="font-medium">{balanceData.balance.toFixed(2)} TL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bonus:</span>
                      <span className="font-medium">{balanceData.bonus_balance.toFixed(2)} TL</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Toplam:</span>
                        <span className="font-bold text-lg">{balanceData.total_balance.toFixed(2)} TL</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paytable */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Ödeme Tablosu</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(game.paytable).map(([symbol, payouts]: [string, any]) => (
              <div key={symbol} className="text-center">
                <div className="text-2xl mb-2">{symbolEmojis[symbol] || symbol}</div>
                <div className="text-xs space-y-1">
                  {symbol === 'wild' ? (
                    <div>
                      <p>Joker</p>
                      {payouts.multiplier && (
                        <p className="text-yellow-400">x{payouts.multiplier}</p>
                      )}
                    </div>
                  ) : symbol === 'scatter' ? (
                    <div>
                      <p>Scatter</p>
                      <p className="text-green-400">Bonus</p>
                    </div>
                  ) : (
                    Object.entries(payouts).map(([count, payout]: [string, any]) => (
                      <div key={count} className="flex justify-between">
                        <span>{count}x:</span>
                        <span>{payout}x</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};