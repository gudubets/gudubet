import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "E-posta Gerekli",
        description: "Lütfen e-posta adresinizi giriniz.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Geçersiz E-posta",
        description: "Lütfen geçerli bir e-posta adresi giriniz.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast({
          title: "Hata",
          description: "Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.",
          variant: "destructive"
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: "E-posta Gönderildi!",
        description: "Şifre sıfırlama linkini e-posta adresinize gönderdik.",
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    onClose();
  };

  const handleBackToLogin = () => {
    setEmail('');
    setEmailSent(false);
    onBackToLogin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border border-border">
        <div className="relative">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 text-center">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-gaming font-bold text-foreground mb-2">
              Şifre Sıfırlama
            </h2>
            <p className="text-muted-foreground">
              {emailSent ? 'E-posta gönderildi' : 'E-posta adresinizi giriniz'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-posta Adresi</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Şifre sıfırlama linkini e-posta adresinize göndereceğiz.
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-success">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-semibold text-foreground mb-2">
                    E-posta Gönderildi!
                  </p>
                  <p className="text-muted-foreground">
                    <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik. 
                    E-posta kutunuzu kontrol edin ve spam klasörünü de kontrol etmeyi unutmayın.
                  </p>
                </div>
                
                <Button
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full"
                >
                  Giriş Sayfasına Dön
                </Button>
              </div>
            )}

            {!emailSent && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-sm text-primary hover:text-primary/80 underline transition-colors inline-flex items-center gap-1"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-3 h-3" />
                  Giriş sayfasına dön
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};