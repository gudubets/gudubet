import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PasswordSecurityAlertProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const PasswordSecurityAlert = ({ isVisible, onDismiss }: PasswordSecurityAlertProps) => {
  if (!isVisible) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-sm">
        <div className="space-y-3">
          <div>
            <strong className="text-orange-800 dark:text-orange-200">Güvenlik Uyarısı:</strong>
            <p className="mt-1 text-orange-700 dark:text-orange-300">
              Hesabınızın güvenliği için aşağıdaki önerileri dikkate alın:
            </p>
          </div>
          
          <ul className="space-y-1 text-orange-700 dark:text-orange-300 ml-4">
            <li>• Güçlü şifreler kullanın (en az 12 karakter)</li>
            <li>• Büyük harf, küçük harf, rakam ve özel karakter karışımı</li>
            <li>• Başka hesaplarda kullandığınız şifreleri tekrar kullanmayın</li>
            <li>• Kişisel bilgilerinizi (isim, doğum tarihi) şifrede kullanmayın</li>
          </ul>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="link"
              size="sm"
              className="text-orange-600 hover:text-orange-700 p-0 h-auto"
              onClick={() => window.open('https://auth.supabase.io', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Supabase Güvenlik Ayarları
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            >
              Anladım
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};