import { AlertCircle, XCircle, AlertTriangle, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'destructive' | 'default';
  type?: 'error' | 'warning' | 'info';
  retry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title, 
  message, 
  variant = 'destructive',
  type = 'error',
  retry,
  className 
}: ErrorMessageProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <Alert variant={variant} className={cn(className)}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>{message}</span>
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="shrink-0"
          >
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface NetworkErrorProps {
  retry?: () => void;
}

export function NetworkError({ retry }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Connection Lost</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Unable to reach the server. Please check your internet connection.
      </p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

interface DataErrorProps {
  message?: string;
  retry?: () => void;
}

export function DataError({ message = "Failed to load data", retry }: DataErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} size="sm" variant="outline">
          Retry
        </Button>
      )}
    </div>
  );
}
