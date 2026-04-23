import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  AlertTriangle,
  Bell,
  LogOut,
  GraduationCap,
  BarChart3,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/data/mockData";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Facilities", path: "/facilities", icon: Building2 },
  { label: "Bookings", path: "/bookings", icon: CalendarCheck },
  { label: "Tickets", path: "/tickets", icon: AlertTriangle },
  { label: "Notifications", path: "/notifications", icon: Bell, badge: true },
  { label: "Analytics", path: "/analytics", icon: BarChart3, adminOnly: true },
  { label: "Check-In", path: "/check-in", icon: ScanLine },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const unreadCount = notifications.filter(
    (n) => n.userId === user?.id && !n.read
  ).length;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-30 border-r border-sidebar-border">
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg campus-gradient flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold text-sidebar-foreground leading-tight">
            Smart Campus
          </h1>
          <span className="text-[11px] text-sidebar-muted">Operations Hub</span>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {navItems.filter((item) => !item.adminOnly || user?.role === "ADMIN").map((item) => {
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="flex-1">{item.label}</span>
              {item.badge && unreadCount > 0 && (
                <Badge className="bg-secondary text-secondary-foreground h-5 min-w-5 text-[11px] px-1.5 justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-sidebar-muted">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
