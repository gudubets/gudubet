import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Target, 
  Gamepad2, 
  Gift, 
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: BarChart3,
      href: '/admin',
      active: location.pathname === '/admin'
    },
    {
      title: 'Kullanıcılar',
      icon: Users,
      href: '/admin/users',
      active: location.pathname === '/admin/users'
    },
    {
      title: 'Bahisler',
      icon: Target,
      href: '/admin/bets',
      active: location.pathname === '/admin/bets'
    },
    {
      title: 'Casino Oyunları',
      icon: Gamepad2,
      href: '/admin/games',
      active: location.pathname === '/admin/games'
    },
    {
      title: 'Bonuslar',
      icon: Gift,
      href: '/admin/bonuses',
      active: location.pathname === '/admin/bonuses'
    },
    {
      title: 'Finans İşlemleri',
      icon: DollarSign,
      href: '/admin/finance',
      active: location.pathname === '/admin/finance'
    }
  ];

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-gaming font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-gaming font-bold gradient-text-primary">
              Admin Panel
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            Admin Panel v1.0
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;