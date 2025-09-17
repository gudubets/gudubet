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
  ChevronRight,
  ChevronDown,
  Settings,
  CreditCard,
  Shield,
  AlertTriangle,
  FileText,
  Bell,
  UserCheck,
  TrendingUp,
  Database,
  List,
  Plus,
  BookOpen,
  Landmark,
  Star,
  Image,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set(['bonuses']));

  const toggleMenu = (menuKey: string) => {
    const newOpenMenus = new Set(openMenus);
    if (newOpenMenus.has(menuKey)) {
      newOpenMenus.delete(menuKey);
    } else {
      newOpenMenus.add(menuKey);
    }
    setOpenMenus(newOpenMenus);
  };

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
      title: 'Oyun Aktiviteleri',
      icon: Gamepad2,
      href: '/admin/game-sessions',
      active: location.pathname === '/admin/game-sessions'
    },
    {
      title: 'Oyun Sağlayıcıları',
      icon: Settings,
      href: '/admin/game-providers',
      active: location.pathname === '/admin/game-providers'
    },
    {
      title: 'Öne Çıkanlar',
      icon: Star,
      href: '/admin/featured-games',
      active: location.pathname === '/admin/featured-games'
    },
    {
      title: 'Site Resimleri',
      icon: Image,
      href: '/admin/site-images',
      active: location.pathname === '/admin/site-images'
    },
    {
      title: 'Canlı Chat',
      icon: MessageCircle,
      href: '/admin/chat',
      active: location.pathname === '/admin/chat'
    }
  ];

  const menuItemsWithSub = [
    {
      key: 'bonuses',
      title: 'Bonuslar',
      icon: Gift,
      active: location.pathname.startsWith('/admin/bonuses'),
      subItems: [
        {
          title: 'Bonus Listesi',
          icon: List,
          href: '/admin/bonuses/list',
          active: location.pathname === '/admin/bonuses/list'
        },
        {
          title: 'Bonus Oluştur',
          icon: Plus,
          href: '/admin/bonuses/create',
          active: location.pathname === '/admin/bonuses/create'
        },
        {
          title: 'Bonus Kuralları',
          icon: BookOpen,
          href: '/admin/bonuses/rules',
          active: location.pathname.includes('/admin/bonuses') && location.pathname.includes('/rules')
        },
        {
          title: 'Bonus Talepleri',
          icon: Users,
          href: '/admin/bonuses/requests',
          active: location.pathname === '/admin/bonuses/requests'
        }
      ]
    }
  ];

  const bottomMenuItems = [
    {
      title: 'Finans İşlemleri',
      icon: DollarSign,
      href: '/admin/finance',
      active: location.pathname === '/admin/finance'
    },
    {
      title: 'Banka Hesapları',
      icon: Landmark,
      href: '/admin/bank-accounts',
      active: location.pathname === '/admin/bank-accounts'
    },
    {
      title: 'Para Çekme',
      icon: CreditCard,
      href: '/admin/withdrawals',
      active: location.pathname === '/admin/withdrawals'
    },
    {
      title: 'Bakiye Yönetimi',
      icon: Database,
      href: '/admin/balance',
      active: location.pathname === '/admin/balance'
    },
    {
      title: 'Risk Yönetimi',
      icon: Shield,
      href: '/admin/fraud-detection',
      active: location.pathname === '/admin/fraud-detection'
    },
    {
      title: 'Risk Kuyruğu',
      icon: AlertTriangle,
      href: '/admin/risk-queue',
      active: location.pathname === '/admin/risk-queue'
    },
    {
      title: 'Raporlar',
      icon: FileText,
      href: '/admin/reports',
      active: location.pathname === '/admin/reports'
    },
    {
      title: 'Analitik',
      icon: TrendingUp,
      href: '/admin/analytics',
      active: location.pathname === '/admin/analytics'
    },
    {
      title: 'CRM',
      icon: UserCheck,
      href: '/admin/crm',
      active: location.pathname === '/admin/crm'
    },
    {
      title: 'Bildirimler',
      icon: Bell,
      href: '/admin/notifications',
      active: location.pathname === '/admin/notifications'
    },
    {
      title: 'Rakip Analizi',
      icon: Target,
      href: '/admin/competitor-analysis',
      active: location.pathname === '/admin/competitor-analysis'
    },
    {
      title: 'Admin Yönetimi',
      icon: Settings,
      href: '/admin/management',
      active: location.pathname === '/admin/management'
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
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {/* Normal Menu Items */}
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

        {/* Menu Items with Sub-items */}
        {menuItemsWithSub.map((menuGroup) => {
          const Icon = menuGroup.icon;
          const isOpen = openMenus.has(menuGroup.key);
          
          return (
            <Collapsible
              key={menuGroup.key}
              open={isOpen}
              onOpenChange={() => toggleMenu(menuGroup.key)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    menuGroup.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    isCollapsed ? "justify-center" : "justify-between"
                  )}
                >
                  <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
                    <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>{menuGroup.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isOpen ? "transform rotate-180" : ""
                      )} 
                    />
                  )}
                </button>
              </CollapsibleTrigger>
              
              {!isCollapsed && (
                <CollapsibleContent className="space-y-1">
                  {menuGroup.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        className={cn(
                          "flex items-center px-6 py-2 ml-4 rounded-md text-sm transition-colors",
                          subItem.active
                            ? "bg-primary/10 text-primary border-l-2 border-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <SubIcon className="w-3 h-3 mr-3" />
                        <span>{subItem.title}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              )}
            </Collapsible>
          );
        })}

        {/* Bottom Menu Items */}
        {bottomMenuItems.map((item) => {
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