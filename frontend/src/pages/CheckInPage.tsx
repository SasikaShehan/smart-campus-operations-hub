import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Removed initialBookings import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ScanLine, Loader2 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function CheckInPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingIdFromUrl = searchParams.get("bookingId");
  const [bookingId, setBookingId] = useState(bookingIdFromUrl || "");
  const [result, setResult] = useState<"success" | "invalid" | "not_approved" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkedBooking, setCheckedBooking] = useState<any | null>(null);

  const handleCheckIn = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const booking = await api.get(`/bookings/${idToVerify.trim()}`);
      setCheckedBooking(booking);
      if (booking.status !== "APPROVED") {
        setResult("not_approved");
      } else {
        setResult("success");
      }
    } catch (error) {
      setResult("invalid");
      setCheckedBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check on mount if bookingId from URL
  useEffect(() => {
    if (bookingIdFromUrl) {
      handleCheckIn(bookingIdFromUrl);
    }
  }, [bookingIdFromUrl]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">QR Check-In</h1>
        <p className="text-muted-foreground text-sm mt-1">Verify your booking by entering your Booking ID or scanning the QR code.</p>
      </div>

      <Card className="glass-card max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-secondary" />
            Verify Booking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Booking ID (e.g. b1)"
              value={bookingId}
              onChange={(e) => { setBookingId(e.target.value); setResult(null); }}
            />
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={() => handleCheckIn(bookingId)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
            </Button>
          </div>

          {result === "success" && checkedBooking && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-success font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                Check-in Successful!
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Resource:</span> {checkedBooking.facility?.name}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(checkedBooking.startTime).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">Time:</span> {new Date(checkedBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(checkedBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p><span className="text-muted-foreground">Booked by:</span> {checkedBooking.user?.name}</p>
                <p><span className="text-muted-foreground">Purpose:</span> {checkedBooking.purpose}</p>
              </div>
            </div>
          )}

          {result === "not_approved" && checkedBooking && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-warning font-semibold">
                <XCircle className="w-5 h-5" />
                Booking Not Approved
              </div>
              <p className="text-sm text-muted-foreground">
                This booking is currently <StatusBadge status={checkedBooking.status} />. Only approved bookings can be checked in.
              </p>
            </div>
          )}

          {result === "invalid" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <XCircle className="w-5 h-5" />
                Invalid Booking ID
              </div>
              <p className="text-sm text-muted-foreground mt-1">No booking found with this ID. Please check and try again.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tip: You can find QR codes on the <Link to="/bookings" className="text-secondary hover:underline">Bookings page</Link> for approved bookings.
      </p>
    </div>
  );
}
