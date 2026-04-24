import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { resources } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { Plus, CalendarCheck, QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Booking {
  id: string;
  facility: {
    id: number;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  purpose: string;
  expectedAttendees: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  rejectionReason?: string;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reason, setReason] = useState("");

  const { data: allBookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings", isAdmin],
    queryFn: () => api.get(isAdmin ? "/bookings/all" : "/bookings/my"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/bookings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setOpen(false);
      toast.success("Booking request submitted!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
      const action = status === "APPROVED" ? "approve" : "reject";
      return api.put(`/bookings/${id}/${action}`, { reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setReviewOpen(false);
      setReason("");
      toast.success(`Booking ${variables.status.toLowerCase()}.`);
    },
    onError: (error: any) => toast.error(error.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.put(`/bookings/${id}/cancel`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const displayed = allBookings
    .filter((b) => statusFilter === "ALL" || b.status === statusFilter);

  const handleCreate = (data: any) => {
    // Combine date and time
    const start = `${data.date}T${data.startTime}:00`;
    const end = `${data.date}T${data.endTime}:00`;

    createMutation.mutate({
      facilityId: parseInt(data.resourceId),
      startTime: start,
      endTime: end,
      purpose: data.purpose,
      expectedAttendees: data.attendees
    });
  };

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
          <h1 className="font-display text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">{isAdmin ? "Manage all booking requests." : "Your resource bookings."}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Plus className="w-4 h-4 mr-1" />New Booking</Button>
          </DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Request a Booking</DialogTitle></DialogHeader><BookingForm onSubmit={handleCreate} isSubmitting={createMutation.isPending} /></DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {displayed.map((b) => (
          <Card key={b.id} className="glass-card">
            <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                  <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{b.facility?.name || `Resource #${b.facility?.id}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.startTime).toLocaleDateString()} · {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–{new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {b.expectedAttendees} attendees
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.purpose}</p>
                  {isAdmin && <p className="text-xs text-muted-foreground">by {b.user?.name}</p>}
                  {b.rejectionReason && <p className="text-xs text-destructive mt-1">Reason: {b.rejectionReason}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={b.status} />
                {isAdmin && b.status === "PENDING" && (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(b); setReviewOpen(true); }}>Review</Button>
                )}
                {b.status === "APPROVED" && (
                  <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(b); setQrOpen(true); }}>
                    <QrCode className="w-4 h-4 mr-1" />QR
                  </Button>
                )}
                {!isAdmin && b.status === "PENDING" && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => cancelMutation.mutate(b.id)} disabled={cancelMutation.isPending}>Cancel</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {displayed.length === 0 && <p className="text-center text-muted-foreground py-8">No bookings found.</p>}
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Review Booking</DialogTitle></DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Resource:</span> {selectedBooking.facility?.name || `Resource #${selectedBooking.facility?.id}`}</p>
                <p><span className="text-muted-foreground">By:</span> {selectedBooking.user?.name}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(selectedBooking.startTime).toLocaleString()}</p>
                <p><span className="text-muted-foreground">Purpose:</span> {selectedBooking.purpose}</p>
              </div>
              <div>
                <Label>Rejection Reason (if rejecting)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional reason..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" className="text-destructive" onClick={() => reviewMutation.mutate({ id: selectedBooking.id, status: "REJECTED", reason })} disabled={reviewMutation.isPending}>Reject</Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => reviewMutation.mutate({ id: selectedBooking.id, status: "APPROVED" })} disabled={reviewMutation.isPending}>Approve</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <p className="text-xs text-muted-foreground mt-2">Scan this code at the venue to check in</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const bookingSchema = z.object({
  resourceId: z.string().min(1, "Please select a resource"),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters long"),
  attendees: z.number().min(1, "Must have at least 1 attendee"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

function BookingForm({ onSubmit, isSubmitting }: { onSubmit: (data: any) => void, isSubmitting: boolean }) {
  const { data: activeResources = [] } = useQuery<any[]>({
    queryKey: ["facilities", "active"],
    queryFn: () => api.get("/facilities?status=ACTIVE"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      resourceId: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      purpose: "",
      attendees: 1,
    }
  });

  const resourceId = watch("resourceId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="resourceId">Resource</Label>
        <Select value={resourceId} onValueChange={(v) => setValue("resourceId", v)}>
          <SelectTrigger id="resourceId">
            <SelectValue placeholder="Select a resource" />
          </SelectTrigger>
          <SelectContent>
            {activeResources.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.resourceId && <p className="text-xs text-destructive mt-1">{errors.resourceId.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="startTime">Start</Label>
          <Input id="startTime" type="time" {...register("startTime")} />
          {errors.startTime && <p className="text-xs text-destructive mt-1">{errors.startTime.message}</p>}
        </div>
        <div>
          <Label htmlFor="endTime">End</Label>
          <Input id="endTime" type="time" {...register("endTime")} />
          {errors.endTime && <p className="text-xs text-destructive mt-1">{errors.endTime.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Textarea 
          id="purpose" 
          {...register("purpose")} 
          placeholder="Describe the purpose..." 
        />
        {errors.purpose && <p className="text-xs text-destructive mt-1">{errors.purpose.message}</p>}
      </div>

      <div>
        <Label htmlFor="attendees">Expected Attendees</Label>
        <Input 
          id="attendees" 
          type="number" 
          {...register("attendees", { valueAsNumber: true })} 
        />
        {errors.attendees && <p className="text-xs text-destructive mt-1">{errors.attendees.message}</p>}
      </div>

      <Button 
        type="submit"
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
      </Button>
    </form>
  );
}

