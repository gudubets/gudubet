import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/useI18n';
import { useAutoLocalization } from '@/hooks/useAutoLocalization';
import { Languages, Globe, MapPin } from 'lucide-react';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useI18n();
  const { detectionResult, locationData } = useAutoLocalization();

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {detectionResult?.source === 'location' ? (
            <MapPin className="h-4 w-4" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span className="hidden sm:inline-flex">
            {getCurrentLanguage().flag} {getCurrentLanguage().name}
          </span>
          <span className="sm:hidden">
            {getCurrentLanguage().flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locationData && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-b">
            {detectionResult?.source === 'location' 
              ? `📍 ${locationData.country}${locationData.city ? `, ${locationData.city}` : ''}`
              : `🌐 ${currentLanguage === 'tr' ? 'Tarayıcı Algılandı' : 'Browser Detected'}`
            }
          </div>
        )}
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code as any)}
            className={`cursor-pointer ${currentLanguage === language.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
            {detectionResult?.detectedLanguage === language.code && detectionResult.source !== 'saved' && (
              <span className="ml-auto text-xs text-primary">•</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;