import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonMetricsProps {
  currentMetrics: {
    views: number;
    clicks: number;
    ctr: number;
  };
  previousMetrics: {
    views: number;
    clicks: number;
    ctr: number;
  };
}

export function ComparisonMetrics({ currentMetrics, previousMetrics }: ComparisonMetricsProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const metrics = [
    {
      label: "Page Views",
      current: currentMetrics.views,
      previous: previousMetrics.views,
      change: calculateChange(currentMetrics.views, previousMetrics.views),
    },
    {
      label: "Link Clicks",
      current: currentMetrics.clicks,
      previous: previousMetrics.clicks,
      change: calculateChange(currentMetrics.clicks, previousMetrics.clicks),
    },
    {
      label: "CTR",
      current: currentMetrics.ctr,
      previous: previousMetrics.ctr,
      change: calculateChange(currentMetrics.ctr, previousMetrics.ctr),
      suffix: "%",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = getTrendIcon(metric.change);
        const trendColor = getTrendColor(metric.change);

        return (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.current.toLocaleString()}
                {metric.suffix || ''}
              </div>
              <div className={cn("flex items-center gap-1 text-sm mt-1", trendColor)}>
                <Icon className="h-4 w-4" />
                <span className="font-medium">
                  {metric.change > 0 ? '+' : ''}
                  {metric.change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground text-xs ml-1">
                  vs previous period
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Previous: {metric.previous.toLocaleString()}{metric.suffix || ''}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
