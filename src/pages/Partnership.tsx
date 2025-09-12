import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { useI18n } from '@/hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Handshake, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Award, 
  Calendar, 
  Mail,
  Phone,
  Globe,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Partnership = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Handshake className="w-16 h-16 text-orange-500 mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-white">{t('partnership.title.part1', 'Partnership')}</span>
              <span className="text-orange-500"> {t('partnership.title.part2', 'Program')}</span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            {t('partnership.subtitle', 'Partner with GuduBet and benefit from the most profitable program in the betting industry')}
          </p>
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg font-semibold text-orange-400">
              {t('partnership.commission.highlight', 'Achieve the highest earnings with commission rates up to 45%!')}
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-orange-900/50 to-gray-900 border-orange-500/30 text-center">
            <CardContent className="p-6">
              <DollarSign className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-orange-400 mb-2">{t('partnership.benefits.commission.title', '45% Commission')}</h3>
              <p className="text-gray-300 text-sm">
                {t('partnership.benefits.commission.desc', 'Highest commission rates in the industry')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-gray-900 border-green-500/30 text-center">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-400 mb-2">{t('partnership.benefits.payment.title', 'Weekly Payment')}</h3>
              <p className="text-gray-300 text-sm">
                {t('partnership.benefits.payment.desc', 'Receive your earnings once a week')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-gray-900 border-blue-500/30 text-center">
            <CardContent className="p-6">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-blue-400 mb-2">{t('partnership.benefits.reports.title', 'Detailed Reports')}</h3>
              <p className="text-gray-300 text-sm">
                {t('partnership.benefits.reports.desc', 'Real-time statistics')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-gray-900 border-purple-500/30 text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-purple-400 mb-2">{t('partnership.benefits.support.title', '24/7 Support')}</h3>
              <p className="text-gray-300 text-sm">
                {t('partnership.benefits.support.desc', 'Dedicated affiliate support team')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <TrendingUp className="w-8 h-8 mr-3" />
              {t('partnership.commission.title', 'Commission Structure')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-400 mb-2">25%</div>
                <div className="text-white font-semibold mb-2">{t('partnership.commission.starter.title', 'Starter Commission')}</div>
                <div className="text-gray-300 text-sm">{t('partnership.commission.starter.desc', '0-50 Active Players')}</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                <div className="text-3xl font-bold text-green-400 mb-2">35%</div>
                <div className="text-white font-semibold mb-2">{t('partnership.commission.mid.title', 'Mid Level')}</div>
                <div className="text-gray-300 text-sm">{t('partnership.commission.mid.desc', '51-200 Active Players')}</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-400 mb-2">45%</div>
                <div className="text-white font-semibold mb-2">{t('partnership.commission.vip.title', 'VIP Commission')}</div>
                <div className="text-gray-300 text-sm">{t('partnership.commission.vip.desc', '200+ Active Players')}</div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center mb-2">
                <Award className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-blue-400 font-semibold">{t('partnership.bonus.title', 'Special Bonuses')}</span>
              </div>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• {t('partnership.bonus.first10', '5% extra bonus for partners bringing first 10 players')}</li>
                <li>• {t('partnership.bonus.monthly', '10% extra commission for monthly earnings over €1000')}</li>
                <li>• {t('partnership.bonus.yearly', 'Annual performance bonus (up to 20% based on earnings)')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Tools */}
        <Card className="bg-gray-900 border-gray-700 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-500 text-2xl">
              <Target className="w-8 h-8 mr-3" />
              {t('partnership.marketing.title', 'Marketing Tools')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('partnership.marketing.creative.title', 'Creative Materials')}</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.creative.banners', 'Banner ads (various sizes)')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.creative.videos', 'Video ads')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.creative.emails', 'Email templates')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.creative.social', 'Social media content')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.creative.landing', 'Landing page templates')}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('partnership.marketing.technical.title', 'Technical Support')}</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.technical.api', 'API integration')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.technical.tracking', 'Tracking links')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.technical.reporting', 'Real-time reporting')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.technical.optimization', 'Conversion optimization')}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t('partnership.marketing.technical.dashboard', 'Customizable dashboard')}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Application Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Mail className="w-6 h-6 mr-3" />
                {t('partnership.contact.title', 'Contact Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">{t('partnership.contact.affiliate', 'Affiliate Manager')}</div>
                  <div className="text-gray-300">affiliates@gudubet.com</div>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">{t('partnership.contact.whatsapp', 'WhatsApp Support')}</div>
                  <div className="text-gray-300">+90 555 123 45 67</div>
                </div>
              </div>

              <div className="flex items-center">
                <Globe className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-semibold text-white">Telegram</div>
                  <div className="text-gray-300">@gudubet_affiliates</div>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              <div>
                <h4 className="font-semibold text-white mb-2">{t('partnership.contact.hours', 'Working Hours')}</h4>
                <p className="text-gray-300 text-sm">{t('partnership.contact.schedule', 'Monday - Sunday: 09:00 - 18:00 (GMT+3)')}</p>
                <p className="text-gray-300 text-sm">{t('partnership.contact.emergency', '24/7 WhatsApp support for emergencies')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-500">
                <Users className="w-6 h-6 mr-3" />
                {t('partnership.form.title', 'Partnership Application')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">{t('partnership.form.firstName', 'First Name')} *</Label>
                    <Input id="firstName" placeholder={t('partnership.form.firstNamePlaceholder', 'Your First Name')} className="mt-1" autoComplete="given-name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm">{t('partnership.form.lastName', 'Last Name')} *</Label>
                    <Input id="lastName" placeholder={t('partnership.form.lastNamePlaceholder', 'Your Last Name')} className="mt-1" autoComplete="family-name" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">{t('partnership.form.email', 'Email')} *</Label>
                  <Input id="email" type="email" placeholder={t('partnership.form.emailPlaceholder', 'example@email.com')} className="mt-1" autoComplete="email" />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm">{t('partnership.form.phone', 'Phone')} *</Label>
                  <Input id="phone" type="tel" placeholder="+90 555 123 45 67" className="mt-1" autoComplete="tel" />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm">{t('partnership.form.website', 'Website/Platform')}</Label>
                  <Input id="website" placeholder={t('partnership.form.websitePlaceholder', 'www.example.com')} className="mt-1" autoComplete="url" />
                </div>

                <div>
                  <Label htmlFor="traffic" className="text-sm">{t('partnership.form.traffic', 'Monthly Traffic')}</Label>
                  <Input id="traffic" placeholder={t('partnership.form.trafficPlaceholder', 'e.g: 10,000 visitors')} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-sm">{t('partnership.form.experience', 'Affiliate Experience')}</Label>
                  <Textarea 
                    id="experience" 
                    placeholder={t('partnership.form.experiencePlaceholder', 'Which platforms have you worked with before? Briefly describe your experience.')}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3">
                  {t('partnership.form.submit', 'Submit Application')}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  {t('partnership.form.review', 'Your application will be reviewed within 24-48 hours.')}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-500 text-2xl">
              {t('partnership.faq.title', 'Frequently Asked Questions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="text-white font-semibold mb-2">{t('partnership.faq.q1', 'Who can apply to the partnership program?')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('partnership.faq.a1', 'Anyone who is 18+ and can legally do business can apply. People with websites, blogs, social media accounts or email lists are preferred.')}
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">{t('partnership.faq.q2', 'When are payments made?')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('partnership.faq.a2', 'Payments are made every Tuesday. Minimum payment amount is €100. Earnings that do not exceed this amount are carried over to the next week.')}
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">{t('partnership.faq.q3', 'What marketing methods can I use?')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('partnership.faq.a3', 'You can use all marketing channels except illegal, spam or misleading marketing methods. Details are specified in the contract.')}
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">{t('partnership.faq.q4', 'How is commission calculated?')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('partnership.faq.a4', 'Commission is calculated based on the net loss (bet amount - winnings) of the players you bring. Your commission rate increases according to your number of active players.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Partnership;