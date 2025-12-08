import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  className?: string;
}

export function AuroraBackground({ colors, className }: AuroraBackgroundProps) {
  const primary = colors?.primary || '#4ecca3';
  const secondary = colors?.secondary || '#7c3aed';
  const accent = colors?.accent || '#f59e0b';

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Aurora blobs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[100px] animate-aurora-1"
        style={{
          background: `radial-gradient(circle, ${primary}80, transparent 70%)`,
          top: '-20%',
          left: '-10%',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-25 blur-[80px] animate-aurora-2"
        style={{
          background: `radial-gradient(circle, ${secondary}60, transparent 70%)`,
          top: '30%',
          right: '-15%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[60px] animate-aurora-3"
        style={{
          background: `radial-gradient(circle, ${accent}50, transparent 70%)`,
          bottom: '-10%',
          left: '20%',
        }}
      />
    </div>
  );
}
