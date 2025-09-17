import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SocialProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  level: number;
  total_wins: number;
  total_games: number;
  friend_count: number;
  is_online: boolean;
  last_seen: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester_profile?: SocialProfile;
  receiver_profile?: SocialProfile;
}

export const useSocialFeatures = () => {
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [friends, setFriends] = useState<SocialProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false); // Start as false since we're using mock data
  const { toast } = useToast();

  useEffect(() => {
    loadSocialProfile();
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadSocialProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create mock profile for now until database types are updated
      const mockProfile: SocialProfile = {
        id: `social_${user.id}`,
        user_id: user.id,
        username: `user_${user.id.slice(0, 8)}`,
        display_name: 'Oyuncu',
        level: 5,
        total_wins: 23,
        total_games: 45,
        friend_count: 0,
        is_online: true,
        last_seen: new Date().toISOString()
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading social profile:', error);
    }
  };

  const createSocialProfile = async () => {
    // Mock implementation
    return null;
  };

  const loadFriends = async () => {
    try {
      // Mock friends data until types are updated
      const mockFriends: SocialProfile[] = [];
      setFriends(mockFriends);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      // Mock friend requests until types are updated
      const mockRequests: FriendRequest[] = [];
      setFriendRequests(mockRequests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const sendFriendRequest = async (targetUsername: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Mock implementation for now
      toast({
        title: "Özellik Hazırlanıyor",
        description: "Arkadaşlık sistemi yakında aktif olacak!",
      });
      return false;

    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    toast({
      title: "Özellik Hazırlanıyor",
      description: "Arkadaşlık sistemi yakında aktif olacak!",
    });
    return false;
  };

  const updateProfile = async (updates: Partial<SocialProfile>) => {
    toast({
      title: "Özellik Hazırlanıyor",
      description: "Profil güncelleme yakında aktif olacak!",
    });
    return false;
  };

  const shareGameResult = async (gameType: string, result: 'win' | 'loss', amount?: number) => {
    const shareText = result === 'win' 
      ? `🎉 ${gameType} oyununda ${amount ? amount + ' TL' : ''} kazandım!`
      : `🎮 ${gameType} oyunu oynadım, sonraki sefere!`;

    toast({
      title: "Sonuç Paylaşıldı",
      description: "Sosyal özellikler yakında aktif olacak!",
    });
  };

  return {
    profile,
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    updateProfile,
    shareGameResult
  };
};