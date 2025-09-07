import React from "react";
import { Crown, Gift, TrendingUp, Users, Diamond, Award, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";

const VIP = () => {
  const tiers = [
    {
      name: 'BRONZE',
      color: 'from-orange-600 to-orange-500',
      icon: '🥉',
      percentage: 10,
      points: 10000,
      textColor: 'text-orange-400'
    },
    {
      name: 'SILVER',
      color: 'from-gray-400 to-gray-300',
      icon: '🥈',
      percentage: 12,
      points: 30000,
      textColor: 'text-gray-400'
    },
    {
      name: 'GOLD',
      color: 'from-yellow-500 to-yellow-400',
      icon: '🥇',
      percentage: 15,
      points: 100000,
      textColor: 'text-yellow-400'
    },
    {
      name: 'PLATINUM',
      color: 'from-blue-500 to-blue-400',
      icon: '💎',
      percentage: 20,
      points: 300000,
      textColor: 'text-blue-400'
    },
    {
      name: 'DIAMOND',
      color: 'from-purple-600 to-purple-500',
      icon: '💜',
      percentage: 25,
      points: '∞',
      textColor: 'text-purple-400'
    }
  ];

  const benefits = [
    {
      icon: Gift,
      title: "Çevrimsiz Yatırım Bonusu",
      description: "VIP seviyenize göre yatırımlarınızda alabileceğiniz bonus miktarıdır. Bu bonustan yararlanabilmek için bonuslar sayfasından ilgili bonusu seçmeniz gerekmektedir. Sonrasında bonus otomatik olarak hesabınıza eklenecektir."
    },
    {
      icon: TrendingUp,
      title: "Seviye Atlama Puanı",
      description: "Bir sonraki seviyeye ulaşmanız için gerekten puandır. 1 puan = 1 euro."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-10 py-8 px-6">
                <Crown className="w-16 h-16 text-yellow-500 mr-4" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  GuduBet VIP Programı
                </h1>
              </div>
              
              <p className="text-xl text-muted-foreground mb-4">
                GuduBet VIP Programı ile oynadıkça seviyenizi arttırabilirsiniz.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Her seviyeye göre farklı bonus ve ayrıcalıklara sahip olabilirsiniz. 
                Katılmak tamamen ücretsizdir.
              </p>
              
              <div className="bg-muted/30 border border-muted rounded-lg p-6 max-w-4xl mx-auto">
                <p className="text-muted-foreground">
                  GuduBet'e üye olur olmaz otomatik olarak <span className="text-orange-400 font-semibold">BRONZE</span> seviyesinin avantajlarından faydalanabilirsiniz. 
                  Bir sonraki seviyeye geçmek için 10.000 Puan toplamanız yeterlidir. 1 Puan = 1 Euro olup toplamda yaklaşık 350.000 
                  TL'lik oyun çevirmeniz halinde <span className="text-gray-400 font-semibold">SILVER</span> seviyesine yükselebilirsiniz. 
                  Silver seviyedeki kullanıcılar için 2 Euro oyun çevrimi 1 puan kazandıracaktır. Gold, Platinum, ve Diamond 
                  seviyedeki kullanıcılar için 3 Euro oyun çevrimi 1 puan kazandıracaktır.
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
                GuduBet VIP Programı bonus ve ayrıcalıkları aşağıda belirtilmiştir:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="bg-card border border-border">
                    <CardHeader>
                      <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-3 rounded-full mr-4">
                          <span className="text-2xl">{index + 1}</span>
                        </div>
                        <benefit.icon className="w-8 h-8 text-yellow-500" />
                      </div>
                      <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* VIP Tiers */}
            <div className="space-y-12">
              {/* Deposit Bonus Tiers */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Gift className="w-8 h-8 mr-3 text-yellow-500" />
                    Çevrimsiz Yatırım Bonusu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {tiers.map((tier, index) => (
                      <div key={tier.name} className="text-center">
                        <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-lg mb-4`}>
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <div className="text-white font-bold text-lg mb-2">{tier.name}</div>
                          <div className="text-white text-3xl font-bold">%{tier.percentage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Level Up Points */}
              <Card className="bg-card border border-border">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <TrendingUp className="w-8 h-8 mr-3 text-yellow-500" />
                    Seviye Atlama Puanı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {tiers.map((tier, index) => (
                      <div key={tier.name} className="text-center">
                        <div className={`bg-gradient-to-br ${tier.color} p-6 rounded-lg mb-4`}>
                          <div className="text-4xl mb-2">{tier.icon}</div>
                          <div className="text-white font-bold text-lg mb-2">{tier.name}</div>
                          <div className="text-white text-2xl font-bold">
                            {typeof tier.points === 'number' ? tier.points.toLocaleString() : tier.points}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Benefits */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Özel Ayrıcalıklar</h3>
                  <p className="text-muted-foreground">VIP seviyenize özel bonus ve promosyonlardan yararlanın</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Kişisel Destek</h3>
                  <p className="text-muted-foreground">Yüksek seviye üyelerimize özel destek hizmeti</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Özel Etkinlikler</h3>
                  <p className="text-muted-foreground">VIP üyelerimize özel turnuva ve etkinlikler</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VIP;