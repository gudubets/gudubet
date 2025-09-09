import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Receipt, 
  TrendingUp,
  Calculator,
  AlertCircle,
  History,
  Clock
} from 'lucide-react';

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  odds: number;
}

interface ConfirmedBet {
  id: string;
  bets: BetSelection[];
  stakeAmount: number;
  totalOdds: number;
  potentialWin: number;
  date: string;
  status: string;
}

interface BettingSlipProps {
  betSlip: BetSelection[];
  confirmedBets: ConfirmedBet[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  stakeAmount: string;
  onStakeChange: (amount: string) => void;
  onRemoveBet: (index: number) => void;
  onConfirmBet: () => void;
  totalOdds: number;
  potentialWin: number;
  isMobile?: boolean;
}

const BettingSlip: React.FC<BettingSlipProps> = ({
  betSlip,
  confirmedBets,
  activeTab,
  onTabChange,
  stakeAmount,
  onStakeChange,
  onRemoveBet,
  onConfirmBet,
  totalOdds,
  potentialWin,
  isMobile = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickStakeAmounts = [10, 25, 50, 100, 250, 500];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="p-4">
          {/* Mobile Header */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                {activeTab === 'betslip' ? 'Kupon' : 'Bahislerim'}
              </span>
              <Badge variant="secondary">
                {activeTab === 'betslip' ? betSlip.length : confirmedBets.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === 'betslip' && betSlip.length > 0 && (
                <span className="text-sm font-bold text-primary">
                  ₺{potentialWin.toFixed(2)}
                </span>
              )}
              <Button variant="ghost" size="sm">
                {isExpanded ? '▼' : '▲'}
              </Button>
            </div>
          </div>

          {/* Mobile Tabs */}
          {isExpanded && (
            <div className="mt-4 max-h-80 overflow-y-auto">
              <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1">
                <Button
                  variant={activeTab === 'betslip' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => onTabChange('betslip')}
                >
                  Kupon ({betSlip.length})
                </Button>
                <Button
                  variant={activeTab === 'mybets' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => onTabChange('mybets')}
                >
                  Bahislerim ({confirmedBets.length})
                </Button>
              </div>

              {activeTab === 'betslip' ? (
                <div className="space-y-4">
                  {betSlip.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Calculator className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Bahis yapmak için oranlara tıklayın</p>
                    </div>
                  ) : (
                    <>
                      {/* Bet List */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {betSlip.map((bet, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{bet.matchName}</p>
                              <p className="text-xs text-muted-foreground">{bet.selection}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{bet.odds.toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveBet(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Stake Input */}
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Bahis tutarı (₺)"
                          value={stakeAmount}
                          onChange={(e) => onStakeChange(e.target.value)}
                        />
                        <div className="flex gap-1 flex-wrap">
                          {quickStakeAmounts.map((amount) => (
                            <Button
                              key={amount}
                              variant="outline"
                              size="sm"
                              onClick={() => onStakeChange(amount.toString())}
                              className="text-xs"
                            >
                              ₺{amount}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Toplam Oran:</span>
                          <span className="font-bold">{totalOdds.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-primary font-bold">
                          <span>Olası Kazanç:</span>
                          <span>₺{potentialWin.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Confirm Button */}
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={onConfirmBet}
                        disabled={betSlip.length === 0 || !stakeAmount}
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Bahsi Onayla
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmedBets.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz onaylanmış bahsiniz bulunmuyor</p>
                    </div>
                  ) : (
                    confirmedBets.map((bet) => (
                      <div key={bet.id} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">Bahis #{bet.id.slice(-4)}</p>
                            <p className="text-xs text-muted-foreground">{bet.date}</p>
                          </div>
                          <Badge variant="secondary">{bet.status}</Badge>
                        </div>
                        <div className="space-y-1">
                          {bet.bets.map((b, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">{b.matchName}</span>
                              <span className="text-muted-foreground"> - {b.selection} ({b.odds.toFixed(2)})</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                          <span>₺{bet.stakeAmount} → ₺{bet.potentialWin.toFixed(2)}</span>
                          <span className="font-bold">Oran: {bet.totalOdds.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Bahis Kuponu
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2 mx-auto my-4 mb-0 max-w-md">
            <TabsTrigger value="betslip" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Kupon
              {betSlip.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {betSlip.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mybets" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Bahislerim
              {confirmedBets.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {confirmedBets.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Bet Slip Tab */}
          <TabsContent value="betslip" className="p-4 space-y-4">
            {betSlip.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bahis yapmak için oranlara tıklayın</p>
              </div>
            ) : (
              <>
                {/* Bet List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {betSlip.map((bet, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{bet.matchName}</p>
                          <p className="text-xs text-muted-foreground">Maç Sonucu</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveBet(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          {bet.selection}
                        </span>
                        <Badge variant="outline" className="font-bold">
                          {bet.odds.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Stake Input */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Bahis Tutarı
                    </label>
                    <Input
                      type="number"
                      placeholder="₺0.00"
                      value={stakeAmount}
                      onChange={(e) => onStakeChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Quick Stake Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {quickStakeAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => onStakeChange(amount.toString())}
                        className="text-xs"
                      >
                        ₺{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bahis Sayısı:</span>
                    <span>{betSlip.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Toplam Oran:</span>
                    <span className="font-bold">{totalOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bahis Tutarı:</span>
                    <span>₺{parseFloat(stakeAmount || '0').toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-bold text-primary">
                    <span>Olası Kazanç:</span>
                    <span>₺{potentialWin.toFixed(2)}</span>
                  </div>
                </div>

                {/* Risk Warning */}
                <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Bahislerde oranlar değişebilir. Bahis onaylandıktan sonra değişiklik yapılamaz.
                  </p>
                </div>

                {/* Confirm Button */}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  onClick={onConfirmBet}
                  disabled={betSlip.length === 0 || !stakeAmount || parseFloat(stakeAmount) <= 0}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Bahsi Onayla
                </Button>
              </>
            )}
          </TabsContent>

          {/* My Bets Tab */}
          <TabsContent value="mybets" className="p-4 space-y-4">
            {confirmedBets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Henüz onaylanmış bahsiniz bulunmuyor</p>
                <p className="text-xs mt-1">Bahis yapmak için "Kupon" sekmesini kullanın</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {confirmedBets.map((bet) => (
                  <div key={bet.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-sm">Bahis #{bet.id.slice(-4)}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {bet.date}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          bet.status === 'Kazandı' ? 'default' : 
                          bet.status === 'Kaybetti' ? 'destructive' : 
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {bet.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {bet.bets.map((b, i) => (
                        <div key={i} className="text-xs p-2 bg-background rounded">
                          <p className="font-medium">{b.matchName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-muted-foreground">{b.selection}</span>
                            <Badge variant="outline" className="text-xs">
                              {b.odds.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Bahis:</span>
                          <span className="font-bold">₺{bet.stakeAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Oran:</span>
                          <span className="font-bold">{bet.totalOdds.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Olası Kazanç</div>
                        <div className="font-bold text-primary">₺{bet.potentialWin.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BettingSlip;