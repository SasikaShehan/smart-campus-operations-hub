import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success border-success/30",
  OUT_OF_SERVICE: "bg-destructive/15 text-destructive border-destructive/30",
  PENDING: "bg-warning/15 text-warning border-warning/30",
  APPROVED: "bg-success/15 text-success border-success/30",
  REJECTED: "bg-destructive/15 text-destructive border-destructive/30",
  CANCELLED: "bg-muted text-muted-foreground border-border",
  OPEN: "bg-info/15 text-info border-info/30",
  IN_PROGRESS: "bg-warning/15 text-warning border-warning/30",
  RESOLVED: "bg-success/15 text-success border-success/30",
  CLOSED: "bg-muted text-muted-foreground border-border",
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-warning/15 text-warning border-warning/30",
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
  CRITICAL: "bg-destructive text-destructive-foreground border-destructive",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-semibold", statusStyles[status] || "")}
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
