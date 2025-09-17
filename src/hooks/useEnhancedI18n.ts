import { useState, useCallback } from 'react';
import { useI18n } from '@/hooks/useI18n';

// Extended translation keys for new features
const enhancedTranslations = {
  tr: {
    // Social Features
    'social.friends': 'Arkadaşlar',
    'social.addFriend': 'Arkadaş Ekle',
    'social.friendRequests': 'Arkadaşlık İstekleri',
    'social.online': 'Çevrimiçi',
    'social.offline': 'Çevrimdışı',
    'social.level': 'Seviye',
    'social.wins': 'Galibiyet',
    'social.games': 'Oyun',
    'social.winRate': 'Başarı Oranı',
    'social.leaderboard': 'Liderlik Tablosu',
    'social.profile': 'Profil',
    'social.shareWin': 'Kazancı Paylaş',
    'social.shareLoss': 'Oyunu Paylaş',

    // Live Chat
    'chat.liveSupport': 'Canlı Destek',
    'chat.startChat': 'Görüşme Başlat',
    'chat.endChat': 'Görüşmeyi Sonlandır',
    'chat.typeMessage': 'Mesajınızı yazın...',
    'chat.send': 'Gönder',
    'chat.agentsOnline': 'temsilci çevrimiçi',
    'chat.supportRequest': 'Destek Talebi',
    'chat.subject': 'Konu',
    'chat.priority': 'Öncelik',
    'chat.description': 'Açıklama',
    'chat.waiting': 'Bekliyor',
    'chat.active': 'Aktif',
    'chat.closed': 'Kapalı',
    'chat.low': 'Düşük',
    'chat.medium': 'Orta',
    'chat.high': 'Yüksek',

    // Push Notifications
    'notification.enable': 'Bildirimleri Etkinleştir',
    'notification.enabled': 'Bildirimler Etkin',
    'notification.permission': 'Bildirim İzni',
    'notification.testNotification': 'Test Bildirimi Gönder',
    'notification.dontMiss': 'Bonus ve promosyon bildirimlerini kaçırmayın!',

    // General UX
    'ux.comingSoon': 'Yakında Geliyor',
    'ux.featureInDevelopment': 'Özellik Geliştiriliyor',
    'ux.stayTuned': 'Takipte Kalın',
    'ux.newFeature': 'Yeni Özellik',
    'ux.beta': 'Beta',
    'ux.experimental': 'Deneysel'
  },
  en: {
    // Social Features
    'social.friends': 'Friends',
    'social.addFriend': 'Add Friend',
    'social.friendRequests': 'Friend Requests',
    'social.online': 'Online',
    'social.offline': 'Offline',
    'social.level': 'Level',
    'social.wins': 'Wins',
    'social.games': 'Games',
    'social.winRate': 'Win Rate',
    'social.leaderboard': 'Leaderboard',
    'social.profile': 'Profile',
    'social.shareWin': 'Share Win',
    'social.shareLoss': 'Share Game',

    // Live Chat
    'chat.liveSupport': 'Live Support',
    'chat.startChat': 'Start Chat',
    'chat.endChat': 'End Chat',
    'chat.typeMessage': 'Type your message...',
    'chat.send': 'Send',
    'chat.agentsOnline': 'agents online',
    'chat.supportRequest': 'Support Request',
    'chat.subject': 'Subject',
    'chat.priority': 'Priority',
    'chat.description': 'Description',
    'chat.waiting': 'Waiting',
    'chat.active': 'Active',
    'chat.closed': 'Closed',
    'chat.low': 'Low',
    'chat.medium': 'Medium',
    'chat.high': 'High',

    // Push Notifications
    'notification.enable': 'Enable Notifications',
    'notification.enabled': 'Notifications Enabled',
    'notification.permission': 'Notification Permission',
    'notification.testNotification': 'Send Test Notification',
    'notification.dontMiss': 'Don\'t miss bonus and promotion notifications!',

    // General UX
    'ux.comingSoon': 'Coming Soon',
    'ux.featureInDevelopment': 'Feature in Development',
    'ux.stayTuned': 'Stay Tuned',
    'ux.newFeature': 'New Feature',
    'ux.beta': 'Beta',
    'ux.experimental': 'Experimental'
  }
};

export const useEnhancedI18n = () => {
  const { currentLanguage, t: baseT, ...rest } = useI18n();
  
  const enhancedT = useCallback((key: string, fallback?: string): string => {
    // First try enhanced translations
    const enhancedTranslation = enhancedTranslations[currentLanguage]?.[key];
    if (enhancedTranslation) return enhancedTranslation;
    
    // Fall back to base translations
    return baseT(key, fallback);
  }, [currentLanguage, baseT]);

  const tSocial = useCallback((key: string) => enhancedT(`social.${key}`), [enhancedT]);
  const tChat = useCallback((key: string) => enhancedT(`chat.${key}`), [enhancedT]);
  const tNotification = useCallback((key: string) => enhancedT(`notification.${key}`), [enhancedT]);
  const tUx = useCallback((key: string) => enhancedT(`ux.${key}`), [enhancedT]);

  return {
    ...rest,
    currentLanguage,
    t: enhancedT,
    tSocial,
    tChat,
    tNotification,
    tUx
  };
};