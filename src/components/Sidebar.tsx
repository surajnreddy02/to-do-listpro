
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  FileText,
  Menu,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Templates",
      icon: FileText,
      path: "/templates",
    },
    {
      title: "Focus Mode",
      icon: Timer,
      path: "/focus",
    },
    {
      title: "Calendar",
      icon: Calendar,
      path: "/calendar",
    },
    {
      title: "Analytics",
      icon: BarChart2,
      path: "/analytics",
    },
    {
      title: "Profile",
      icon: Settings,
      path: "/profile",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-center px-4">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-1 text-center hover:scale-105 transition-transform duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-yellow-600 bg-clip-text text-transparent">
                To-Do Pro<span className="text-primary">+</span>
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground/70 font-normal">
            by Nani
          </span>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="mr-2 h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-3 py-4">
        {user && (
          <div className="mb-4 flex items-center gap-3 overflow-hidden rounded-lg bg-accent p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-medium">
                {userInitial}
              </span>
            </div>
            <div className="truncate">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="flex w-full items-center justify-start"
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "flex h-screen w-[250px] flex-col border-r bg-background",
        className
      )}
    >
      <SidebarContent />
    </div>
  );
};
