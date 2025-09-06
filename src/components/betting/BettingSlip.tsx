import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Receipt, 
  TrendingUp,
  Calculator,
  AlertCircle
} from 'lucide-react';

interface BetSelection {
  matchId: string;
  matchName: string;
  selection: string;
  selectionName: string;
  odds: number;
  market: string;
}

interface BettingSlipProps {
  betSlip: BetSelection[];
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
      <div className="p-4">
        {/* Mobile Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span className="font-semibold">Kupon</span>
            <Badge variant="secondary">{betSlip.length}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              ₺{potentialWin.toFixed(2)}
            </span>
            <Button variant="ghost" size="sm">
              {isExpanded ? '▼' : '▲'}
            </Button>
          </div>
        </div>

        {/* Mobile Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Bet List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {betSlip.map((bet, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bet.matchName}</p>
                    <p className="text-xs text-muted-foreground">{bet.selectionName}</p>
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
              Canlı Bahsi Onayla
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          Bahis Kuponu
          {betSlip.length > 0 && (
            <Badge variant="secondary">{betSlip.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
                      <p className="text-xs text-muted-foreground">{bet.market}</p>
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
                      {bet.selectionName}
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
                Canlı bahislerde oranlar sürekli değişebilir. Bahis onaylandıktan sonra değişiklik yapılamaz.
              </p>
            </div>

            {/* Confirm Button */}
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white" 
              onClick={onConfirmBet}
              disabled={betSlip.length === 0 || !stakeAmount || parseFloat(stakeAmount) <= 0}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Canlı Bahsi Onayla
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BettingSlip;