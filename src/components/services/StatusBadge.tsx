import type { ServicePriority, ServiceStatus } from "@/lib/supabase/types";
import { priorityLabels, statusLabels } from "@/lib/labels";

const statusClass: Record<ServiceStatus, string> = {
  pending: "border-border bg-panel-muted text-foreground",
  in_progress: "border-accent/30 bg-accent/10 text-accent-strong",
  awaiting_approval: "border-warning/30 bg-warning/10 text-warning",
  approved: "border-accent/30 bg-accent/10 text-accent-strong",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  canceled: "border-danger/30 bg-danger/10 text-danger",
  rejected: "border-danger/30 bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ServicePriority }) {
  return (
    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium">
      {priorityLabels[priority]}
    </span>
  );
}
