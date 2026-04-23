import { useAuth } from "@/contexts/AuthContext";
import { resources, bookings, tickets } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { Navigate } from "react-router-dom";

const COLORS = [
  "hsl(174, 55%, 40%)",
  "hsl(215, 60%, 22%)",
  "hsl(38, 90%, 55%)",
  "hsl(0, 72%, 51%)",
  "hsl(200, 80%, 50%)",
  "hsl(152, 60%, 40%)",
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  // Resource utilization by type
  const resourceByType = resources.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  const resourceTypeData = Object.entries(resourceByType).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));

  // Bookings by status
  const bookingsByStatus = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const bookingStatusData = Object.entries(bookingsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  // Peak booking hours
  const hourCounts: Record<number, number> = {};
  bookings.forEach((b) => {
    const hour = parseInt(b.startTime.split(":")[0]);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHoursData = Array.from({ length: 15 }, (_, i) => i + 7).map((h) => ({
    hour: `${h}:00`,
    bookings: hourCounts[h] || 0,
  }));

  // Tickets by priority
  const ticketsByPriority = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});
  const ticketPriorityData = Object.entries(ticketsByPriority).map(([name, value]) => ({
    name,
    value,
  }));

  // Tickets by status
  const ticketsByStatus = tickets.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const ticketStatusData = Object.entries(ticketsByStatus).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));

  // Top booked resources
  const resourceBookingCount = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.resourceName] = (acc[b.resourceName] || 0) + 1;
    return acc;
  }, {});
  const topResourcesData = Object.entries(resourceBookingCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Campus usage insights and statistics.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-sm text-muted-foreground">Total Resources</p>
            <p className="text-3xl font-display font-bold mt-1">{resources.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-3xl font-display font-bold mt-1">{bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-sm text-muted-foreground">Open Tickets</p>
            <p className="text-3xl font-display font-bold mt-1">{tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-5 pb-4 px-5">
            <p className="text-sm text-muted-foreground">Approval Rate</p>
            <p className="text-3xl font-display font-bold mt-1">
              {bookings.length > 0 ? Math.round((bookings.filter((b) => b.status === "APPROVED").length / bookings.length) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Peak Booking Hours */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Peak Booking Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(174, 55%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Booked Resources */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Top Booked Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topResourcesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(215, 60%, 22%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status Distribution */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Priority Breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ticketPriorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {ticketPriorityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resource Types */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Resources by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={resourceTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(38, 90%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Status */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ticketStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
