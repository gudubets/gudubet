import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { Search, MessageCircle, Phone, Mail, Clock, Users, Shield, CreditCard, Gift, Gamepad2, HelpCircle } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

const HelpCenter = () => {
  const { t } = useI18n();

  const categories = [
    {
      icon: Users,
      title: t('help.categories.account.title', 'Account Management'),
      description: t('help.categories.account.desc', 'Account opening, profile editing and security'),
      color: "bg-blue-500"
    },
    {
      icon: CreditCard,
      title: t('help.categories.payment.title', 'Deposit & Withdrawal'),
      description: t('help.categories.payment.desc', 'Payment methods and transaction processes'),
      color: "bg-green-500"
    },
    {
      icon: Gift,
      title: t('help.categories.bonus.title', 'Bonuses & Promotions'),
      description: t('help.categories.bonus.desc', 'Bonus rules and promotion information'),
      color: "bg-purple-500"
    },
    {
      icon: Gamepad2,
      title: t('help.categories.games.title', 'Games & Betting'),
      description: t('help.categories.games.desc', 'Game rules and betting guide'),
      color: "bg-orange-500"
    },
    {
      icon: Shield,
      title: t('help.categories.security.title', 'Security & Privacy'),
      description: t('help.categories.security.desc', 'Account security and privacy policy'),
      color: "bg-red-500"
    },
    {
      icon: HelpCircle,
      title: t('help.categories.technical.title', 'Technical Support'),
      description: t('help.categories.technical.desc', 'Technical issues and solution suggestions'),
      color: "bg-indigo-500"
    }
  ];

  const faqItems = [
    {
      category: t('help.faq.category.general', 'General'),
      question: t('help.faq.q1', 'How to open a GuduBet account?'),
      answer: t('help.faq.a1', 'Click the "SIGN UP" button on the homepage and fill in your personal information. Your account will be activated after email verification.')
    },
    {
      category: t('help.faq.category.payment', 'Payment'),
      question: t('help.faq.q2', 'How long does deposit take?'),
      answer: t('help.faq.a2', 'Payments made by credit card and EFT are instantly reflected to your account. Bank transfer transactions may take 1-3 business days.')
    },
    {
      category: t('help.faq.category.payment', 'Payment'),
      question: t('help.faq.q3', 'What are the withdrawal limits?'),
      answer: t('help.faq.a3', 'You can withdraw minimum 50 TL, maximum 50,000 TL daily. Limits are higher for VIP members.')
    },
    {
      category: t('help.faq.category.bonus', 'Bonus'),
      question: t('help.faq.q4', 'How to get welcome bonus?'),
      answer: t('help.faq.a4', '100% bonus is automatically loaded to your account on your first deposit. Bonus wagering requirement is 35x.')
    },
    {
      category: t('help.faq.category.bonus', 'Bonus'),
      question: t('help.faq.q5', 'What are bonus wagering requirements?'),
      answer: t('help.faq.a5', 'You need to wager the bonus amount 35 times in casino games. Wagering rate is different for sports betting.')
    },
    {
      category: t('help.faq.category.technical', 'Technical'),
      question: t('help.faq.q6', 'Where can I download the mobile app?'),
      answer: t('help.faq.a6', 'You can download the APK file for Android from our website, for iOS from the App Store.')
    },
    {
      category: t('help.faq.category.security', 'Security'),
      question: t('help.faq.q7', 'Is my account secure?'),
      answer: t('help.faq.a7', 'Your account is protected with SSL encryption and 2FA. Your personal information is never shared with third parties.')
    },
    {
      category: t('help.faq.category.general', 'General'),
      question: t('help.faq.q8', 'What are live support hours?'),
      answer: t('help.faq.a8', 'We provide 24/7 live support service. Average response time is 30 seconds.')
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="bg-gradient-to-br from-background to-background/50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
              {t('help.title', 'GuduBet Help Center')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('help.subtitle', 'We are here to help you. Can\'t find the answer you\'re looking for? Contact our support team.')}
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder={t('help.search.placeholder', 'Type your question here...')} 
                className="pl-10 py-3 text-lg border-primary/20"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{t('help.actions.live.title', 'Live Support')}</CardTitle>
                <CardDescription>{t('help.actions.live.desc', 'Get instant help')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                  {t('help.actions.live.button', 'Start Chat')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{t('help.actions.email.title', 'Email Support')}</CardTitle>
                <CardDescription>{t('help.actions.email.desc', 'For detailed questions')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full border-primary/20">
                  {t('help.actions.email.button', 'Send Email')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{t('help.actions.telegram.title', 'Telegram Channel')}</CardTitle>
                <CardDescription>{t('help.actions.telegram.desc', 'Latest announcements')}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full border-primary/20">
                  {t('help.actions.telegram.button', 'Join Channel')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">{t('help.categories.title', 'Help Categories')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <Card key={index} className="border-primary/20 shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`${category.color} p-3 rounded-full text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription className="text-sm">{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">{t('help.faq.title', 'Frequently Asked Questions')}</h2>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-primary/20 rounded-lg px-6">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('help.stats.hours.title', 'Working Hours')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">24/7</p>
                <p className="text-sm text-muted-foreground">{t('help.stats.hours.desc', 'We are at your service every day')}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('help.stats.response.title', 'Average Response')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">{t('help.stats.response.time', '30 seconds')}</p>
                <p className="text-sm text-muted-foreground">{t('help.stats.response.desc', 'Live support')}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('help.stats.users.title', 'Active Users')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">500K+</p>
                <p className="text-sm text-muted-foreground">{t('help.stats.users.desc', 'Trusted platform')}</p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20 shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{t('help.stats.security.title', 'Security')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">SSL</p>
                <p className="text-sm text-muted-foreground">{t('help.stats.security.desc', '256-bit encryption')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Still Need Help */}
          <div className="text-center">
            <Card className="border-primary/20 shadow-xl max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">{t('help.stillNeed.title', 'Still need help?')}</CardTitle>
                <CardDescription>
                  {t('help.stillNeed.desc', 'Our support team is ready to provide you with a custom solution.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-primary to-primary/80">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {t('help.stillNeed.live', 'Live Support')}
                  </Button>
                  <Button variant="outline" className="border-primary/20">
                    <Mail className="mr-2 h-4 w-4" />
                    {t('help.stillNeed.email', 'Send Email')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;