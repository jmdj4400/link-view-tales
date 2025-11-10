import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Sparkles } from "lucide-react";

interface PlanBadgeProps {
  plan: string;
  className?: string;
  showIcon?: boolean;
}

export function PlanBadge({ plan, className = "", showIcon = true }: PlanBadgeProps) {
  const getPlanConfig = (planName: string) => {
    const lowerPlan = planName.toLowerCase();
    
    if (lowerPlan === 'business') {
      return {
        label: 'Business',
        variant: 'default' as const,
        icon: Crown,
        gradient: 'from-purple-500 to-pink-500'
      };
    } else if (lowerPlan === 'pro') {
      return {
        label: 'Pro',
        variant: 'default' as const,
        icon: Zap,
        gradient: 'from-blue-500 to-cyan-500'
      };
    } else {
      return {
        label: 'Free',
        variant: 'secondary' as const,
        icon: Sparkles,
        gradient: 'from-gray-500 to-gray-600'
      };
    }
  };

  const config = getPlanConfig(plan);
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${className} bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg`}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
