import { useState } from "react";
import { Building2, FlaskConical, Users, MonitorSmartphone, Search, MapPin, Loader2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";

const typeIcons: Record<string, React.ReactNode> = {
  LECTURE_HALL: <Building2 className="w-5 h-5" />,
  LAB: <FlaskConical className="w-5 h-5" />,
  MEETING_ROOM: <Users className="w-5 h-5" />,
  EQUIPMENT: <MonitorSmartphone className="w-5 h-5" />,
};

interface Facility {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  capacity?: number;
  status: string;
  availabilitySchedule?: string;
}

export default function FacilitiesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN";
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: facilities = [], isLoading } = useQuery<Facility[]>({
    queryKey: ["facilities"],
    queryFn: () => api.get("/facilities"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/facilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
      setIsCreateOpen(false);
      toast.success("Facility created successfully!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filtered = facilities.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || r.type === typeFilter;
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

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
          <h1 className="font-display text-2xl font-bold">Facilities and Assets</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and search bookable campus resources.</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-1" />Add New Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New Facility</DialogTitle></DialogHeader>
              <FacilityForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="LECTURE_HALL">Lecture Halls</SelectItem>
            <SelectItem value="LAB">Lab Halls</SelectItem>
            <SelectItem value="MEETING_ROOM">Meeting Rooms</SelectItem>
            <SelectItem value="EQUIPMENT">Equipments</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No resources match your filters.</div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: Facility }) {
  return (
    <Card className="glass-card hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              {typeIcons[resource.type] || <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-sm">{resource.name}</p>
              <p className="text-xs text-muted-foreground">{resource.type.replace(/_/g, " ")}</p>
            </div>
          </div>
          <StatusBadge status={resource.status} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{resource.location}</span>
          {resource.capacity && <span>Capacity: {resource.capacity}</span>}
        </div>
        {resource.availabilitySchedule && <div className="text-xs text-muted-foreground">Schedule: {resource.availabilitySchedule}</div>}
      </CardContent>
    </Card>
  );
}

function FacilityForm({ onSubmit, isSubmitting }: { onSubmit: (data: any) => void, isSubmitting: boolean }) {
  const [form, setForm] = useState({ 
    name: "", 
    type: "LECTURE_HALL", 
    location: "", 
    description: "", 
    capacity: "", 
    availabilitySchedule: "8:00 AM - 8:00 PM",
    status: "ACTIVE"
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-4">
      <div><Label>Name</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Main Hall A" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => update("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LECTURE_HALL">Lecture Hall</SelectItem>
              <SelectItem value="LAB">Lab</SelectItem>
              <SelectItem value="MEETING_ROOM">Meeting Room</SelectItem>
              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} placeholder="e.g. 50" /></div>
      </div>
      <div><Label>Location</Label><Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. Block C, Level 2" /></div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the facility..." rows={3} /></div>
      <div><Label>Availability Schedule</Label><Input value={form.availabilitySchedule} onChange={(e) => update("availabilitySchedule", e.target.value)} placeholder="e.g. 8:00 AM - 6:00 PM" /></div>
      <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" 
        onClick={() => onSubmit({ ...form, capacity: parseInt(form.capacity) || 0 })} 
        disabled={isSubmitting || !form.name || !form.location || !form.description}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Facility"}
      </Button>
    </div>
  );
}


