import { AlertCircle, CheckCircle, Shield } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  strength: {
    score: number;
    level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
    label: string;
    feedback: string[];
    isSecure: boolean;
  };
  password: string;
}

export const PasswordStrengthIndicator = ({ strength, password }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;

  const getColorClass = () => {
    switch (strength.level) {
      case 'very-weak':
        return 'text-red-500 bg-red-500';
      case 'weak':
        return 'text-orange-500 bg-orange-500';
      case 'fair':
        return 'text-yellow-500 bg-yellow-500';
      case 'good':
        return 'text-blue-500 bg-blue-500';
      case 'strong':
        return 'text-green-500 bg-green-500';
      default:
        return 'text-gray-500 bg-gray-500';
    }
  };

  const colorClass = getColorClass();
  const [textColor, bgColor] = colorClass.split(' bg-');

  return (
    <div className="mt-2 space-y-2">
      {/* Güç Çubuğu */}
      <div className="flex items-center space-x-2">
        <Shield className={`w-4 h-4 ${textColor}`} />
        <span className="text-sm font-medium">Şifre Gücü:</span>
        <span className={`text-sm font-semibold ${textColor}`}>
          {strength.label}
        </span>
      </div>
      
      {/* Görsel Güç Göstergesi */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score 
                ? `bg-${bgColor}` 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Geri Bildirim */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((feedback, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0" />
              <span className="text-muted-foreground">{feedback}</span>
            </div>
          ))}
        </div>
      )}

      {/* Güvenlik Durumu */}
      {strength.isSecure && (
        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>Bu şifre güvenli kabul edilir</span>
        </div>
      )}

      {/* Güvenlik Uyarısı */}
      {!strength.isSecure && password.length >= 6 && (
        <div className="flex items-center space-x-2 text-xs text-orange-600 dark:text-orange-400">
          <AlertCircle className="w-3 h-3" />
          <span>Daha güvenli bir şifre için önerileri dikkate alın</span>
        </div>
      )}
    </div>
  );
};