import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Translation {
  key: string;
  value: string;
  namespace: string;
}

type SupportedLanguage = 'tr' | 'en';

export const useI18n = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('tr');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Load translations for current language
  const loadTranslations = useCallback(async (language: SupportedLanguage = currentLanguage) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translations')
        .select('key, value, namespace')
        .eq('language_code', language);

      if (error) throw error;

      const translationMap: Record<string, string> = {};
      data?.forEach((t: Translation) => {
        const fullKey = t.namespace === 'common' ? t.key : `${t.namespace}.${t.key}`;
        translationMap[fullKey] = t.value;
      });

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentLanguage]);

  // Get translation by key
  const t = useCallback((key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  }, [translations]);

  // Change language
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    await loadTranslations(language);
    // No page reload - let React handle the updates
  }, [loadTranslations]);

  // Format currency based on language
  const formatCurrency = useCallback((amount: number): string => {
    const currency = currentLanguage === 'tr' ? 'TRY' : 'USD';
    const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, [currentLanguage]);

  // Format number based on language
  const formatNumber = useCallback((value: number): string => {
    const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
    return new Intl.NumberFormat(locale).format(value);
  }, [currentLanguage]);

  // Format date based on language
  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }, [currentLanguage]);

  // Initialize language from localStorage, auto-detection, or browser
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
    
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      // Use saved preference
      setCurrentLanguage(savedLanguage);
      loadTranslations(savedLanguage);
    } else {
      // Auto-detect language
      const browserLanguages = navigator.languages || [navigator.language];
      let detectedLanguage: SupportedLanguage = 'en'; // default
      
      // Check browser languages in order of preference
      for (const lang of browserLanguages) {
        const normalizedLang = lang.toLowerCase();
        if (normalizedLang.startsWith('tr') || normalizedLang.includes('tr')) {
          detectedLanguage = 'tr';
          break;
        }
        if (normalizedLang.startsWith('en') || normalizedLang.includes('en')) {
          detectedLanguage = 'en';
          break;
        }
      }
      
      // Additional detection based on timezone for Turkish users
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezone.includes('Istanbul') || timezone.includes('Ankara')) {
          detectedLanguage = 'tr';
        }
      } catch (error) {
        console.warn('Timezone detection failed:', error);
      }
      
      setCurrentLanguage(detectedLanguage);
      loadTranslations(detectedLanguage);
      
      // Save auto-detected language
      localStorage.setItem('language', detectedLanguage);
      localStorage.setItem('auto-detected-language', JSON.stringify({
        language: detectedLanguage,
        detectedAt: new Date().toISOString(),
        browserLanguages: browserLanguages,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }));
    }
  }, [loadTranslations]);

  return {
    currentLanguage,
    translations,
    loading,
    t,
    changeLanguage,
    formatCurrency,
    formatNumber,
    formatDate,
    loadTranslations
  };
};