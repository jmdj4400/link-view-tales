import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowPulseProps {
  children: ReactNode;
  enabled?: boolean;
  color?: string;
  intensity?: number;
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export function GlowPulse({ 
  children, 
  enabled = true, 
  color = "#00ffff",
  intensity = 1,
  speed = 'normal',
  className 
}: GlowPulseProps) {
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const animationDuration = {
    slow: '4s',
    normal: '2s',
    fast: '1s',
  };

  const glowSize = 20 * intensity;

  return (
    <div
      className={cn("relative", className)}
      style={{
        animation: `glow-pulse ${animationDuration[speed]} ease-in-out infinite`,
      }}
    >
      {/* Glow layer */}
      <div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          boxShadow: `0 0 ${glowSize}px ${color}60, 0 0 ${glowSize * 2}px ${color}30, 0 0 ${glowSize * 3}px ${color}10`,
          animation: `glow-pulse ${animationDuration[speed]} ease-in-out infinite`,
        }}
      />
      {children}
      
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.6;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  );
}
