import React, { useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { useI18n } from '@/hooks/useI18n';

interface SEOProps {
  pageSlug: string;
  customTitle?: string;
  customDescription?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  pageSlug, 
  customTitle, 
  customDescription 
}) => {
  const { loadPageSEO } = useSEO();
  const { currentLanguage } = useI18n();

  useEffect(() => {
    if (customTitle && customDescription) {
      // Use custom SEO data if provided
      const customSEOData = {
        title: customTitle,
        description: customDescription,
        robots: 'index,follow'
      };
      
      // Set document title
      document.title = customTitle;
      
      // Set meta description
      let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = customDescription;
    } else {
      // Load SEO data from database
      loadPageSEO(pageSlug, currentLanguage);
    }
  }, [pageSlug, currentLanguage, customTitle, customDescription, loadPageSEO]);

  // This component doesn't render anything visible
  return null;
};

export default SEO;