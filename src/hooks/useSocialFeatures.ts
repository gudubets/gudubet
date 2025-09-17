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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialProfile();
    loadFriends();
    loadFriendRequests();
    
    // Set up real-time subscriptions
    const profileChannel = supabase
      .channel('user_social_profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_social_profiles'
      }, () => {
        loadSocialProfile();
      })
      .subscribe();

    const friendsChannel = supabase
      .channel('friendships')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships'
      }, () => {
        loadFriends();
        loadFriendRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(friendsChannel);
    };
  }, []);

  const loadSocialProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_social_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading social profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create default social profile
        await createSocialProfile();
      }
    } catch (error) {
      console.error('Error loading social profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSocialProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const username = `user_${user.id.slice(0, 8)}`;
      const displayName = userProfile 
        ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
        : username;

      const { data, error } = await supabase
        .from('user_social_profiles')
        .insert({
          user_id: user.id,
          username,
          display_name: displayName || username,
          level: 1,
          total_wins: 0,
          total_games: 0,
          friend_count: 0,
          is_online: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating social profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error creating social profile:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          user_social_profiles!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading friends:', error);
        return;
      }

      const friendsData = data?.map(f => f.user_social_profiles).filter(Boolean) || [];
      setFriends(friendsData as SocialProfile[]);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester_profile:user_social_profiles!friend_requests_requester_id_fkey(*),
          receiver_profile:user_social_profiles!friend_requests_receiver_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading friend requests:', error);
        return;
      }

      setFriendRequests(data || []);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const sendFriendRequest = async (targetUsername: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Find target user by username
      const { data: targetProfile, error: findError } = await supabase
        .from('user_social_profiles')
        .select('user_id')
        .eq('username', targetUsername)
        .single();

      if (findError || !targetProfile) {
        toast({
          title: "Kullanıcı Bulunamadı",
          description: "Belirtilen kullanıcı adı bulunamadı.",
          variant: "destructive"
        });
        return false;
      }

      if (targetProfile.user_id === user.id) {
        toast({
          title: "Hata",
          description: "Kendinize arkadaşlık isteği gönderemezsiniz.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          requester_id: user.id,
          receiver_id: targetProfile.user_id,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Zaten Gönderildi",
            description: "Bu kullanıcıya zaten arkadaşlık isteği gönderdiniz.",
            variant: "destructive"
          });
        } else {
          console.error('Error sending friend request:', error);
          toast({
            title: "Hata",
            description: "Arkadaşlık isteği gönderilirken hata oluştu.",
            variant: "destructive"
          });
        }
        return false;
      }

      toast({
        title: "Arkadaşlık İsteği Gönderildi",
        description: `${targetUsername} kullanıcısına arkadaşlık isteği gönderildi.`,
      });

      loadFriendRequests();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Error responding to friend request:', error);
        return false;
      }

      if (accept) {
        // Create mutual friendships
        const request = friendRequests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('friendships')
            .insert([
              { user_id: request.requester_id, friend_id: request.receiver_id, status: 'accepted' },
              { user_id: request.receiver_id, friend_id: request.requester_id, status: 'accepted' }
            ]);
        }
      }

      toast({
        title: accept ? "Arkadaşlık İsteği Kabul Edildi" : "Arkadaşlık İsteği Reddedildi",
        description: accept ? "Yeni bir arkadaşınız var!" : "Arkadaşlık isteği reddedildi.",
      });

      loadFriends();
      loadFriendRequests();
      return true;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<SocialProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_social_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      loadSocialProfile();
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const shareGameResult = async (gameType: string, result: 'win' | 'loss', amount?: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const shareText = result === 'win' 
        ? `🎉 ${gameType} oyununda ${amount ? amount + ' TL' : ''} kazandım!`
        : `🎮 ${gameType} oyunu oynadım, sonraki sefere!`;

      // Save to activity feed
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: 'game_result',
          content: shareText,
          metadata: { gameType, result, amount }
        });

      toast({
        title: "Sonuç Paylaşıldı",
        description: "Oyun sonucunuz aktivite akışında paylaşıldı!",
      });
    } catch (error) {
      console.error('Error sharing game result:', error);
    }
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