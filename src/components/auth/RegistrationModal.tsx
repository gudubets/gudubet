import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1 - Personal Info
  firstName: string;
  lastName: string;
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
  const { toast } = useToast();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Ad zorunludur';
      if (!formData.lastName.trim()) newErrors.lastName = 'Soyad zorunludur';
      if (!formData.birthDate) {
        newErrors.birthDate = 'Doğum tarihi zorunludur';
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          newErrors.birthDate = '18 yaşından büyük olmalısınız';
        }
      }
    }

    if (step === 2) {
      if (!formData.email.trim()) {
        newErrors.email = 'E-posta zorunludur';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi giriniz';
      }
      
      if (!formData.password) {
        newErrors.password = 'Şifre zorunludur';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Şifre en az 8 karakter olmalıdır';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifre tekrarı zorunludur';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      }
    }

    if (step === 3) {
      if (!formData.country.trim()) newErrors.country = 'Ülke zorunludur';
      if (!formData.city.trim()) newErrors.city = 'Şehir zorunludur';
      if (!formData.address.trim()) newErrors.address = 'Adres zorunludur';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Posta kodu zorunludur';
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

  const handleSubmit = () => {
    if (validateStep(3)) {
      // Here you would normally submit to your backend
      toast({
        title: "Kayıt Başarılı!",
        description: "Hesabınız başarıyla oluşturuldu.",
      });
      onClose();
      setCurrentStep(1);
      setFormData(initialFormData);
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
          Kişisel Bilgiler
        </h2>
        <p className="text-muted-foreground">
          Hesabınızı oluşturmak için kişisel bilgilerinizi giriniz
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={errors.firstName ? 'border-destructive' : ''}
            placeholder="Adınız"
          />
          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={errors.lastName ? 'border-destructive' : ''}
            placeholder="Soyadınız"
          />
          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Doğum Tarihi *</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => updateFormData('birthDate', e.target.value)}
          className={errors.birthDate ? 'border-destructive' : ''}
        />
        {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
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
          Giriş yapacağınız hesap bilgilerinizi oluşturunuz
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta Adresi *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
            placeholder="ornek@email.com"
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
              placeholder="En az 8 karakter"
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
              placeholder="Şifrenizi tekrar giriniz"
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
          <Label htmlFor="promoCode">Promosyon Kodu (Opsiyonel)</Label>
          <Input
            id="promoCode"
            value={formData.promoCode}
            onChange={(e) => updateFormData('promoCode', e.target.value)}
            placeholder="Promosyon kodunuz varsa giriniz"
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
          İkamet adres bilgilerinizi giriniz
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Ülke *</Label>
            <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
              <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                <SelectValue placeholder="Ülke seçiniz" />
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
              placeholder="Şehir"
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
            placeholder="Mahalle, Sokak, Bina No"
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
            placeholder="34000"
          />
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0 overflow-hidden bg-background border border-border">
        <div className="flex h-full">
          {/* Left Side - Animation Area */}
          <div className="w-1/2 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center space-y-6 z-10">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-float">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-gaming font-bold text-foreground mb-2">
                    SportsBet Pro'ya Hoş Geldiniz!
                  </h3>
                  <p className="text-muted-foreground">
                    En iyi bahis deneyimi için hesabınızı oluşturun
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

          {/* Right Side - Form */}
          <div className="w-1/2 p-8 flex flex-col">
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
            <div className="flex justify-between pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Geri
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  className="gap-2"
                >
                  İleri
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="gap-2 bg-accent hover:bg-accent/90"
                >
                  <CheckCircle className="w-4 h-4" />
                  Kaydı Tamamla
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};