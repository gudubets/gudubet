import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOData {
  title: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: any;
}

export const useSEO = () => {
  // Set page SEO data
  const setSEO = useCallback((seoData: SEOData) => {
    // Set title
    document.title = seoData.title;

    // Set or update meta tags
    const setOrUpdateMeta = (name: string, content: string, type: 'name' | 'property' = 'name') => {
      let meta = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(type, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    if (seoData.description) {
      setOrUpdateMeta('description', seoData.description);
    }
    
    if (seoData.keywords) {
      setOrUpdateMeta('keywords', seoData.keywords);
    }

    if (seoData.robots) {
      setOrUpdateMeta('robots', seoData.robots);
    }

    // Open Graph tags
    setOrUpdateMeta('og:title', seoData.og_title || seoData.title, 'property');
    
    if (seoData.og_description || seoData.description) {
      setOrUpdateMeta('og:description', seoData.og_description || seoData.description!, 'property');
    }

    if (seoData.og_image) {
      setOrUpdateMeta('og:image', seoData.og_image, 'property');
    }

    setOrUpdateMeta('og:url', window.location.href, 'property');
    setOrUpdateMeta('og:type', 'website', 'property');

    // Twitter Card tags
    setOrUpdateMeta('twitter:card', 'summary_large_image');
    setOrUpdateMeta('twitter:title', seoData.og_title || seoData.title);
    
    if (seoData.og_description || seoData.description) {
      setOrUpdateMeta('twitter:description', seoData.og_description || seoData.description!);
    }

    if (seoData.og_image) {
      setOrUpdateMeta('twitter:image', seoData.og_image);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoData.canonical_url || window.location.href;

    // Schema markup
    if (seoData.schema_markup) {
      let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(seoData.schema_markup);
    }
  }, []);

  // Load SEO data from database for a specific page
  const loadPageSEO = useCallback(async (pageSlug: string, language: string = 'tr') => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .eq('page_slug', pageSlug)
        .eq('language_code', language)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Fallback to default SEO
        setSEO({
          title: 'Online Casino & Bahis Sitesi',
          description: 'Güvenli online casino ve spor bahisleri deneyimi.',
          robots: 'index,follow'
        });
        return;
      }

      setSEO({
        title: data.title,
        description: data.description,
        keywords: data.keywords,
        og_title: data.og_title,
        og_description: data.og_description,
        og_image: data.og_image,
        canonical_url: data.canonical_url,
        robots: data.robots,
        schema_markup: data.schema_markup
      });
    } catch (error) {
      console.error('Error loading SEO data:', error);
    }
  }, [setSEO]);

  // Generate sitemap data
  const generateSitemap = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('page_slug, language_code, updated_at')
        .eq('is_active', true);

      if (error) throw error;

      const sitemapEntries = data?.map(page => ({
        url: `${window.location.origin}/${page.page_slug}`,
        lastModified: page.updated_at,
        language: page.language_code,
        priority: page.page_slug === 'home' ? '1.0' : '0.8'
      })) || [];

      return sitemapEntries;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return [];
    }
  }, []);

  return {
    setSEO,
    loadPageSEO,
    generateSitemap
  };
};