import { Link2, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LinkFaviconProps {
  url: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LinkFavicon({ url, size = 'md', className }: LinkFaviconProps) {
  const [error, setError] = useState(false);

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const faviconUrl = getFaviconUrl(url);

  if (!faviconUrl || error) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded bg-muted',
        sizeClasses[size],
        className
      )}>
        <Link2 className={cn(
          size === 'sm' && 'h-2.5 w-2.5',
          size === 'md' && 'h-3 w-3',
          size === 'lg' && 'h-3.5 w-3.5',
          'text-muted-foreground'
        )} />
      </div>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      className={cn('rounded', sizeClasses[size], className)}
      onError={() => setError(true)}
    />
  );
}
