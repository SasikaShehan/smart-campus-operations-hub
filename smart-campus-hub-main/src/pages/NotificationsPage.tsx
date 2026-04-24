import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, CalendarCheck, AlertTriangle, MessageCircle, Info, CheckCheck, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const typeIcons: Record<string, React.ReactNode> = {
  BOOKING: <CalendarCheck className="w-4 h-4" />,
  TICKET: <AlertTriangle className="w-4 h-4" />,
  COMMENT: <MessageCircle className="w-4 h-4" />,
  SYSTEM: <Info className="w-4 h-4" />,
};

const PREF_LABELS: Record<string, { label: string; description: string }> = {
  BOOKING: { label: "Bookings", description: "Approval, rejection, and cancellation updates" },
  TICKET: { label: "Tickets", description: "Status changes and assignments" },
  COMMENT: { label: "Comments", description: "New comments on your tickets" },
  SYSTEM: { label: "System", description: "General platform announcements" },
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    BOOKING: true,
    TICKET: true,
    COMMENT: true,
    SYSTEM: true,
  });

  const { data: userNotifs = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications"),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.put("/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const togglePref = (type: string) => {
    setPreferences((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const enabledTypes = Object.entries(preferences)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);

  const filteredNotifs = userNotifs
    .filter((n) => enabledTypes.includes(n.type))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated on your bookings and tickets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" />Preferences
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notification Preferences</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">Choose which notification types you want to see.</p>
                {Object.entries(PREF_LABELS).map(([type, { label, description }]) => (
                  <div key={type} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        {typeIcons[type]}
                      </div>
                      <div>
                        <Label className="text-sm font-medium">{label}</Label>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <Switch checked={preferences[type]} onCheckedChange={() => togglePref(type)} />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => readAllMutation.mutate()} disabled={readAllMutation.isPending}>
            <CheckCheck className="w-4 h-4 mr-1" />Mark all read
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredNotifs.map((n) => (
          <Card key={n.id} className={cn("glass-card cursor-pointer transition-all", !n.isRead && "border-l-2 border-l-secondary")} onClick={() => !n.isRead && readMutation.mutate(n.id)}>
            <CardContent className="py-3 px-5 flex items-start gap-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0", !n.isRead ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground")}>
                {typeIcons[n.type] || <Bell className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0" />}
            </CardContent>
          </Card>
        ))}
        {filteredNotifs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

