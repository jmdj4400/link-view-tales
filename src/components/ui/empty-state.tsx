import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in", className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 gradient-primary opacity-10 blur-2xl rounded-full"></div>
        <div className="relative rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-6 shadow-elegant">
          <Icon className="h-12 w-12 text-primary" />
        </div>
      </div>
      <h3 className="text-2xl font-heading font-semibold mb-3">{title}</h3>
      <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="lg" className="shadow-elegant hover:scale-105 transition-transform duration-200">
          {action.label}
        </Button>
      )}
    </div>
  );
}
