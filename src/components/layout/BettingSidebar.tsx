import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Trophy,
  Play,
  Dice1,
  Video,
  Gift,
  Gamepad2,
  HelpCircle,
  Phone,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: Trophy, label: "Spor Bahisleri", path: "/sports" },
  { icon: Play, label: "Canlı Spor", path: "/live-sports" },
  { icon: Dice1, label: "Casino", path: "/casino" },
  { icon: Video, label: "Canlı Casino", path: "/live-casino" },
  { icon: Gift, label: "Promosyonlar", path: "/promotions" },
  { icon: Gamepad2, label: "Şanslı Çark", path: "/lucky-wheel" },
  { icon: HelpCircle, label: "SSS", path: "/faq" },
  { icon: Phone, label: "İletişim", path: "/contact" },
];

export function BettingSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-sidebar border border-border"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">GuduBets</h1>
            <p className="text-xs text-muted-foreground">Güvenilir Bahis</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? "active" : ""}`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>7/24 Canlı Destek</p>
              <p className="text-primary">+90 (212) 123-4567</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}