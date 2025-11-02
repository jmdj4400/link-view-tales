import { useEffect, useState } from "react";
import { Timer, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  startTime: number;
  onTimeout?: () => void;
}

export function CountdownTimer({ startTime, onTimeout }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setTimeLeft(remaining);
      setIsWarning(remaining <= 20);

      if (remaining === 0) {
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, onTimeout]);

  const percentage = (timeLeft / 60) * 100;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={cn(
        "bg-card border-2 rounded-lg p-4 shadow-lg transition-all duration-300",
        isWarning ? "border-destructive animate-pulse" : "border-primary"
      )}>
        <div className="flex items-center gap-3">
          {timeLeft > 0 ? (
            <>
              <div className="relative">
                <Timer className={cn(
                  "h-8 w-8",
                  isWarning ? "text-destructive" : "text-primary"
                )} />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-transparent"
                  style={{
                    borderTopColor: isWarning ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                    borderRightColor: isWarning ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
                    transform: 'rotate(45deg)',
                    clipPath: `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`
                  }}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Challenge Timer
                </div>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  isWarning ? "text-destructive" : "text-primary"
                )}>
                  {timeLeft}s
                </div>
              </div>
            </>
          ) : (
            <>
              <Zap className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Time's up!
                </div>
                <div className="text-sm text-muted-foreground">
                  Complete to continue
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {timeLeft > 0 ? "Complete for 1 month Pro free! 🚀" : "Keep going!"}
        </div>
      </div>
    </div>
  );
}
