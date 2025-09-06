import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Gift, 
  Calendar, 
  TrendingUp, 
  Percent, 
  Star, 
  Clock,
  Users,
  Trophy,
  Zap,
  Copy,
  Share2,
  Timer,
  Crown,
  Flame,
  CheckCircle
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  image_url: string;
  category: string;
  bonus_amount: number | null;
  bonus_percentage: number | null;
  min_deposit: number | null;
  max_bonus: number | null;
  wagering_requirement: number;
  promo_code: string | null;
  terms_conditions: string;
  start_date: string;
  end_date: string;
  max_participants: number | null;
  current_participants: number;
}

interface UserPromotion {
  id: string;
  promotion_id: string;
  status: string;
  participated_at: string;
}

const Promotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [userPromotions, setUserPromotions] = useState<UserPromotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string>('');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'Tümü', icon: Gift },
    { id: 'welcome', name: 'Hoş Geldin', icon: Star },
    { id: 'deposit', name: 'Yatırım', icon: TrendingUp },
    { id: 'freebet', name: 'Freebet', icon: Zap },
    { id: 'cashback', name: 'Cashback', icon: Percent },
    { id: 'special', name: 'Özel Gün', icon: Trophy },
    { id: 'vip', name: 'VIP', icon: Crown },
  ];

  // Countdown Timer Component
  const CountdownTimer = ({ endDate }: { endDate: string }) => {
    const [timeLeft, setTimeLeft] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const distance = end - now;

        if (distance < 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <Timer className="w-4 h-4 mr-1" />
          <span>Süresi Doldu</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-sm">
        <Timer className="w-4 h-4 text-orange-500" />
        <div className="flex space-x-1">
          {timeLeft.days > 0 && (
            <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
              {timeLeft.days}g
            </span>
          )}
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.hours.toString().padStart(2, '0')}s
          </span>
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.minutes.toString().padStart(2, '0')}d
          </span>
          <span className="bg-orange-500/20 text-orange-500 px-1 rounded text-xs font-mono">
            {timeLeft.seconds.toString().padStart(2, '0')}sn
          </span>
        </div>
      </div>
    );
  };

  // Copy Promo Code Function
  const copyPromoCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Kopyalandı!",
        description: `Promosyon kodu ${code} panoya kopyalandı.`,
      });
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kod kopyalanırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Social Share Function
  const sharePromotion = (promotion: Promotion) => {
    const text = `🎉 ${promotion.title} - ${promotion.description}`;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: promotion.title,
        text: text,
        url: url
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${text} ${url}`);
      toast({
        title: "Paylaşım Linki Kopyalandı!",
        description: "Promosyon linki panoya kopyalandı.",
      });
    }
  };

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Hata",
        description: "Promosyonlar yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user promotions
  const fetchUserPromotions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_promotions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPromotions(data || []);
    } catch (error) {
      console.error('Error fetching user promotions:', error);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchUserPromotions();
  }, []);

  // Filter promotions by category
  const filteredPromotions = selectedCategory === 'all' 
    ? promotions 
    : promotions.filter(promo => promo.category === selectedCategory);

  // Check if user already participated in promotion
  const hasParticipated = (promotionId: string) => {
    return userPromotions.some(up => up.promotion_id === promotionId);
  };

  // Join promotion
  const joinPromotion = async (promotion: Promotion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Giriş Gerekli",
          description: "Promosyona katılmak için giriş yapmalısınız.",
          variant: "destructive"
        });
        return;
      }

      // Check if already participated
      if (hasParticipated(promotion.id)) {
        toast({
          title: "Zaten Katıldınız",
          description: "Bu promosyona zaten katılmışsınız.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('user_promotions')
        .insert({
          user_id: user.id,
          promotion_id: promotion.id,
          status: 'pending',
          expires_at: promotion.end_date
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: `${promotion.title} promosyonuna başarıyla katıldınız!`,
      });

      // Refresh user promotions
      fetchUserPromotions();
    } catch (error) {
      console.error('Error joining promotion:', error);
      toast({
        title: "Hata",
        description: "Promosyona katılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryObj = categories.find(cat => cat.id === category);
    const IconComponent = categoryObj?.icon || Gift;
    return <IconComponent className="w-4 h-4" />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="bg-slate-900 border-b border-border">
        {/* Main Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <a href="/" className="bg-destructive px-4 py-2 rounded hover:bg-destructive/90 transition-colors cursor-pointer">
                <span className="text-destructive-foreground font-bold">GUDUBET</span>
              </a>
              
              {/* Main Navigation Links */}
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/" className="text-muted-foreground hover:text-white transition-colors">Ana Sayfa</a>
                <a href="/sports-betting" className="text-muted-foreground hover:text-white transition-colors">Spor</a>
                <a href="/live-betting" className="text-muted-foreground hover:text-white transition-colors">Canlı</a>
                <a href="/casino" className="text-muted-foreground hover:text-white transition-colors">Casino</a>
                <a href="/live-casino" className="text-muted-foreground hover:text-white transition-colors">Canlı Casino</a>
                <a href="/promotions" className="text-primary border-b-2 border-primary pb-1">Promosyonlar</a>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <span className="text-lg">💬</span>
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                Giriş Yap
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Üye Ol
              </Button>
            </div>
          </div>
        </div>

        {/* Game Categories */}
        <div className="border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center space-x-8">
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎰 Slot Oyunları
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🃏 Masa Oyunları
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎲 Canlı Casino
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎯 Jackpot
                </Button>
                <Button variant="ghost" className="text-sm hover:bg-white/5 text-muted-foreground hover:text-white">
                  🎮 Sanal Sporlar
                </Button>
              </div>
              
              <Button variant="ghost" className="text-muted-foreground hover:text-white text-sm">
                🔍 Ara
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-0">
        {/* Left Sidebar */}
        <div className="w-64 bg-muted/30 min-h-screen border-r">
          {/* Quick Links */}
          <div className="p-4 border-b border-border">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Hızlı Linkler</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Trophy className="h-4 w-4 mr-2" />
                Aktif Promosyonlar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Star className="h-4 w-4 mr-2" />
                Popüler Bonuslar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Clock className="h-4 w-4 mr-2" />
                Süreli Kampanyalar
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm hover:bg-muted">
                <Users className="h-4 w-4 mr-2" />
                VIP Promosyonlar
              </Button>
            </div>
          </div>

          {/* Promotion Categories */}
          <div className="p-4">
            <h3 className="text-destructive font-semibold mb-3 text-sm">Kategoriler</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                  <Badge variant="secondary" className="ml-auto">
                    {category.id === 'all' 
                      ? promotions.length 
                      : promotions.filter(p => p.category === category.id).length
                    }
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b">
            <div className="container mx-auto px-6 py-12">
              <div className="flex items-center justify-between">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold mb-4">Promosyonlar & Bonuslar</h1>
                  <p className="text-lg text-muted-foreground mb-6">
                    Size özel hazırlanmış muhteşem bonus ve promosyonlarla kazancınızı artırın! 
                    Hoş geldin bonuslarından özel gün kampanyalarına kadar birçok fırsatı kaçırmayın.
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Gift className="w-4 h-4 mr-2" />
                      <span>{promotions.length} Aktif Promosyon</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Günlük Güncelleme</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      <span>VIP Bonuslar</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-64 h-32 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-16 h-16 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIP Section */}
          {selectedCategory === 'vip' && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500/20 rounded-full">
                    <Crown className="w-8 h-8 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-500">VIP Promosyonları</h3>
                    <p className="text-sm text-muted-foreground">Özel üyelerimiz için hazırlanmış elit fırsatlar</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Elit Üye
                </Badge>
              </div>
            </div>
          )}

          {/* Promotions Grid */}
          <div className="container mx-auto px-6 py-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Promosyonlar yükleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((promotion) => {
                  // Calculate days left
                  const daysLeft = Math.ceil((new Date(promotion.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 3;
                  const hasPromoCode = promotion.promo_code;
                  const participationRate = promotion.max_participants 
                    ? (promotion.current_participants / promotion.max_participants) * 100 
                    : 0;

                  return (
                    <Card key={promotion.id} className={`group bg-slate-800 border-slate-700 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-fade-in ${
                      isUrgent ? 'ring-2 ring-orange-500/30' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        {/* Hot/New/VIP Badges */}
                        <div className="absolute top-3 right-3 flex space-x-1">
                          {isUrgent && (
                            <Badge className="bg-red-500/20 text-red-500 border-red-500/30 animate-pulse">
                              <Flame className="w-3 h-3 mr-1" />
                              Acil
                            </Badge>
                          )}
                          {promotion.category === 'welcome' && (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              Yeni
                            </Badge>
                          )}
                          {promotion.category === 'vip' && (
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              VIP
                            </Badge>
                          )}
                        </div>

                        <div className="aspect-video bg-slate-700 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                          {getCategoryIcon(promotion.category)}
                          <span className="ml-2 text-sm text-muted-foreground relative z-10">
                            {categories.find(c => c.id === promotion.category)?.name}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                              {promotion.title}
                            </CardTitle>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="outline">
                                {categories.find(c => c.id === promotion.category)?.name}
                              </Badge>
                              {hasPromoCode && (
                                <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                                  <Copy className="w-3 h-3 mr-1" />
                                  Kod
                                </Badge>
                              )}
                            </div>
                          </div>
                          {promotion.bonus_percentage && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                %{promotion.bonus_percentage}
                              </div>
                              <div className="text-xs text-muted-foreground">Bonus</div>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {promotion.description}
                        </p>

                        {/* Countdown Timer */}
                        <div className="mb-4">
                          <CountdownTimer endDate={promotion.end_date} />
                        </div>

                        {/* Participation Progress */}
                        {promotion.max_participants && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Katılım</span>
                              <span className="font-medium">
                                {promotion.current_participants}/{promotion.max_participants}
                              </span>
                            </div>
                            <Progress value={participationRate} className="h-2" />
                          </div>
                        )}
                        
                        <div className="space-y-2 mb-4">
                          {promotion.min_deposit && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Min. Yatırım:</span>
                              <span className="font-medium">₺{promotion.min_deposit}</span>
                            </div>
                          )}
                          {promotion.max_bonus && (
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Max. Bonus:</span>
                              <span className="font-medium">₺{promotion.max_bonus}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Çevrim:</span>
                            <span className="font-medium">{promotion.wagering_requirement}x</span>
                          </div>
                        </div>

                        {/* Promo Code */}
                        {hasPromoCode && (
                          <div className="mb-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <Copy className="w-4 h-4 text-blue-500 mr-2" />
                                <code className="text-blue-500 font-mono font-bold text-sm">
                                  {promotion.promo_code}
                                </code>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-auto p-1 text-blue-500 hover:bg-blue-500/20"
                                onClick={() => copyPromoCode(promotion.promo_code!)}
                              >
                                {copiedCode === promotion.promo_code ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => setSelectedPromotion(promotion)}
                              >
                                Detaylar
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="p-2"
                            onClick={() => sharePromotion(promotion)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            className={`flex-1 transition-all duration-200 ${
                              hasParticipated(promotion.id) 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-primary hover:bg-primary/90 hover:shadow-lg'
                            }`}
                            onClick={() => joinPromotion(promotion)}
                            disabled={hasParticipated(promotion.id)}
                          >
                            {hasParticipated(promotion.id) ? (
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Katıldınız
                              </div>
                            ) : (
                              'Katıl'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!loading && filteredPromotions.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedCategory === 'all' 
                    ? 'Şu anda aktif promosyon bulunmuyor.' 
                    : `${categories.find(c => c.id === selectedCategory)?.name} kategorisinde promosyon bulunmuyor.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Promotion Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedPromotion && getCategoryIcon(selectedPromotion.category)}
              <span>{selectedPromotion?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPromotion && (
            <div className="space-y-6">
              {/* Promotion Image Placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Promosyon Görseli</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Promosyon Açıklaması</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedPromotion.detailed_description || selectedPromotion.description}
                </p>
              </div>

              {/* Promotion Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {selectedPromotion.bonus_percentage && (
                    <div>
                      <span className="text-sm font-medium">Bonus Oranı:</span>
                      <p className="text-lg font-bold text-primary">%{selectedPromotion.bonus_percentage}</p>
                    </div>
                  )}
                  {selectedPromotion.bonus_amount && (
                    <div>
                      <span className="text-sm font-medium">Bonus Miktarı:</span>
                      <p className="text-lg font-bold text-primary">₺{selectedPromotion.bonus_amount}</p>
                    </div>
                  )}
                  {selectedPromotion.min_deposit && (
                    <div>
                      <span className="text-sm font-medium">Minimum Yatırım:</span>
                      <p className="font-medium">₺{selectedPromotion.min_deposit}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedPromotion.max_bonus && (
                    <div>
                      <span className="text-sm font-medium">Maksimum Bonus:</span>
                      <p className="font-medium">₺{selectedPromotion.max_bonus}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium">Çevrim Şartı:</span>
                    <p className="font-medium">{selectedPromotion.wagering_requirement}x</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Geçerlilik:</span>
                    <p className="font-medium text-xs">
                      {formatDate(selectedPromotion.start_date)} - {formatDate(selectedPromotion.end_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h4 className="font-semibold mb-2">Şartlar ve Koşullar</h4>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {selectedPromotion.terms_conditions}
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              {selectedPromotion.promo_code && (
                <div>
                  <h4 className="font-semibold mb-2">Promosyon Kodu</h4>
                  <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                    <code className="text-primary font-mono font-bold">
                      {selectedPromotion.promo_code}
                    </code>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => {
                    joinPromotion(selectedPromotion);
                    setIsDialogOpen(false);
                  }}
                  disabled={hasParticipated(selectedPromotion.id)}
                >
                  {hasParticipated(selectedPromotion.id) ? 'Zaten Katıldınız' : 'Promosyona Katıl'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Promotions;