import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useKYC } from '@/hooks/useKYC';
import { useI18n } from '@/hooks/useI18n';

interface KYCStatusBadgeProps {
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const KYCStatusBadge: React.FC<KYCStatusBadgeProps> = ({ 
  showIcon = true, 
  size = 'md',
  className = '' 
}) => {
  const { t } = useI18n();
  const { userKYCLevel, getKYCLevelName } = useKYC();

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'level_0': return 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-400';
      case 'level_1': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400';
      case 'level_2': return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400';
      case 'level_3': return 'bg-green-500/10 text-green-700 border-green-200 dark:text-green-400';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-400';
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'level_0': return <AlertTriangle className="h-3 w-3" />;
      case 'level_1': return <Clock className="h-3 w-3" />;
      case 'level_2': return <Shield className="h-3 w-3" />;
      case 'level_3': return <CheckCircle className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-base px-4 py-2';
      default: return 'text-sm px-3 py-1';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`
        ${getStatusColor(userKYCLevel)} 
        ${getSizeClass(size)} 
        ${className}
        flex items-center gap-1
      `}
    >
      {showIcon && getStatusIcon(userKYCLevel)}
      {getKYCLevelName(userKYCLevel)}
    </Badge>
  );
};

export default KYCStatusBadge;