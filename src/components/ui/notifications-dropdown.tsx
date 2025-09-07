import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, CheckCheck, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  is_read: boolean;
  read_at?: string;
  user_notification_id: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (userNotificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationsDropdown = ({ 
  notifications, 
  unreadCount, 
  loading,
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationsDropdownProps) => {

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: tr 
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-white/10 p-2 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-background border shadow-lg" align="end">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0">
            Bildirimler {unreadCount > 0 && `(${unreadCount})`}
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="h-6 text-xs"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />

        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm">Bildirimler yükleniyor...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Henüz bildiriminiz yok</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className="p-3 cursor-pointer hover:bg-accent focus:bg-accent border-b last:border-b-0"
                onClick={() => !notification.is_read && onMarkAsRead(notification.user_notification_id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium truncate ${
                        notification.is_read ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className={`text-xs mt-1 line-clamp-2 ${
                      notification.is_read ? 'text-muted-foreground' : 'text-foreground/80'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      
                      {notification.is_read && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Check className="w-3 h-3" />
                          <span>Okundu</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;