import { useAuth, Role } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import {
  Building2, CalendarCheck, AlertTriangle, Clock, Loader2,
  QrCode, Users, Wrench, CheckCircle2, PlusCircle,
  Shield, BarChart3, ScanLine, ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

// ─── Role-specific welcome messages ───────────────────────────────────────────
const roleConfig: Record<Role, { greeting: string; subtitle: string; color: string }> = {
  ADMIN:      { greeting: "Admin Dashboard",      subtitle: "Full system overview and management controls.", color: "text-red-400" },
  MANAGER:    { greeting: "Manager Dashboard",    subtitle: "Monitor bookings, tickets and campus resources.",  color: "text-purple-400" },
  STUDENT:    { greeting: "Student Portal",       subtitle: "Book facilities and report maintenance issues.",   color: "text-green-400" },
  LECTURER:   { greeting: "Lecturer Portal",      subtitle: "Manage your bookings and campus requests.",       color: "text-blue-400" },
  TECHNICIAN: { greeting: "Technician Dashboard", subtitle: "View and resolve assigned maintenance tickets.",  color: "text-orange-400" },
};

// ─── Quick Action Card ─────────────────────────────────────────────────────────
function QuickAction({
  to, icon: Icon, label, description, color,
}: {
  to: string; icon: React.ElementType; label: string; description: string; color: string;
}) {
  return (
    <Link to={to}>
      <Card className="glass-card hover:scale-[1.02] transition-transform cursor-pointer group">
        <CardContent className="pt-5 pb-4 px-5 flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = (user?.role ?? "STUDENT") as Role;

  const isAdmin   = role === "ADMIN" || role === "MANAGER";
  const isTech    = role === "TECHNICIAN";
  const isStudent = role === "STUDENT" || role === "LECTURER";

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: facilities = [], isLoading: loadFacilities } = useQuery<any[]>({
    queryKey: ["facilities"],
    queryFn: () => api.get("/facilities"),
    enabled: !isTech,
  });

  const { data: bookings = [], isLoading: loadBookings } = useQuery<any[]>({
    queryKey: ["bookings", role],
    queryFn: () => api.get(isAdmin ? "/bookings/all" : "/bookings/my"),
    enabled: !isTech,
  });

  const { data: tickets = [], isLoading: loadTickets } = useQuery<any[]>({
    queryKey: ["tickets", role],
    queryFn: () => api.get(isAdmin || isTech ? "/tickets/all" : "/tickets/my"),
  });

  const isLoading = loadFacilities || loadBookings || loadTickets;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const config = roleConfig[role];

  // ─── Stats (role-specific) ────────────────────────────────────────────────
  const stats = isTech
    ? [
        { label: "Total Tickets",    value: tickets.length,                                                          icon: AlertTriangle, color: "text-orange-400" },
        { label: "Open Tickets",     value: tickets.filter((t) => t.status === "OPEN").length,                       icon: Clock,         color: "text-destructive" },
        { label: "In Progress",      value: tickets.filter((t) => t.status === "IN_PROGRESS").length,                icon: Wrench,        color: "text-warning" },
        { label: "Resolved Today",   value: tickets.filter((t) => t.status === "RESOLVED").length,                   icon: CheckCircle2,  color: "text-secondary" },
      ]
    : isAdmin
    ? [
        { label: "Active Facilities", value: facilities.filter((r) => r.status === "ACTIVE").length,                icon: Building2,     color: "text-secondary" },
        { label: "Pending Approvals", value: bookings.filter((b) => b.status === "PENDING").length,                  icon: Clock,         color: "text-warning" },
        { label: "Total Bookings",    value: bookings.length,                                                        icon: CalendarCheck, color: "text-info" },
        { label: "Open Tickets",      value: tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length, icon: AlertTriangle, color: "text-destructive" },
      ]
    : [
        { label: "My Bookings",       value: bookings.length,                                                        icon: CalendarCheck, color: "text-info" },
        { label: "Pending",           value: bookings.filter((b) => b.status === "PENDING").length,                  icon: Clock,         color: "text-warning" },
        { label: "Approved",          value: bookings.filter((b) => b.status === "APPROVED").length,                 icon: CheckCircle2,  color: "text-secondary" },
        { label: "My Tickets",        value: tickets.length,                                                         icon: AlertTriangle, color: "text-destructive" },
      ];

  // ─── Quick Actions (role-specific) ───────────────────────────────────────
  const quickActions = isTech
    ? [
        { to: "/tickets",  icon: AlertTriangle, label: "View Tickets",  description: "See open maintenance requests",    color: "bg-orange-500" },
        { to: "/check-in", icon: ScanLine,      label: "Facility Check-In", description: "Scan QR to verify bookings",   color: "bg-blue-500" },
      ]
    : isAdmin
    ? [
        { to: "/facilities", icon: Building2,    label: "Manage Facilities", description: "Add or edit campus resources", color: "bg-indigo-500" },
        { to: "/bookings",   icon: CalendarCheck, label: "Approve Bookings",  description: "Review pending requests",     color: "bg-green-500" },
        { to: "/analytics",  icon: BarChart3,     label: "View Analytics",    description: "Campus usage reports",        color: "bg-purple-500" },
        { to: "/check-in",   icon: ScanLine,      label: "Check-In",          description: "Verify facility access",      color: "bg-blue-500" },
      ]
    : [
        { to: "/bookings",   icon: PlusCircle,    label: "Book a Facility",   description: "Reserve labs, halls & rooms", color: "bg-green-500" },
        { to: "/tickets",    icon: AlertTriangle, label: "Report an Issue",   description: "Submit maintenance request",   color: "bg-orange-500" },
        { to: "/facilities", icon: Building2,     label: "Browse Facilities", description: "View available spaces",       color: "bg-indigo-500" },
      ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">
            Welcome back,{" "}
            <span className={config.color}>{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{config.subtitle}</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-muted/30">
          {role === "ADMIN" && <Shield className="w-3 h-3" />}
          {role}
        </span>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card">
            <CardContent className="pt-5 pb-4 px-5 flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-display font-bold mt-1">{s.value}</p>
              </div>
              <s.icon className={`w-5 h-5 mt-1 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <QuickAction key={a.to} {...a} />
          ))}
        </div>
      </div>

      {/* ── Recent activity (role-aware) ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bookings panel — hidden for TECHNICIAN */}
        {!isTech && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display">
                  {isAdmin ? "Recent Bookings" : "My Bookings"}
                </CardTitle>
                <Link to="/bookings" className="text-xs text-secondary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.facility?.name || `Resource #${b.facility?.id}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.startTime).toLocaleDateString()} ·{" "}
                      {new Date(b.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.status === "APPROVED" && (
                      <button
                        onClick={() => { setSelectedBooking(b); setQrOpen(true); }}
                        className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                  <Button variant="outline" size="sm" asChild className="mt-3">
                    <Link to="/bookings">Make a Booking</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* QR Dialog */}
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Booking QR Code</DialogTitle></DialogHeader>
            {selectedBooking && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={`${window.location.origin}/check-in?bookingId=${selectedBooking.id}`}
                    size={200}
                    level="M"
                  />
                </div>
                <div className="text-center text-sm space-y-1">
                  <p className="font-medium">{selectedBooking.facility?.name}</p>
                  <p className="text-muted-foreground">{new Date(selectedBooking.startTime).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Tickets panel */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">
                {isTech ? "Open Tickets" : isAdmin ? "Active Tickets" : "My Tickets"}
              </CardTitle>
              <Link to="/tickets" className="text-xs text-secondary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets
              .filter((t) => t.status !== "CLOSED" && t.status !== "RESOLVED")
              .slice(0, 4)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category?.replace(/_/g, " ")} · <span className="font-medium">{t.priority}</span>
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            {tickets.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No active tickets</p>
                {isStudent && (
                  <Button variant="outline" size="sm" asChild className="mt-3">
                    <Link to="/tickets">Report an Issue</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
