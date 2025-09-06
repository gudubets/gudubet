import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

interface FormData {
  email: string;
  password: string;
  captcha: string;
}

interface CaptchaData {
  question: string;
  answer: number;
  token: string;
}

const generateCaptcha = (): CaptchaData => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '*'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let answer: number;
  let question: string;
  
  switch (operation) {
    case '+':
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case '-':
      answer = Math.max(num1, num2) - Math.min(num1, num2);
      question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
      break;
    case '*':
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    default:
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
  }
  
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  return { question, answer, token };
};

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: LoginModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    captcha: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaData, setCaptchaData] = useState<CaptchaData>(generateCaptcha());
  const { toast } = useToast();

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const refreshCaptcha = () => {
    setCaptchaData(generateCaptcha());
    setFormData(prev => ({ ...prev, captcha: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

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

    if (!formData.captcha) {
      newErrors.captcha = 'Güvenlik doğrulaması zorunludur';
    } else if (parseInt(formData.captcha) !== captchaData.answer) {
      newErrors.captcha = 'Güvenlik doğrulaması yanlış';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const storeCaptchaToken = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes from now

      await supabase
        .from('captcha_tokens')
        .insert({
          user_email: formData.email.toLowerCase(),
          token: captchaData.token,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Error storing captcha token:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Store captcha token first
      await storeCaptchaToken();

      // Attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      if (error) {
        let errorMessage = 'Giriş yapılırken bir hata oluştu';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-posta veya şifre hatalı';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
        }

        toast({
          title: "Giriş Başarısız",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Refresh captcha on failed login
        refreshCaptcha();
        return;
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminData } = await supabase
          .from('admins')
          .select('role_type')
          .eq('email', data.user.email)
          .single();

        toast({
          title: "Giriş Başarılı!",
          description: adminData ? "Admin paneline yönlendiriliyorsunuz..." : "Hoş geldiniz!",
        });

        // Reset form
        setFormData({ email: '', password: '', captcha: '' });
        setErrors({});
        
        // Redirect admin to admin panel
        if (adminData) {
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1000);
        }
        
        onLoginSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Giriş Başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ email: '', password: '', captcha: '' });
    setErrors({});
    refreshCaptcha();
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "E-posta Gerekli",
        description: "Şifre sıfırlama için e-posta adresinizi giriniz.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: "Hata",
          description: "Şifre sıfırlama e-postası gönderilemedi.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "E-posta Gönderildi",
        description: "Şifre sıfırlama e-postasını kontrol ediniz.",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  };

  const isFormValid = formData.email && formData.password.length >= 8 && formData.captcha;

  // Reset captcha when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshCaptcha();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border border-border">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
              Giriş Yap
            </h2>
            <p className="text-muted-foreground">
              Hesabınıza giriş yapın
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
                placeholder="ornek@email.com"
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <Label htmlFor="captcha">Güvenlik Doğrulaması *</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="bg-muted border border-border rounded-md p-3 text-center font-mono text-lg mb-2">
                    {captchaData.question}
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    value={formData.captcha}
                    onChange={(e) => updateFormData('captcha', e.target.value)}
                    className={errors.captcha ? 'border-destructive' : ''}
                    placeholder="Sonucu giriniz"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={refreshCaptcha}
                  className="mt-8"
                  disabled={isLoading}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              {errors.captcha && <p className="text-sm text-destructive">{errors.captcha}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 underline transition-colors"
                disabled={isLoading}
              >
                Şifremi Unuttum
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};