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
        newErrors.email = t('auth.email_required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('auth.email_invalid');
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

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
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
            postal_code: formData.postalCode
          }
        }
      });

      if (error) {
        let errorMessage = t('auth.registration_failed');
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Bu e-posta adresi ile zaten bir hesap mevcut';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = t('auth.password_min_length');
        } else if (error.message.includes('Invalid email')) {
          errorMessage = t('auth.email_invalid');
        }

        toast({
          title: t('auth.registration_failed'),
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: t('auth.registration_success'),
        description: t('auth.check_email'),
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
          {t('auth.personal_info')}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t('auth.create_account_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm">{t('auth.first_name')}</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
            
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm">{t('auth.last_name')}</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
            
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm">{t('auth.phone')}</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData('phone', e.target.value)}
          className={errors.phone ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
          
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-sm">{t('auth.birth_date')}</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => updateFormData('birthDate', e.target.value)}
          className={errors.birthDate ? 'border-destructive h-9 md:h-10' : 'h-9 md:h-10'}
        />
        {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
          {t('auth.account_info')}
        </h2>
        <p className="text-muted-foreground">
          {t('auth.account_info_desc')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email_address')} *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
            
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')} *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              
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
          <Label htmlFor="confirmPassword">{t('auth.confirm_password')} *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              
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
          <Label htmlFor="promoCode">{t('auth.promo_code')}</Label>
          <Input
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => updateFormData('promoCode', e.target.value)}
            
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
          {t('auth.address_info')}
        </h2>
        <p className="text-muted-foreground">
          {t('auth.address_info_desc')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">{t('auth.country')} *</Label>
            <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="turkey">{t('auth.country_turkey')}</SelectItem>
                <SelectItem value="usa">{t('auth.country_usa')}</SelectItem>
                <SelectItem value="germany">{t('auth.country_germany')}</SelectItem>
                <SelectItem value="france">{t('auth.country_france')}</SelectItem>
                <SelectItem value="uk">{t('auth.country_uk')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t('auth.city')} *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
              className={errors.city ? 'border-destructive' : ''}
              
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">{t('auth.address')} *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={errors.address ? 'border-destructive' : ''}
            
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">{t('auth.postal_code')} *</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => updateFormData('postalCode', e.target.value)}
            className={errors.postalCode ? 'border-destructive' : ''}
            
          />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl md:h-[600px] h-[95vh] max-h-[95vh] p-0 overflow-hidden bg-background border border-border w-[95vw] md:w-auto">
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
          <div className="md:w-1/2 w-full p-3 md:p-8 flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto">
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
                      {t('auth.saving')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                      {t('auth.complete_registration')}
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