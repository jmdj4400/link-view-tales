import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MousePointerClick, Smartphone, Tablet, Monitor, Globe, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLinkAnalytics } from "@/hooks/use-link-analytics";

interface LinkAnalyticsCardProps {
  linkId: string;
  dateRange?: { from: Date; to: Date };
}

export function LinkAnalyticsCard({ linkId, dateRange }: LinkAnalyticsCardProps) {
  const { analytics, loading, error } = useLinkAnalytics(linkId, dateRange);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">Failed to load analytics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const healthScore = analytics.redirectSuccess;
  const isHealthy = healthScore >= 95;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Link Performance</CardTitle>
          <Badge variant={isHealthy ? "default" : "destructive"} className="gap-1">
            {isHealthy ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {healthScore.toFixed(1)}% Success
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MousePointerClick className="h-3 w-3" />
              <span>Clicks</span>
            </div>
            <p className="text-2xl font-bold">{analytics.clicks}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Zap className="h-3 w-3" />
              <span>Load Time</span>
            </div>
            <p className="text-2xl font-bold">{analytics.avgLoadTime}ms</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Smartphone className="h-3 w-3" />
              <span>In-App</span>
            </div>
            <p className="text-2xl font-bold">{analytics.inAppBrowserClicks}</p>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Device Breakdown</p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-xs">
              <Smartphone className="h-3 w-3" />
              <span>{analytics.deviceBreakdown.mobile}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Tablet className="h-3 w-3" />
              <span>{analytics.deviceBreakdown.tablet}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Monitor className="h-3 w-3" />
              <span>{analytics.deviceBreakdown.desktop}</span>
            </div>
          </div>
        </div>

        {/* Top Countries */}
        {analytics.topCountries.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Top Countries
            </p>
            <div className="flex flex-wrap gap-1">
              {analytics.topCountries.map((country) => (
                <Badge key={country.country} variant="secondary" className="text-xs">
                  {country.country} ({country.count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
