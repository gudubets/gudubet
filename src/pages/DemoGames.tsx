import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { DemoGameProvider } from '@/components/games/DemoGameProvider';
import { Play, Gamepad2, Trophy, Star } from 'lucide-react';
import SEO from '@/components/SEO';

const DemoGames = () => {
  const [selectedProvider, setSelectedProvider] = useState<'NetEnt' | 'EGT' | 'Pragmatic Play' | 'all'>('all');

  const providerStats = [
    { name: 'NetEnt', count: 3, color: 'bg-blue-600' },
    { name: 'EGT', count: 3, color: 'bg-purple-600' },
    { name: 'Pragmatic Play', count: 4, color: 'bg-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <SEO
        pageSlug="demo-games"
        customTitle="Demo Oyunlar - Ücretsiz Casino Oyunları"
        customDescription="NetEnt, EGT ve Pragmatic Play sağlayıcılarının en popüler slot oyunlarını ücretsiz demo modunda oynayın. Kayıt olmadan direkt oynayabilirsiniz."
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-orange-900 via-red-900 to-purple-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-gaming font-bold mb-4">
                🎮 Demo Oyunlar
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-white/90">
                En popüler casino oyunlarını ücretsiz deneyin
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className="bg-orange-500 text-white">
                  <Play className="w-3 h-3 mr-1" />
                  Kayıt Gerektirmez
                </Badge>
                <Badge className="bg-green-500">
                  <Gamepad2 className="w-3 h-3 mr-1" />
                  Anında Oynayın
                </Badge>
                <Badge className="bg-blue-500">
                  <Trophy className="w-3 h-3 mr-1" />
                  Premium Sağlayıcılar
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Provider Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providerStats.map((provider) => (
              <Card key={provider.name} className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${provider.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{provider.name}</h3>
                  <p className="text-gray-400">{provider.count} Demo Oyun</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Öne Çıkan Demo Oyunlar</h2>
          </div>
          
          <DemoGameProvider showFeatured={true} limit={4} />
        </section>

        {/* Provider Tabs */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Sağlayıcı Oyunları</h2>
          
          <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-900">
              <TabsTrigger value="all" className="data-[state=active]:bg-orange-600">
                Tümü
              </TabsTrigger>
              <TabsTrigger value="NetEnt" className="data-[state=active]:bg-blue-600">
                NetEnt
              </TabsTrigger>
              <TabsTrigger value="EGT" className="data-[state=active]:bg-purple-600">
                EGT
              </TabsTrigger>
              <TabsTrigger value="Pragmatic Play" className="data-[state=active]:bg-orange-600">
                Pragmatic Play
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <DemoGameProvider selectedProvider="all" />
            </TabsContent>
            
            <TabsContent value="NetEnt" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">NetEnt Hakkında</h3>
                <p className="text-gray-400 text-sm">
                  NetEnt, İsveç merkezli dünya çapında tanınan bir oyun sağlayıcısıdır. 
                  Yüksek kaliteli slot oyunları ve innovatif özellikleriyle bilinir.
                </p>
              </div>
              <DemoGameProvider selectedProvider="NetEnt" />
            </TabsContent>
            
            <TabsContent value="EGT" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">EGT Hakkında</h3>
                <p className="text-gray-400 text-sm">
                  Euro Games Technology, Bulgaristan merkezli bir şirket olup, 
                  klasik ve modern slot oyunları geliştirir.
                </p>
              </div>
              <DemoGameProvider selectedProvider="EGT" />
            </TabsContent>
            
            <TabsContent value="Pragmatic Play" className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Pragmatic Play Hakkında</h3>
                <p className="text-gray-400 text-sm">
                  Pragmatic Play, yenilikçi ve eğlenceli slot oyunlarıyla tanınan 
                  öncü bir oyun geliştiricisidir. Yüksek volatilite ve büyük kazançlar sunar.
                </p>
              </div>
              <DemoGameProvider selectedProvider="Pragmatic Play" />
            </TabsContent>
          </Tabs>
        </section>

        {/* Info Section */}
        <section className="mt-12">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Demo Oyunlar Hakkında</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Neden Demo Oynayın?</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Ücretsiz ve kayıt gerektirmez</li>
                    <li>• Oyun mekaniğini öğrenin</li>
                    <li>• Risk almadan deneyim kazanın</li>
                    <li>• Bonus özelliklerini keşfedin</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Demo ve Gerçek Fark</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Demo modda sanal para kullanılır</li>
                    <li>• Gerçek para kazanamaz veya kaybedemezsiniz</li>
                    <li>• Tüm özellikler gerçek sürümle aynıdır</li>
                    <li>• RTP oranları değişmez</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DemoGames;