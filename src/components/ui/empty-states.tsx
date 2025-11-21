import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, MousePointerClick, BarChart3, AlertCircle, Inbox } from "lucide-react";

interface EmptyStateProps {
  variant?: 'links' | 'analytics' | 'error' | 'generic';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const icons = {
  links: Link,
  analytics: BarChart3,
  error: AlertCircle,
  generic: Inbox,
};

export function EmptyState({ 
  variant = 'generic', 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  const Icon = icons[variant];

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function LinksEmptyState({ onCreateLink }: { onCreateLink: () => void }) {
  return (
    <EmptyState
      variant="links"
      title="No links yet"
      description="Create your first tracking link to start monitoring clicks and engagement from your social media profiles."
      actionLabel="Create First Link"
      onAction={onCreateLink}
    />
  );
}

export function AnalyticsEmptyState() {
  return (
    <EmptyState
      variant="analytics"
      title="No data yet"
      description="Start sharing your links to see analytics and track performance. Your dashboard will come to life once visitors start clicking."
    />
  );
}

export function ErrorEmptyState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description={message || "We couldn't load this content. Please try again."}
      actionLabel={onRetry ? "Retry" : undefined}
      onAction={onRetry}
    />
  );
}
