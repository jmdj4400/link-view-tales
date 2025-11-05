import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  className?: string;
}

export function AutosaveIndicator({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  className,
}: AutosaveIndicatorProps) {
  if (error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <AlertCircle className="h-4 w-4" />
        <span>Failed to save: {error}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Cloud className="h-4 w-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-green-600", className)}>
        <Check className="h-4 w-4" />
        <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
      </div>
    );
  }

  return null;
}
