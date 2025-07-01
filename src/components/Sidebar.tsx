
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Timer,
  Calendar,
  BarChart2,
  Settings,
  LogOut,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Get user's name from user metadata or use email as fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Task Templates",
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

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[250px]",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg text-primary"
          >
            To-Do Pro+
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("mr-2 h-5 w-5", collapsed && "mr-0")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-3 py-4">
        {!collapsed && user && (
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
          className={cn(
            "flex w-full items-center justify-start",
            collapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
};
