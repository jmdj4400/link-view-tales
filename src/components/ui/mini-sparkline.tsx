import { useMemo } from "react";

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function MiniSparkline({ data, color = "hsl(var(--primary))", height = 24, className = "" }: MiniSparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return "";
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const width = 100;
    const padding = 2;
    const stepX = (width - padding * 2) / (data.length - 1 || 1);
    
    return data
      .map((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, height]);

  if (!data || data.length === 0) {
    return <div className={`opacity-20 ${className}`} style={{ height }}></div>;
  }

  return (
    <svg 
      width="100" 
      height={height} 
      className={className}
      style={{ display: 'block' }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}