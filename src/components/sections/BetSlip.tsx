import { useState } from "react";
import { Trash2, Plus, Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BetSlipItem {
  id: string;
  match: string;
  selection: string;
  odds: number;
  stake: number;
}

export function BetSlip() {
  const [activeTab, setActiveTab] = useState<"slip" | "bets">("slip");
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);

  const [myBets] = useState([
    {
      id: "1",
      match: "Barcelona vs Real Madrid",
      selection: "Barcelona Kazanır",
      odds: 2.40,
      stake: 100,
      status: "pending",
      potentialWin: 240,
    },
    {
      id: "2",
      match: "Liverpool vs Chelsea",
      selection: "Beraberlik",
      odds: 3.20,
      stake: 75,
      status: "won",
      potentialWin: 240,
      actualWin: 240,
    },
  ]);

  const removeBetSlipItem = (id: string) => {
    setBetSlipItems(items => items.filter(item => item.id !== id));
  };

  const updateStake = (id: string, stake: number) => {
    setBetSlipItems(items =>
      items.map(item =>
        item.id === id ? { ...item, stake } : item
      )
    );
  };

  const totalStake = betSlipItems.reduce((total, item) => total + item.stake, 0);
  const totalOdds = betSlipItems.reduce((total, item) => total * item.odds, 1);
  const potentialWin = totalStake * totalOdds;

  return (
    <div className="sticky top-24 space-y-4">
      <div className="bet-card p-4">
        <div className="border-b border-border mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab("slip")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === "slip"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Bahis kuponu
              <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                0
              </span>
            </button>
            <button
              onClick={() => setActiveTab("bets")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "bets"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Bahislerim
            </button>
          </div>
        </div>

        {activeTab === "slip" ? (
          <div className="space-y-4">
            {betSlipItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Bahis kuponun bulunmamaktadır. Bahis yapmak için herhangi bir bahis oranına tıkla.</p>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Bahis Türleri</h4>
                  <p className="text-xs text-muted-foreground">
                    Bahis kuponun bulunmamaktadır. Bahis yapmak için herhangi bir bahis oranına tıkla.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {betSlipItems.map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.match}</span>
                      <button
                        onClick={() => removeBetSlipItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.selection}</span>
                      <span className="text-sm font-bold text-primary">{item.odds}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Tutar:</span>
                      <input
                        type="number"
                        value={item.stake}
                        onChange={(e) => updateStake(item.id, Number(e.target.value))}
                        className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs"
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-xs text-muted-foreground">TL</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Toplam Tutar:</span>
                    <span className="font-medium">{totalStake.toFixed(2)} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Toplam Oran:</span>
                    <span className="font-medium text-primary">{totalOdds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span>Kazanç:</span>
                    <span className="text-success">{potentialWin.toFixed(2)} TL</span>
                  </div>
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium mt-4">
                    Bahis Yap
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Aktif Bahislerim</h3>
            
            {myBets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Henüz bahis geçmişi yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myBets.map((bet) => (
                  <div key={bet.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{bet.match}</p>
                        <p className="text-xs text-muted-foreground">{bet.selection}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        bet.status === 'won' 
                          ? 'bg-success/20 text-success' 
                          : bet.status === 'lost'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {bet.status === 'won' ? 'Kazandı' : 
                         bet.status === 'lost' ? 'Kaybetti' : 'Beklemede'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Bahis: ₺{bet.stake}</span>
                      <span>Oran: {bet.odds}</span>
                      <span className="text-success">
                        {bet.status === 'won' ? `+₺${bet.actualWin}` : `₺${bet.potentialWin}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}