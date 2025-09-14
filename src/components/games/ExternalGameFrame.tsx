import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle, Maximize, Minimize, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

interface ExternalGameFrameProps {
  gameUrl: string;
  gameTitle: string;
  provider: string;
  onClose?: () => void;
  onError?: (error: string) => void;
}

export const ExternalGameFrame: React.FC<ExternalGameFrameProps> = ({
  gameUrl,
  gameTitle,
  provider,
  onClose,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);
    setHasError(false);

    const handleLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      const errorMessage = `${provider} oyunu yüklenirken hata oluştu`;
      toast.error(errorMessage);
      onError?.(errorMessage);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Timeout for loading
    const loadTimeout = setTimeout(() => {
      setIsLoading(prevLoading => {
        if (prevLoading) {
          handleError();
        }
        return prevLoading;
      });
    }, 30000); // 30 seconds timeout

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
      clearTimeout(loadTimeout);
    };
  }, [gameUrl, provider, onError]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
      toast.error('Tam ekran moduna geçilemiyor');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Send message to iframe to mute/unmute
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        action: 'toggleMute',
        muted: !isMuted
      }, '*');
    }
  };

  const reloadGame = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = gameUrl;
    }
  };

  if (hasError) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Oyun Yüklenemedi</h3>
          <p className="text-muted-foreground mb-6">
            {gameTitle} oyunu şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.
          </p>
          <div className="space-x-4">
            <Button onClick={reloadGame}>
              Tekrar Dene
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Kapat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[600px]'} bg-black rounded-lg overflow-hidden`}
    >
      {/* Game Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleMute}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={toggleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white border-white/20"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
        {onClose && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white border-white/20"
          >
            ×
          </Button>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{gameTitle} Yükleniyor...</h3>
            <p className="text-sm text-gray-300">Sağlayıcı: {provider}</p>
          </div>
        </div>
      )}

      {/* Game Frame */}
      <iframe
        ref={iframeRef}
        src={gameUrl}
        className="w-full h-full border-0"
        title={gameTitle}
        allow="autoplay; fullscreen; microphone; camera; payment"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};