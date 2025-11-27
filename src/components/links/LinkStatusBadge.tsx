import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkStatusBadgeProps {
  status: 'healthy' | 'issues' | 'low-activity' | 'unknown';
  className?: string;
}

export function LinkStatusBadge({ status, className }: LinkStatusBadgeProps) {
  const config = {
    healthy: {
      label: 'Healthy',
      icon: CheckCircle2,
      className: 'bg-success/10 text-success border-success/20',
    },
    issues: {
      label: 'Issues',
      icon: AlertCircle,
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    'low-activity': {
      label: 'Low Activity',
      icon: Clock,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    unknown: {
      label: 'Unknown',
      icon: Activity,
      className: 'bg-muted/10 text-muted-foreground border-muted/20',
    },
  };

  const { label, icon: Icon, className: statusClass } = config[status];

  return (
    <Badge variant="outline" className={cn(statusClass, 'flex items-center gap-1', className)}>
      <Icon className="h-3 w-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  );
}
