import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsageIndicatorProps {
  current: number;
  limit: number;
  label: string;
  className?: string;
}

export function UsageIndicator({ current, limit, label, className }: UsageIndicatorProps) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{label}</span>
          {isNearLimit && (
            <AlertCircle className="h-4 w-4 text-warning" />
          )}
        </div>
        <span className={cn(
          "font-medium",
          isAtLimit && "text-destructive",
          isNearLimit && !isAtLimit && "text-warning"
        )}>
          {current} / {limit}
        </span>
      </div>
      <Progress 
        value={Math.min(percentage, 100)} 
        className={cn(
          "h-2",
          isAtLimit && "[&>div]:bg-destructive",
          isNearLimit && !isAtLimit && "[&>div]:bg-warning"
        )}
      />
    </div>
  );
}
