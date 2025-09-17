import { useState, useEffect, useCallback } from 'react';

type SupportedLanguage = 'tr' | 'en';

interface LocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

interface LocalizationResult {
  detectedLanguage: SupportedLanguage;
  detectedCountry: string;
  detectedRegion: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'saved' | 'browser' | 'location' | 'default';
}

export const useAutoLocalization = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [detectionResult, setDetectionResult] = useState<LocalizationResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Language mapping based on country codes
  const countryToLanguage: Record<string, SupportedLanguage> = {
    TR: 'tr', // Turkey
    AZ: 'tr', // Azerbaijan (also uses Turkish)
    CY: 'tr', // Cyprus (Northern Cyprus uses Turkish)
    // English speaking countries
    US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en',
    IE: 'en', ZA: 'en', SG: 'en', MT: 'en'
  };

  // Detect browser language preferences
  const detectBrowserLanguage = useCallback((): { language: SupportedLanguage; confidence: 'high' | 'medium' | 'low' } => {
    const languages = navigator.languages || [navigator.language];
    
    for (const lang of languages) {
      const normalizedLang = lang.toLowerCase();
      
      // High confidence matches
      if (normalizedLang.startsWith('tr-') || normalizedLang === 'tr') {
        return { language: 'tr', confidence: 'high' };
      }
      if (normalizedLang.startsWith('en-') || normalizedLang === 'en') {
        return { language: 'en', confidence: 'high' };
      }
    }
    
    // Medium confidence - check primary language only
    const primaryLang = languages[0]?.split('-')[0]?.toLowerCase();
    if (primaryLang === 'tr') return { language: 'tr', confidence: 'medium' };
    if (primaryLang === 'en') return { language: 'en', confidence: 'medium' };
    
    // Low confidence - default to English
    return { language: 'en', confidence: 'low' };
  }, []);

  // Get user's location using IP geolocation
  const detectUserLocation = useCallback(async (): Promise<LocationData | null> => {
    // Check cache first to avoid repeated API calls
    const cachedLocation = sessionStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        return JSON.parse(cachedLocation);
      } catch {
        sessionStorage.removeItem('userLocation');
      }
    }

    try {
      // Using ipapi.co for free IP geolocation with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to fetch location');
      
      const data = await response.json();
      
      const locationData = {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || '',
        region: data.region || '',
        city: data.city || '',
        timezone: data.timezone || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0
      };

      // Cache the result for the session
      sessionStorage.setItem('userLocation', JSON.stringify(locationData));
      
      return locationData;
    } catch (error) {
      console.warn('Location detection failed:', error);
      
      // Fallback to timezone-based detection
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Turkish timezones
        if (timezone.includes('Istanbul') || timezone.includes('Ankara')) {
          return {
            country: 'Turkey',
            countryCode: 'TR',
            region: '',
            city: '',
            timezone,
            latitude: 0,
            longitude: 0
          };
        }
        
        return {
          country: 'Unknown',
          countryCode: '',
          region: '',
          city: '',
          timezone,
          latitude: 0,
          longitude: 0
        };
      } catch (tzError) {
        console.warn('Timezone detection failed:', tzError);
        return null;
      }
    }
  }, []);

  // Perform automatic localization detection
  const performAutoDetection = useCallback(async (): Promise<LocalizationResult> => {
    setIsDetecting(true);
    
    try {
      // Check if user has saved preference
      const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        return {
          detectedLanguage: savedLanguage,
          detectedCountry: 'Saved',
          detectedRegion: 'User Preference',
          confidence: 'high',
          source: 'saved'
        };
      }

      // Detect browser language
      const browserDetection = detectBrowserLanguage();
      
      // Detect location
      const location = await detectUserLocation();
      setLocationData(location);
      
      let finalLanguage: SupportedLanguage = browserDetection.language;
      let confidence: 'high' | 'medium' | 'low' = browserDetection.confidence;
      let source: 'browser' | 'location' | 'default' = 'browser';
      
      // If we have location data, use it to refine language detection
      if (location?.countryCode) {
        const locationLanguage = countryToLanguage[location.countryCode];
        if (locationLanguage) {
          // If location suggests different language than browser, prioritize location for Turkish
          if (locationLanguage === 'tr' && browserDetection.language === 'en') {
            finalLanguage = 'tr';
            confidence = 'high';
            source = 'location';
          }
          // If both agree, high confidence
          else if (locationLanguage === browserDetection.language) {
            confidence = 'high';
          }
        }
      }
      
      return {
        detectedLanguage: finalLanguage,
        detectedCountry: location?.country || 'Unknown',
        detectedRegion: location?.region || 'Unknown',
        confidence,
        source
      };
      
    } catch (error) {
      console.error('Auto-localization failed:', error);
      
      // Fallback to browser detection only
      const browserDetection = detectBrowserLanguage();
      return {
        detectedLanguage: browserDetection.language,
        detectedCountry: 'Unknown',
        detectedRegion: 'Unknown',
        confidence: 'low',
        source: 'default'
      };
    } finally {
      setIsDetecting(false);
    }
  }, [detectBrowserLanguage, detectUserLocation, countryToLanguage]);

  // Initialize auto-localization
  useEffect(() => {
    let mounted = true;
    
    const initializeLocalization = async () => {
      // Check if we already have a recent detection result
      const cachedResult = localStorage.getItem('auto-localization-result');
      if (cachedResult) {
        try {
          const parsed = JSON.parse(cachedResult);
          const detectedAt = new Date(parsed.detectedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - detectedAt.getTime()) / (1000 * 60 * 60);
          
          // Use cached result if less than 24 hours old
          if (hoursDiff < 24) {
            if (mounted) {
              setDetectionResult(parsed);
            }
            return;
          }
        } catch {
          localStorage.removeItem('auto-localization-result');
        }
      }

      const result = await performAutoDetection();
      if (mounted) {
        setDetectionResult(result);
        
        // Store detection info for analytics
        localStorage.setItem('auto-localization-result', JSON.stringify({
          ...result,
          detectedAt: new Date().toISOString()
        }));
      }
    };
    
    initializeLocalization();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Get localization suggestions
  const getLocalizationSuggestion = useCallback((): string => {
    if (!detectionResult) return '';
    
    const { detectedLanguage, detectedCountry, confidence, source } = detectionResult;
    
    if (source === 'saved') return '';
    
    if (detectedLanguage === 'tr') {
      if (confidence === 'high') {
        return `Konumunuz ${detectedCountry} olarak algılandı. Türkçe dil ayarı önerilir.`;
      }
      return 'Tarayıcı diliniz Türkçe olarak algılandı. Türkçe dil ayarını kullanmak ister misiniz?';
    } else {
      if (confidence === 'high') {
        return `Your location was detected as ${detectedCountry}. English language setting is recommended.`;
      }
      return 'Your browser language was detected as English. Would you like to use English language setting?';
    }
  }, [detectionResult]);

  // Apply auto-detected language
  const applyAutoDetectedLanguage = useCallback((changeLanguageCallback: (lang: SupportedLanguage) => void) => {
    if (detectionResult && detectionResult.source !== 'saved') {
      changeLanguageCallback(detectionResult.detectedLanguage);
    }
  }, [detectionResult]);

  return {
    locationData,
    detectionResult,
    isDetecting,
    getLocalizationSuggestion,
    applyAutoDetectedLanguage,
    performAutoDetection
  };
};