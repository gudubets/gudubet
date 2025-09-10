import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalGameFrame } from './ExternalGameFrame';
import { Play, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderGame {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  rtp: number;
  volatility: string;
}

interface ProviderGamesListProps {
  providerId: string;
  providerName: string;
  games: ProviderGame[];
  onLaunchGame: (providerId: string, gameId: string) => Promise<string | null>;
}

export const ProviderGamesList: React.FC<ProviderGamesListProps> = ({
  providerId,
  providerName,
  games,
  onLaunchGame
}) => {
  const [isLaunching, setIsLaunching] = useState<string | null>(null);
  const [gameFrameOpen, setGameFrameOpen] = useState(false);
  const [currentGameUrl, setCurrentGameUrl] = useState<string>('');
  const [currentGameName, setCurrentGameName] = useState<string>('');

  const handleLaunchGame = async (game: ProviderGame) => {
    setIsLaunching(game.id);
    try {
      const launchUrl = await onLaunchGame(providerId, game.id);
      
      if (launchUrl) {
        setCurrentGameUrl(launchUrl);
        setCurrentGameName(game.name);
        setGameFrameOpen(true);
      }
    } catch (error) {
      console.error('Game launch error:', error);
    } finally {
      setIsLaunching(null);
    }
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getGameTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'slot': return '🎰';
      case 'table': return '🃏';
      case 'live': return '📹';
      default: return '🎮';
    }
  };

  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">
          <p>Bu sağlayıcıdan oyun bulunamadı.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {providerName} Oyunları ({games.length} oyun)
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-lg">{getGameTypeIcon(game.type)}</span>
                      {game.name}
                    </CardTitle>
                    <CardDescription className="capitalize">
                      {game.type} oyunu
                    </CardDescription>
                  </div>
                  <Badge 
                    className={`${getVolatilityColor(game.volatility)} text-white text-xs`}
                  >
                    {game.volatility}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RTP:</span>
                    <span className="font-medium">{game.rtp}%</span>
                  </div>
                  
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-md flex items-center justify-center">
                    <img 
                      src={game.thumbnail} 
                      alt={game.name}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="text-4xl opacity-50">{getGameTypeIcon(game.type)}</div>
                  </div>
                  
                  <Button
                    onClick={() => handleLaunchGame(game)}
                    disabled={isLaunching === game.id}
                    className="w-full"
                    size="sm"
                  >
                    {isLaunching === game.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Başlatılıyor...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Test Başlat
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Game Frame Dialog */}
      <Dialog open={gameFrameOpen} onOpenChange={setGameFrameOpen}>
        <DialogContent className="max-w-6xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              {currentGameName} - {providerName}
            </DialogTitle>
            <DialogDescription>
              Demo modunda test oyunu
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0">
            <ExternalGameFrame
              gameUrl={currentGameUrl}
              gameTitle={currentGameName}
              provider={providerName}
              onClose={() => setGameFrameOpen(false)}
              onError={(error) => {
                toast.error(error);
                setGameFrameOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};