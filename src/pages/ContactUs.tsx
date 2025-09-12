import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import { useI18n } from '@/hooks/useI18n';

const ContactUs = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="bg-gradient-to-br from-background to-background/50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            {t('contact.title', 'Contact Us')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle', 'As the GuduBet team, we are happy to help you. Contact us for your questions.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('contact.email.title', 'Email')}</CardTitle>
                    <CardDescription>{t('contact.email.subtitle', '24/7 support line')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-primary font-semibold">support@gudubet.com</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('contact.email.response', 'We usually respond within 2 hours')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('contact.live.title', 'Live Support')}</CardTitle>
                    <CardDescription>{t('contact.live.subtitle', 'Get instant help')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  {t('contact.live.button', 'Start Live Support')}
                </Button>
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {t('contact.live.response', 'Average response time: 30 seconds')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{t('contact.hours.title', 'Working Hours')}</CardTitle>
                    <CardDescription>{t('contact.hours.subtitle', 'Our support hours')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('contact.hours.days', 'Monday - Sunday')}</span>
                    <span className="text-primary font-semibold">24/7</span>
                  </div>
                  <p className="text-muted-foreground">
                    {t('contact.hours.available', 'We are always here!')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">{t('contact.form.title', 'Send Message')}</CardTitle>
                <CardDescription>
                  {t('contact.form.subtitle', 'Fill out the form for your detailed questions, we will get back to you as soon as possible.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('contact.form.firstName', 'First Name')} *</Label>
                    <Input id="firstName" placeholder={t('contact.form.firstNamePlaceholder', 'Your first name')} className="border-primary/20" autoComplete="given-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('contact.form.lastName', 'Last Name')} *</Label>
                    <Input id="lastName" placeholder={t('contact.form.lastNamePlaceholder', 'Your last name')} className="border-primary/20" autoComplete="family-name" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.form.email', 'Email')} *</Label>
                  <Input id="email" type="email" placeholder="email@example.com" className="border-primary/20" autoComplete="email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.form.subject', 'Subject')} *</Label>
                  <Input id="subject" placeholder={t('contact.form.subjectPlaceholder', 'Subject of your message')} className="border-primary/20" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.form.message', 'Message')} *</Label>
                  <Textarea 
                    id="message" 
                    placeholder={t('contact.form.messagePlaceholder', 'Write your message here...')} 
                    rows={6}
                    className="border-primary/20 resize-none"
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-3">
                  {t('contact.form.submit', 'Send Message')}
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  {t('contact.form.required', '* Required fields. Your personal data is kept secure.')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('contact.info.license.title', 'License Information')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('contact.info.license.desc', 'We provide safe services with Curaçao eGaming license. License No: #153142')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('contact.info.technical.title', 'Technical Support')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('contact.info.technical.desc', 'Contact our dedicated support team for game and technical issues.')}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/20 shadow-lg">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>{t('contact.info.feedback.title', 'Complaints & Suggestions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('contact.info.feedback.desc', 'Your opinions and suggestions are valuable to us. Please share them.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;