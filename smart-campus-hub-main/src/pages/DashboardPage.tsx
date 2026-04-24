import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { Building2, CalendarCheck, AlertTriangle, Clock, Loader2, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isTech = user?.role === "TECHNICIAN";
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const { data: facilities = [], isLoading: isLoadingFacilities } = useQuery<any[]>({
    queryKey: ["facilities"],
    queryFn: () => api.get("/facilities"),
  });

  const { data: bookings = [], isLoading: isLoadingBookings } = useQuery<any[]>({
    queryKey: ["bookings", isAdmin],
    queryFn: () => api.get(isAdmin ? "/bookings/all" : "/bookings/my"),
  });

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<any[]>({
    queryKey: ["tickets", isAdmin, isTech],
    queryFn: () => api.get(isAdmin || isTech ? "/tickets/all" : "/tickets/my"),
  });

  if (isLoadingFacilities || isLoadingBookings || isLoadingTickets) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Active Resources", value: facilities.filter((r) => r.status === "ACTIVE").length, icon: Building2, color: "text-secondary" },
    { label: "Pending Bookings", value: bookings.filter((b) => b.status === "PENDING").length, icon: Clock, color: "text-warning" },
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck, color: "text-info" },
    { label: "Open Tickets", value: tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening on campus today.</p>
      </div>

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

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">Recent Bookings</CardTitle>
              <Link to="/bookings" className="text-xs text-secondary hover:underline">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{b.facility?.name || `Resource #${b.facility?.id}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.startTime).toLocaleDateString()} · {new Date(b.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
            {bookings.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet</p>}
          </CardContent>
        </Card>

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
                  <p className="font-medium">{selectedBooking.facility?.name || `Resource #${selectedBooking.facility?.id}`}</p>
                  <p className="text-muted-foreground">{new Date(selectedBooking.startTime).toLocaleString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display">Active Tickets</CardTitle>
              <Link to="/tickets" className="text-xs text-secondary hover:underline">View all →</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.filter((t) => t.status !== "CLOSED" && t.status !== "RESOLVED").slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.category.replace(/_/g, " ")} · {t.priority}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {tickets.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No active tickets</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

