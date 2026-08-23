import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth, Role } from "@/contexts/AuthContext";
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
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { notifications } from "@/data/mockData";

// Role-based access per nav item
// If 'roles' is undefined → all authenticated users can access
const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: undefined, // all roles
  },
  {
    label: "Facilities",
    path: "/facilities",
    icon: Building2,
    roles: ["ADMIN", "MANAGER", "STUDENT", "LECTURER"] as Role[],
  },
  {
    label: "Bookings",
    path: "/bookings",
    icon: CalendarCheck,
    roles: ["ADMIN", "MANAGER", "STUDENT", "LECTURER"] as Role[],
  },
  {
    label: "Tickets",
    path: "/tickets",
    icon: AlertTriangle,
    roles: undefined, // all roles
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    badge: true,
    roles: undefined, // all roles
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER"] as Role[],
  },
  {
    label: "Check-In",
    path: "/check-in",
    icon: ScanLine,
    roles: ["ADMIN", "MANAGER", "TECHNICIAN"] as Role[],
  },
  {
    label: "Users",
    path: "/users",
    icon: Users,
    roles: ["ADMIN"] as Role[],
  },
];

// Role badge colors
const roleBadgeStyle: Record<Role, string> = {
  ADMIN:      "bg-red-500/20 text-red-400 border-red-500/30",
  MANAGER:    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  LECTURER:   "bg-blue-500/20 text-blue-400 border-blue-500/30",
  STUDENT:    "bg-green-500/20 text-green-400 border-green-500/30",
  TECHNICIAN: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function AppSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userRole = user?.role as Role | undefined;

  // Filter nav items based on user's role
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true; // visible to all
    return userRole ? item.roles.includes(userRole) : false;
  });

  const unreadCount = notifications.filter(
    (n) => n.userId === user?.id && !n.read
  ).length;

  // Redirect to an allowed page if current route is not accessible
  useEffect(() => {
    if (!userRole) return;
    const currentItem = navItems.find((item) =>
      item.path === "/" ? pathname === "/" : pathname.startsWith(item.path)
    );
    if (currentItem && currentItem.roles && !currentItem.roles.includes(userRole)) {
      navigate("/", { replace: true });
    }
  }, [pathname, userRole, navigate]);

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
        {visibleNavItems.map((item) => {
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

      {/* User info + role badge */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-accent-foreground">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            {userRole && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border mt-0.5",
                  roleBadgeStyle[userRole]
                )}
              >
                {userRole === "ADMIN" && <Shield className="w-2.5 h-2.5" />}
                {userRole}
              </span>
            )}
          </div>
          <button
            onClick={logout}
            className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
