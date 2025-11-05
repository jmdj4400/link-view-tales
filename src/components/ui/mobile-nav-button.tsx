import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileNavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Mobile-optimized button with larger touch target (min-height: 48px)
 * Follows accessibility guidelines for touch interfaces
 */
export function MobileNavButton({ 
  children, 
  variant = "default", 
  size = "default",
  className,
  ...props 
}: MobileNavButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("min-h-[48px] touch-manipulation", className)}
      {...props}
    >
      {children}
    </Button>
  );
}
