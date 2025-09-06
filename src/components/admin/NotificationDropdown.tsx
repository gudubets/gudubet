import React, { useState } from 'react';
import { Bell, Clock, User, DollarSign, Gift, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const getActivityIcon = (actionType: string) => {
  switch (actionType) {
    case 'user_created':
    case 'user_updated':
      return <User className="w-4 h-4 text-blue-600" />;
    case 'transaction_approved':
    case 'transaction_rejected':
      return <DollarSign className="w-4 h-4 text-green-600" />;
    case 'bonus_created':
      return <Gift className="w-4 h-4 text-purple-600" />;
    case 'admin_created':
    case 'permission_updated':
      return <Shield className="w-4 h-4 text-orange-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityColor = (actionType: string): string => {
  switch (actionType) {
    case 'user_created':
    case 'user_updated':
      return 'bg-blue-50 border-blue-200';
    case 'transaction_approved':
      return 'bg-green-50 border-green-200';
    case 'transaction_rejected':
      return 'bg-red-50 border-red-200';
    case 'bonus_created':
      return 'bg-purple-50 border-purple-200';
    case 'admin_created':
    case 'permission_updated':
      return 'bg-orange-50 border-orange-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const NotificationDropdown = () => {
  const { activities, unreadCount, isLoading, markAsRead, formatActivity } = useAdminNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Mark as read when dropdown opens
      setTimeout(() => {
        markAsRead();
      }, 1000);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96">
        <div className="p-3 border-b">
          <DropdownMenuLabel className="flex items-center justify-between p-0">
            <span>Admin Bildirimleri</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} yeni
              </Badge>
            )}
          </DropdownMenuLabel>
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              Bildirimler yükleniyor...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Henüz bildirim yok
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {activities.map((activity) => {
                const isUnread = new Date(activity.created_at) > new Date(localStorage.getItem('admin_notifications_last_viewed') || '');
                
                return (
                  <div
                    key={activity.id}
                    className={`
                      p-3 rounded-lg border transition-all duration-200 hover:shadow-sm
                      ${isUnread ? 'bg-blue-50 border-blue-200' : getActivityColor(activity.action_type)}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.action_type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {formatActivity(activity)}
                        </p>
                        
                        {activity.metadata && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(activity.metadata)}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </p>
                      </div>
                      
                      {isUnread && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {activities.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full text-sm" 
                onClick={() => {
                  // Tüm bildirimleri görüntüle sayfasına git
                  window.location.href = '/admin/notifications';
                }}
              >
                Tüm bildirimleri görüntüle
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};