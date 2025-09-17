import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Heart, MessageCircle, Share, Trophy, Star, UserCheck, UserX } from 'lucide-react';
import { useSocialFeatures } from '@/hooks/useSocialFeatures';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

const SocialFeedWidget = () => {
  const [showSocial, setShowSocial] = useState(false);
  const [friendUsername, setFriendUsername] = useState('');

  const {
    profile,
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    respondToFriendRequest,
    updateProfile,
    shareGameResult
  } = useSocialFeatures();

  const { t, currentLanguage, formatNumber } = useI18n();

  const handleSendFriendRequest = async () => {
    if (!friendUsername.trim()) return;

    const success = await sendFriendRequest(friendUsername);
    if (success) {
      setFriendUsername('');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await respondToFriendRequest(requestId, true);
  };

  const handleRejectRequest = async (requestId: string) => {
    await respondToFriendRequest(requestId, false);
  };

  const formatLevel = (level: number) => {
    return `${currentLanguage === 'tr' ? 'Seviye' : 'Level'} ${level}`;
  };

  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const pendingRequests = friendRequests.filter(req => 
    req.receiver_id === profile?.user_id && req.status === 'pending'
  );

  const sentRequests = friendRequests.filter(req => 
    req.requester_id === profile?.user_id && req.status === 'pending'
  );

  if (loading) {
    return (
      <div className="fixed bottom-20 left-4 z-50">
        <Button variant="outline" size="lg" className="rounded-full h-14 w-14">
          <Users className="h-6 w-6 animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Social Widget Button */}
      <div className="fixed bottom-20 left-4 z-50">
        <Button
          onClick={() => setShowSocial(!showSocial)}
          variant="outline"
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Users className="h-6 w-6" />
        </Button>
        
        {pendingRequests.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
          >
            {pendingRequests.length}
          </Badge>
        )}
      </div>

      {/* Social Panel */}
      <Dialog open={showSocial} onOpenChange={setShowSocial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{currentLanguage === 'tr' ? 'Sosyal' : 'Social'}</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                {currentLanguage === 'tr' ? 'Profil' : 'Profile'}
              </TabsTrigger>
              <TabsTrigger value="friends" className="relative">
                {currentLanguage === 'tr' ? 'Arkadaşlar' : 'Friends'}
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                {currentLanguage === 'tr' ? 'Liderlik' : 'Leaderboard'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              {profile && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>
                          {profile.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{profile.display_name}</h3>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {formatLevel(profile.level)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium">{formatNumber(profile.total_games)}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === 'tr' ? 'Oyun' : 'Games'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatNumber(profile.total_wins)}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === 'tr' ? 'Galibiyet' : 'Wins'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          %{getWinRate(profile.total_wins, profile.total_games)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentLanguage === 'tr' ? 'Başarı' : 'Win Rate'}
                        </p>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="friends" className="space-y-4">
              {/* Add Friend */}
              <Card>
                <CardHeader className="pb-2">
                  <h4 className="font-medium text-sm">
                    {currentLanguage === 'tr' ? 'Arkadaş Ekle' : 'Add Friend'}
                  </h4>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex space-x-2">
                    <Input
                      value={friendUsername}
                      onChange={(e) => setFriendUsername(e.target.value)}
                      placeholder={currentLanguage === 'tr' ? 'Kullanıcı adı' : 'Username'}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendFriendRequest}
                      disabled={!friendUsername.trim()}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <h4 className="font-medium text-sm">
                      {currentLanguage === 'tr' ? 'Arkadaşlık İstekleri' : 'Friend Requests'}
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {pendingRequests.length}
                      </Badge>
                    </h4>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.requester_profile?.avatar_url} />
                                <AvatarFallback>
                                  {request.requester_profile?.display_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {request.requester_profile?.display_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{request.requester_profile?.username}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                onClick={() => handleAcceptRequest(request.id)}
                                size="sm"
                                variant="default"
                                className="h-7 w-7 p-0"
                              >
                                <UserCheck className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(request.id)}
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0"
                              >
                                <UserX className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Friends List */}
              <Card>
                <CardHeader className="pb-2">
                  <h4 className="font-medium text-sm">
                    {currentLanguage === 'tr' ? 'Arkadaşlarım' : 'My Friends'}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {friends.length}
                    </Badge>
                  </h4>
                </CardHeader>
                <CardContent className="pt-2">
                  {friends.length > 0 ? (
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {friends.map((friend) => (
                          <div key={friend.id} className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.avatar_url} />
                              <AvatarFallback>
                                {friend.display_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{friend.display_name}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  {formatLevel(friend.level)}
                                </Badge>
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  friend.is_online ? "bg-green-500" : "bg-gray-400"
                                )} />
                                <span className="text-xs text-muted-foreground">
                                  {friend.is_online 
                                    ? (currentLanguage === 'tr' ? 'Çevrimiçi' : 'Online')
                                    : (currentLanguage === 'tr' ? 'Çevrimdışı' : 'Offline')
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {currentLanguage === 'tr' 
                        ? 'Henüz arkadaşınız yok. Arkadaş ekleyerek başlayın!'
                        : 'No friends yet. Start by adding some friends!'
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <h4 className="font-medium text-sm flex items-center space-x-2">
                    <Trophy className="h-4 w-4" />
                    <span>{currentLanguage === 'tr' ? 'Liderlik Tablosu' : 'Leaderboard'}</span>
                  </h4>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {currentLanguage === 'tr' 
                      ? 'Liderlik tablosu yakında geliyor!'
                      : 'Leaderboard coming soon!'
                    }
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocialFeedWidget;