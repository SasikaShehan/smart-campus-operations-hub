import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { resources } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatusBadge from "@/components/StatusBadge";
import { Plus, AlertTriangle, MessageCircle, Send, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Ticket {
  id: string;
  title: string;
  resourceId: number;
  resourceName: string;
  userId: string;
  userName: string;
  category: "ELECTRICAL" | "PLUMBING" | "IT_EQUIPMENT" | "FURNITURE" | "HVAC" | "OTHER";
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedName?: string;
  resolutionNotes?: string;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isTech = user?.role === "TECHNICIAN";

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [commentText, setCommentText] = useState("");

  const { data: allTickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets", isAdmin, isTech],
    queryFn: () => api.get(isAdmin || isTech ? "/tickets/all" : "/tickets/my"),
  });

  const { data: facilities = [] } = useQuery<any[]>({
    queryKey: ["facilities"],
    queryFn: () => api.get("/facilities"),
  });

  const { data: detailTicket = null } = useQuery<Ticket>({
    queryKey: ["ticket", detailTicketId],
    queryFn: () => api.get(`/tickets/${detailTicketId}`),
    enabled: !!detailTicketId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const facility = facilities.find(f => f.id.toString() === data.resourceId);
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('priority', data.priority);
      formData.append('location', facility?.location || "N/A");
      formData.append('resourceName', facility?.name || "Unknown");
      formData.append('contactEmail', data.contactEmail);
      formData.append('contactPhone', data.contactPhone);

      if (data.attachments) {
        for (let i = 0; i < data.attachments.length; i++) {
          formData.append('attachments', data.attachments[i]);
        }
      }

      return api.post("/tickets", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setCreateOpen(false);
      toast.success("Ticket created!");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string, status: string, notes?: string }) =>
      api.put(`/tickets/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", detailTicketId] });
      toast.success("Ticket status updated.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: (id: string) => api.put(`/tickets/${id}/assign`, { technicianId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", detailTicketId] });
      toast.success("Ticket assigned to you.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) =>
      api.post(`/tickets/${id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", detailTicketId] });
      setCommentText("");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const displayed = allTickets
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter);

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
          <h1 className="font-display text-2xl font-bold">Maintenance Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">Report and track facility issues.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90"><Plus className="w-4 h-4 mr-1" />New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
            <TicketForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} facilities={facilities} />
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {displayed.map((t) => (
          <Card key={t.id} className="glass-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailTicketId(t.id)}>
            <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.category.replace(/_/g, " ")} · by {t.userName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
                {t.comments?.length > 0 && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageCircle className="w-3 h-3" />{t.comments.length}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {displayed.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets found.</p>}
      </div>

      <Dialog open={!!detailTicketId} onOpenChange={(o) => !o && setDetailTicketId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {detailTicket && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2">{detailTicket.title}<StatusBadge status={detailTicket.status} /></DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Category:</span> {detailTicket.category.replace(/_/g, " ")}</p>
                  <p><span className="text-muted-foreground">Priority:</span> <StatusBadge status={detailTicket.priority} /></p>
                  <p><span className="text-muted-foreground">Reported by:</span> {detailTicket.userName}</p>
                  {detailTicket.assignedName && <p><span className="text-muted-foreground">Assigned to:</span> {detailTicket.assignedName}</p>}
                  <p className="pt-2">{detailTicket.description}</p>
                  {detailTicket.resolutionNotes && <p className="text-success"><span className="text-muted-foreground">Resolution:</span> {detailTicket.resolutionNotes}</p>}
                </div>

                {(isAdmin || isTech) && (
                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    {detailTicket.status === "OPEN" && isTech && (
                      <Button size="sm" onClick={() => assignMutation.mutate(detailTicket.id)} disabled={assignMutation.isPending}>
                        <Wrench className="w-3 h-3 mr-1" />Assign to me
                      </Button>
                    )}
                    {detailTicket.status === "IN_PROGRESS" && (isTech || isAdmin) && (
                      <Button size="sm" className="bg-success text-success-foreground"
                        onClick={() => updateStatusMutation.mutate({ id: detailTicket.id, status: "RESOLVED" })}
                        disabled={updateStatusMutation.isPending}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <p className="text-sm font-medium mb-2">Comments ({(detailTicket.comments || []).length})</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(detailTicket.comments || []).map((c: any) => (
                      <div key={c.id} className="bg-muted rounded-lg p-2.5">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-medium">{c.userName}</span>
                          <span>{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{c.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commentMutation.mutate({ id: detailTicket.id, content: commentText })} />
                    <Button size="icon" variant="outline" onClick={() => commentMutation.mutate({ id: detailTicket.id, content: commentText })} disabled={commentMutation.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketForm({ onSubmit, isSubmitting, facilities }: { onSubmit: (data: any) => void, isSubmitting: boolean, facilities: any[] }) {
  const [form, setForm] = useState({ title: "", resourceId: "", category: "", description: "", priority: "", contactEmail: "", contactPhone: "" });
  const [files, setFiles] = useState<FileList | null>(null);
  const update = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <div><Label>Title</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Brief title of the issue" /></div>
      <div><Label>Resource / Location</Label>
        <Select value={form.resourceId} onValueChange={(v) => update("resourceId", v)}>
          <SelectTrigger><SelectValue placeholder="Select resource" /></SelectTrigger>
          <SelectContent>{facilities.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => update("category", v)}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ELECTRICAL">Electrical</SelectItem><SelectItem value="PLUMBING">Plumbing</SelectItem>
              <SelectItem value="IT_EQUIPMENT">IT Equipment</SelectItem><SelectItem value="FURNITURE">Furniture</SelectItem>
              <SelectItem value="HVAC">HVAC</SelectItem><SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem><SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the issue in detail..." rows={3} /></div>
      <div><Label>Attachments (Max 3 images)</Label><Input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Contact Email</Label><Input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} /></div>
        <div><Label>Contact Phone</Label><Input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} placeholder="Optional" /></div>
      </div>
      <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        onClick={() => onSubmit({ ...form, attachments: files })}
        disabled={isSubmitting || !form.title || !form.resourceId || !form.category || !form.priority || !form.description || !form.contactEmail}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Ticket"}
      </Button>
    </div>
  );
}

