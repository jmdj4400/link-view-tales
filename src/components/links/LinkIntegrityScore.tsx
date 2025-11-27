import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkIntegrityScoreProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LinkIntegrityScore({ score, size = 'md', showLabel = true }: LinkIntegrityScoreProps) {
  const getScoreConfig = (score: number) => {
    if (score >= 95) {
      return {
        label: 'Excellent',
        icon: ShieldCheck,
        className: 'bg-success/10 text-success border-success/20',
      };
    } else if (score >= 80) {
      return {
        label: 'Good',
        icon: Shield,
        className: 'bg-primary/10 text-primary border-primary/20',
      };
    } else if (score >= 60) {
      return {
        label: 'Fair',
        icon: Shield,
        className: 'bg-warning/10 text-warning border-warning/20',
      };
    } else {
      return {
        label: 'Poor',
        icon: ShieldAlert,
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      };
    }
  };

  const { label, icon: Icon, className: scoreClass } = getScoreConfig(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(scoreClass, sizeClasses[size], 'flex items-center gap-1.5 font-mono-data')}
    >
      <Icon className={cn(
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-3.5 w-3.5',
        size === 'lg' && 'h-4 w-4'
      )} />
      <span>{score}%</span>
      {showLabel && size !== 'sm' && (
        <span className="ml-0.5 font-normal opacity-90">{label}</span>
      )}
    </Badge>
  );
}
