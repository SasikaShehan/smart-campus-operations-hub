import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  resourceName: string;
  reportedBy: { id: number; name: string; email: string };
  assignedTo?: { id: number; name: string; email: string };
  category: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  contactEmail: string;
  contactPhone?: string;
  attachments: any[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
  rejectionReason?: string;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isTech = user?.role === "TECHNICIAN";

  const [createOpen, setCreateOpen] = useState(false);
  const [detailTicketId, setDetailTicketId] = useState<string | null>(null);
  const [reviewTicket, setReviewTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTechId, setSelectedTechId] = useState("");
  const [techRejectTicket, setTechRejectTicket] = useState<Ticket | null>(null);
  const [techRejectReason, setTechRejectReason] = useState("");

  const { data: allTickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets", isAdmin, isTech],
    queryFn: () => api.get(isAdmin ? "/tickets/all" : isTech ? "/tickets/technician" : "/tickets/my"),
  });

  const { data: facilities = [] } = useQuery<any[]>({
    queryKey: ["facilities"],
    queryFn: () => api.get("/facilities"),
  });

  const { data: technicians = [] } = useQuery<any[]>({
    queryKey: ["technicians"],
    queryFn: () => api.get("/user/technicians"),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      const facility = facilities.find((f: any) => f.id.toString() === data.resourceId);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("priority", data.priority);
      formData.append("location", facility?.location || "N/A");
      formData.append("resourceName", facility?.name || "Unknown");
      formData.append("contactEmail", data.contactEmail);
      formData.append("contactPhone", data.contactPhone);
      if (data.attachments) {
        for (let i = 0; i < data.attachments.length; i++) {
          formData.append("attachments", data.attachments[i]);
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

  const approveMutation = useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId?: string }) => {
      const chain = technicianId
        ? api.put(`/tickets/${id}/assign`, { technicianId: parseInt(technicianId) })
        : Promise.resolve();
      return chain.then(() => api.put(`/tickets/${id}/status`, { status: "IN_PROGRESS" }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setReviewTicket(null);
      setSelectedTechId("");
      toast.success("Ticket approved.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/tickets/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setReviewTicket(null);
      setRejectReason("");
      toast.success("Ticket rejected.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      api.put(`/tickets/${id}/status`, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket status updated.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const techAcceptMutation = useMutation({
    mutationFn: (id: string) => api.put(`/tickets/${id}/assign`, { technicianId: Number(user?.id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket accepted — now In Progress.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const techRejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/tickets/${id}/technician-reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setTechRejectTicket(null);
      setTechRejectReason("");
      toast.success("Ticket sent back to queue.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: (id: string) => api.put(`/tickets/${id}/assign`, { technicianId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket assigned to you.");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.post(`/tickets/${id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setCommentText("");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const displayed = allTickets.filter((t) => statusFilter === "ALL" || t.status === statusFilter);

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
        {!isAdmin && !isTech && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-1" />New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
              <TicketForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} facilities={facilities} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="RESOLVED">Resolved</SelectItem>
          <SelectItem value="CLOSED">Closed</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {displayed.map((t) => (
          <Card key={t.id} className="glass-card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setDetailTicketId(String(t.id))}>
            <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.category.replace(/_/g, " ")} · by {t.reportedBy?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                  {t.rejectionReason && <p className="text-xs text-destructive mt-0.5">Rejected: {t.rejectionReason}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
                {t.comments?.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />{t.comments.length}
                  </span>
                )}
                {isAdmin && t.status === "OPEN" && (
                  <Button size="sm" variant="outline" onClick={() => setReviewTicket(t)}>Review</Button>
                )}
                {isTech && t.status === "IN_PROGRESS" && (
                  <>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive"
                      onClick={() => setTechRejectTicket(t)}>
                      Reject
                    </Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90"
                      onClick={() => updateStatusMutation.mutate({ id: t.id, status: "RESOLVED" })}
                      disabled={updateStatusMutation.isPending}>
                      Resolved
                    </Button>
                  </>
                )}
                {isTech && t.status === "OPEN" && (
                  <Button size="sm" onClick={() => techAcceptMutation.mutate(t.id)}
                    disabled={techAcceptMutation.isPending}>
                    Accept
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {displayed.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets found.</p>}
      </div>

      {/* Admin Review Dialog */}
      <Dialog open={!!reviewTicket} onOpenChange={(o) => { if (!o) { setReviewTicket(null); setRejectReason(""); setSelectedTechId(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Ticket</DialogTitle></DialogHeader>
          {reviewTicket && (
            <div className="space-y-4">
              <div className="text-sm space-y-1 bg-muted/50 rounded-lg p-3">
                <p><span className="text-muted-foreground">Title:</span> <span className="font-medium">{reviewTicket.title}</span></p>
                <p><span className="text-muted-foreground">Category:</span> {reviewTicket.category.replace(/_/g, " ")}</p>
                <p><span className="text-muted-foreground">Priority:</span> <StatusBadge status={reviewTicket.priority} /></p>
                <p><span className="text-muted-foreground">Reported by:</span> {reviewTicket.reportedBy?.name}</p>
                <p className="pt-1 text-muted-foreground">{reviewTicket.description}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Assign Technician (optional)</Label>
                  <Select value={selectedTechId} onValueChange={setSelectedTechId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select a technician" /></SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech: any) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rejection Reason <span className="text-muted-foreground text-xs">(required to reject)</span></Label>
                  <Textarea
                    className="mt-1"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate({ id: reviewTicket.id, reason: rejectReason })}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-success text-success-foreground hover:bg-success/90"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate({ id: reviewTicket.id, technicianId: selectedTechId || undefined })}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Technician Reject Dialog */}
      <Dialog open={!!techRejectTicket} onOpenChange={(o) => { if (!o) { setTechRejectTicket(null); setTechRejectReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reject Ticket</DialogTitle></DialogHeader>
          {techRejectTicket && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Provide a reason for rejecting <span className="font-medium text-foreground">{techRejectTicket.title}</span>. It will be sent back to the queue.</p>
              <Textarea
                value={techRejectReason}
                onChange={(e) => setTechRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setTechRejectTicket(null); setTechRejectReason(""); }}>Cancel</Button>
                <Button variant="destructive"
                  disabled={!techRejectReason.trim() || techRejectMutation.isPending}
                  onClick={() => techRejectMutation.mutate({ id: techRejectTicket.id, reason: techRejectReason })}>
                  Confirm Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailTicketId} onOpenChange={(o) => !o && setDetailTicketId(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {(() => {
            const t = allTickets.find((t) => String(t.id) === String(detailTicketId));
            if (!t) return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {t.title}<StatusBadge status={t.status} />
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Category:</span> {t.category.replace(/_/g, " ")}</p>
                    <p><span className="text-muted-foreground">Priority:</span> <StatusBadge status={t.priority} /></p>
                    <p><span className="text-muted-foreground">Reported by:</span> {t.reportedBy?.name}</p>
                    {t.assignedTo && <p><span className="text-muted-foreground">Assigned to:</span> {t.assignedTo.name}</p>}
                    <p className="pt-2">{t.description}</p>
                    {t.rejectionReason && <p className="text-destructive"><span className="text-muted-foreground">Rejection reason:</span> {t.rejectionReason}</p>}
                    {t.resolutionNotes && <p className="text-success"><span className="text-muted-foreground">Resolution:</span> {t.resolutionNotes}</p>}
                  </div>

                  {(isAdmin || isTech) && (
                    <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                      {t.status === "OPEN" && isTech && (
                        <Button size="sm" onClick={() => assignMutation.mutate(String(t.id))} disabled={assignMutation.isPending}>
                          <Wrench className="w-3 h-3 mr-1" />Assign to me
                        </Button>
                      )}
                      {t.status === "IN_PROGRESS" && (isTech || isAdmin) && (
                        <Button size="sm" className="bg-success text-success-foreground"
                          onClick={() => updateStatusMutation.mutate({ id: String(t.id), status: "RESOLVED" })}
                          disabled={updateStatusMutation.isPending}>
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-medium mb-2">Comments ({(t.comments || []).length})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(t.comments || []).map((c: any) => (
                        <div key={c.id} className="bg-muted rounded-lg p-2.5">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span className="font-medium">{c.author?.name || c.userName}</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm">{c.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && commentMutation.mutate({ id: String(t.id), content: commentText })}
                      />
                      <Button size="icon" variant="outline"
                        onClick={() => commentMutation.mutate({ id: String(t.id), content: commentText })}
                        disabled={commentMutation.isPending}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  resourceId: z.string().min(1, "Please select a location"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  priority: z.string().min(1, "Please select a priority"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

function TicketForm({ onSubmit, isSubmitting, facilities }: { onSubmit: (data: any) => void; isSubmitting: boolean; facilities: any[] }) {
  const [files, setFiles] = useState<FileList | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: "", resourceId: "", category: "", description: "", priority: "MEDIUM", contactEmail: "", contactPhone: "" },
  });

  const category = watch("category");
  const priority = watch("priority");
  const resourceId = watch("resourceId");

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, attachments: files }))} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Brief title of the issue" />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="resourceId">Resource / Location</Label>
        <Select value={resourceId} onValueChange={(v) => setValue("resourceId", v)}>
          <SelectTrigger id="resourceId"><SelectValue placeholder="Select resource" /></SelectTrigger>
          <SelectContent>
            {facilities.map((r: any) => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.resourceId && <p className="text-xs text-destructive mt-1">{errors.resourceId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger id="category"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ELECTRICAL">Electrical</SelectItem>
              <SelectItem value="PLUMBING">Plumbing</SelectItem>
              <SelectItem value="IT_EQUIPMENT">IT Equipment</SelectItem>
              <SelectItem value="FURNITURE">Furniture</SelectItem>
              <SelectItem value="HVAC">HVAC</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setValue("priority", v)}>
            <SelectTrigger id="priority"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-xs text-destructive mt-1">{errors.priority.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Describe the issue in detail..." rows={3} />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="attachments">Attachments (Max 3 images)</Label>
        <Input id="attachments" type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" type="email" {...register("contactEmail")} />
          {errors.contactEmail && <p className="text-xs text-destructive mt-1">{errors.contactEmail.message}</p>}
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input id="contactPhone" {...register("contactPhone")} placeholder="07XXXXXXXX" />
          {errors.contactPhone && <p className="text-xs text-destructive mt-1">{errors.contactPhone.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Ticket"}
      </Button>
    </form>
  );
}
