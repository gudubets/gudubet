import { MessageCircle } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Ana Sayfa", path: "/" },
  { label: "Spor", path: "/spor" },
  { label: "Canlı", path: "/canli" },
  { label: "Casino", path: "/casino" },
  { label: "Canlı Casino", path: "/canli-casino" },
  { label: "Promosyonlar", path: "/promosyonlar" },
  { label: "Sürpriz", path: "/surpriz" },
  { label: "Oyun Meydanı", path: "/oyun-meydani", badge: "ÖZEL" },
  { label: "Daha Fazla", path: "/daha-fazla" },
];

export function BettingNavbar() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg font-bold text-lg">
              betboo
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
              Giriş Yap
            </Button>
            <Button variant="secondary" size="sm" className="bg-secondary hover:bg-secondary/90">
              Üye Ol
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
                  `nav-link px-4 py-3 text-sm font-medium whitespace-nowrap relative flex items-center gap-2 ${
                    isActive ? "active text-primary border-b-2 border-primary" : ""
                  }`
                }
              >
                {item.label}
                {item.badge && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}