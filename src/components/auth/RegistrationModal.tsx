import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { supabase } from '@/integrations/supabase/client';
import { usePasswordSecurity } from '@/hooks/usePasswordSecurity';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1 - Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  
  // Step 2 - Account Info
  email: string;
  password: string;
  confirmPassword: string;
  promoCode: string;
  
  // Step 3 - Address Info
  country: string;
  city: string;
  address: string;
  postalCode: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  email: '',
  password: '',
  confirmPassword: '',
  promoCode: '',
  country: '',
  city: '',
  address: '',
  postalCode: ''
};

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useI18n();
  const { passwordStrength, updatePasswordStrength } = usePasswordSecurity();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Şifre değiştiğinde güvenlik kontrolü yap
    if (field === 'password') {
      updatePasswordStrength(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = t('auth.name_required');
      if (!formData.lastName.trim()) newErrors.lastName = t('auth.surname_required');
      if (!formData.phone.trim()) {
        newErrors.phone = t('auth.phone_required');
      } else if (!/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = t('auth.phone_invalid');
      }
      if (!formData.birthDate) {
        newErrors.birthDate = t('auth.birth_date_required');
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          newErrors.birthDate = t('auth.age_restriction');
        }
      }
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = "E-mail adresi zorunludur";
      } else {
        // Çok sıkı email validation - sadece ASCII karakterler
        const email = formData.email.trim().toLowerCase();
        
        // ASCII olmayan karakterleri kontrol et
        const hasNonASCII = /[^\x00-\x7F]/.test(email);
        if (hasNonASCII) {
          newErrors.email = "E-mail adresinde Türkçe veya özel karakter kullanılamaz";
        } else {
          // Standard email regex
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(email)) {
            newErrors.email = "Geçerli bir e-mail adresi formatı giriniz (örn: ornek@gmail.com)";
          }
        }
      }
      
      if (!formData.password) {
        newErrors.password = t('auth.password_required');
      } else if (formData.password.length < 8) {
        newErrors.password = t('auth.password_min_length');
      } else if (!passwordStrength.isSecure) {
        newErrors.password = 'Şifre yeterince güçlü değil. Lütfen daha güvenli bir şifre seçin.';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = t('auth.password_required');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('auth.passwords_not_match');
      }
    }

    if (step === 3) {
      if (!formData.country.trim()) newErrors.country = t('auth.country_required');
      if (!formData.city.trim()) newErrors.city = t('auth.city_required');
      if (!formData.address.trim()) newErrors.address = t('auth.address_required');
      if (!formData.postalCode.trim()) newErrors.postalCode = t('auth.postal_code_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google Kaydı Başarısız",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Google signup error:', error);
      toast({
        title: "Google Kaydı Başarısız", 
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get client IP address
  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔍 Registration Debug Info:');
      console.log('📧 Email:', formData.email);
      console.log('🔤 Email length:', formData.email.length);
      console.log('🌐 Email chars:', Array.from(formData.email).map(char => ({ char, code: char.charCodeAt(0) })));
      
      // Get client IP address
      const clientIP = await getClientIP();
      console.log('🌐 Client IP:', clientIP);
      
      // Clean email - remove any invisible characters
      const cleanEmail = formData.email.trim().toLowerCase().replace(/[^\x00-\x7F]/g, "");
      console.log('🧹 Cleaned email:', cleanEmail);
      
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            birth_date: formData.birthDate,
            country: formData.country,
            city: formData.city,
            address: formData.address,
            postal_code: formData.postalCode,
            registration_ip: clientIP
          }
        }
      });

      console.log('📤 Supabase Response:', { data, error });

      if (error) {
        console.error('❌ Registration Error:', error);
        let errorMessage = "Kayıt işlemi başarısız oldu";
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Bu e-posta adresi ile zaten bir hesap mevcut';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Şifre en az 8 karakter olmalıdır';
        } else if (error.message.includes('Invalid email') || error.message.includes('invalid format')) {
          errorMessage = `E-mail adresi geçersiz format. Girilen email: "${formData.email}" - Temizlenmiş: "${cleanEmail}"`;
        } else if (error.message.includes('Unable to validate email')) {
          errorMessage = `E-mail adresi doğrulanamadı: "${formData.email}" - Hata: ${error.message}`;
        } else {
          errorMessage = `Beklenmeyen hata: ${error.message}`;
        }

        toast({
          title: "Kayıt Başarısız",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Kayıt Başarılı!",
        description: "Hesabınız başarıyla oluşturuldu. E-posta adresinizi kontrol ediniz.",
      });
      
      onClose();
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Kayıt Başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
  };

  const renderStep1 = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-lg md:text-2xl font-gaming font-bold text-foreground mb-2">
          Kişisel Bilgiler
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Hesabınızı oluşturmak için gerekli bilgileri giriniz
        </p>
      </div>

      {/* Google Signup Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full mb-4"
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Google ile Kayıt Ol
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            veya manuel olarak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm">Ad</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
            autoComplete="given-name"
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm">Soyad</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
            autoComplete="family-name"
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm">Telefon</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className={errors.phone ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
          autoComplete="tel"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-sm">Doğum Tarihi</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => updateFormData('birthDate', e.target.value)}
          className={errors.birthDate ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
          autoComplete="bday"
        />
        {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
          Hesap Bilgileri
        </h2>
        <p className="text-muted-foreground">
          Giriş yapabilmeniz için e-mail ve şifre bilgilerinizi giriniz
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail Adresi * <span className="text-xs text-muted-foreground">(Türkçe karakter kullanmayınız)</span></Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          <PasswordStrengthIndicator 
            strength={passwordStrength} 
            password={formData.password} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Şifre Tekrarı *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="promoCode" className="text-base font-medium">Promosyon Kodu (Opsiyonel)</Label>
          <Input
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => updateFormData('promoCode', e.target.value)}
            className="h-12 text-lg px-4"
            placeholder="Promosyon kodunuzu giriniz"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
          Adres Bilgileri
        </h2>
        <p className="text-muted-foreground">
          İkamet adresinizi giriniz
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Ülke *</Label>
            <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="turkey">Türkiye</SelectItem>
                <SelectItem value="usa">Amerika Birleşik Devletleri</SelectItem>
                <SelectItem value="germany">Almanya</SelectItem>
                <SelectItem value="france">Fransa</SelectItem>
                <SelectItem value="uk">Birleşik Krallık</SelectItem>
              </SelectContent>
            </Select>
            {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Şehir *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className={errors.city ? 'border-destructive' : ''}
              autoComplete="address-level2"
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adres *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={errors.address ? 'border-destructive' : ''}
            autoComplete="street-address"
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Posta Kodu *</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => updateFormData('postalCode', e.target.value)}
            className={errors.postalCode ? 'border-destructive' : ''}
            autoComplete="postal-code"
          />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl md:h-[800px] h-[95vh] max-h-[95vh] p-0 overflow-hidden bg-background border border-border w-[95vw] md:w-auto">
        <div className="flex h-full md:flex-row flex-col">
          {/* Left Side - Animation Area - Hidden on mobile */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center space-y-6 z-10">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-float">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-gaming font-bold text-foreground mb-2">
                    {currentLanguage === 'tr' 
                      ? <>Gudu<span className="text-accent">bet</span>'ya Hoş Geldiniz!</>
                      : <>Welcome to Gudu<span className="text-accent">bet</span>!</>
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {t('auth.welcome_desc')}
                  </p>
                </div>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        step <= currentStep 
                          ? 'bg-primary' 
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header - Only visible on mobile */}
          <div className="md:hidden bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center border-b">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {t('auth.create_account_mobile')}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t('auth.create_account_mobile_desc')}
            </p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 w-full p-3 md:p-8 flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto pb-4">
              <div 
                className={`transition-all duration-500 ease-in-out transform ${
                  currentStep === 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute'
                }`}
              >
                {currentStep === 1 && renderStep1()}
              </div>
              
              <div 
                className={`transition-all duration-500 ease-in-out transform ${
                  currentStep === 2 ? 'translate-x-0 opacity-100' : currentStep < 2 ? 'translate-x-full opacity-0 absolute' : '-translate-x-full opacity-0 absolute'
                }`}
              >
                {currentStep === 2 && renderStep2()}
              </div>
              
              <div 
                className={`transition-all duration-500 ease-in-out transform ${
                  currentStep === 3 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'
                }`}
              >
                {currentStep === 3 && renderStep3()}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 md:pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2 text-xs md:text-sm px-3 md:px-4"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                {t('auth.back')}
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="gap-2 text-xs md:text-sm px-3 md:px-4"
                >
                  {t('auth.next')}
                  <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="gap-2 bg-accent hover:bg-accent/90 text-xs md:text-sm px-3 md:px-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                      Kayıt Ol
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};