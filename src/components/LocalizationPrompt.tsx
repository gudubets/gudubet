import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, MapPin, X } from 'lucide-react';
import { useAutoLocalization } from '@/hooks/useAutoLocalization';
import { useI18n } from '@/hooks/useI18n';

const LocalizationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { detectionResult, getLocalizationSuggestion, applyAutoDetectedLanguage } = useAutoLocalization();
  const { changeLanguage, currentLanguage } = useI18n();

  // Memoize the suggestion to avoid recalculation
  const suggestion = useMemo(() => {
    if (!detectionResult) return null;
    return getLocalizationSuggestion();
  }, [detectionResult, getLocalizationSuggestion]);

  useEffect(() => {
    // Early return if already dismissed or no detection result
    if (!detectionResult || localStorage.getItem('localization-prompt-dismissed')) {
      return;
    }

    // Show prompt only if language was auto-detected and different from current
    if (
      detectionResult.source !== 'saved' && 
      detectionResult.detectedLanguage !== currentLanguage
    ) {
      // Delay showing prompt by 2 seconds to not interrupt user
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [detectionResult, currentLanguage]);

  const handleAccept = () => {
    applyAutoDetectedLanguage(changeLanguage);
    setShowPrompt(false);
    localStorage.setItem('localization-prompt-accepted', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('localization-prompt-dismissed', 'true');
  };

  // Early returns to avoid unnecessary renders
  if (!showPrompt || !detectionResult || !suggestion) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md mx-4">
      <Card className="bg-card border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
              {detectionResult.source === 'location' ? (
                <MapPin className="h-5 w-5 text-primary" />
              ) : (
                <Globe className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-2">
                {detectionResult.detectedLanguage === 'tr' 
                  ? 'Dil Önerisi' 
                  : 'Language Suggestion'
                }
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {suggestion}
              </p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1"
                >
                  {detectionResult.detectedLanguage === 'tr' ? 'Kabul Et' : 'Accept'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1"
                >
                  {detectionResult.detectedLanguage === 'tr' ? 'Hayır' : 'No Thanks'}
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalizationPrompt;