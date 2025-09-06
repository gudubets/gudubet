import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Bell, User, Wallet, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Ana Sayfa", path: "/" },
  { label: "Spor", path: "/sports" },
  { label: "Canlı", path: "/live" },
  { label: "Casino", path: "/casino" },
  { label: "Canlı Casino", path: "/live-casino" },
  { label: "Promosyonlar", path: "/promotions" },
  { label: "Sürpriz", path: "/surprise" },
  { label: "Oyun Meydanı", path: "/games" },
  { label: "Daha Fazla", path: "/more" },
];

export function BettingNavbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Maç ara, bahis bul..."
                className="pl-10 bg-input border-border focus:border-primary"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Wallet className="h-4 w-4 mr-2" />
              ₺0.00
            </Button>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            
            <Button size="sm" className="bg-gradient-primary hover:opacity-90">
              <LogIn className="h-4 w-4 mr-2" />
              Giriş Yap
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-border">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    isActive ? "active" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}