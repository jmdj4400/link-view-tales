import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SystemHealthDashboard() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [incidentsRes, redirectsRes, eventsRes] = await Promise.all([
        supabase
          .from("incidents")
          .select("id, severity")
          .is("resolved_at", null),
        supabase
          .from("redirects")
          .select("success")
          .gte("ts", oneHourAgo.toISOString()),
        supabase
          .from("events")
          .select("id")
          .gte("created_at", oneHourAgo.toISOString()),
      ]);

      const totalRedirects = redirectsRes.data?.length || 0;
      const successfulRedirects = redirectsRes.data?.filter(r => r.success).length || 0;
      const successRate = totalRedirects > 0 
        ? (successfulRedirects / totalRedirects) * 100 
        : 100;

      return {
        activeIncidents: incidentsRes.data?.length || 0,
        criticalIncidents: incidentsRes.data?.filter(i => i.severity === "critical").length || 0,
        redirectSuccessRate: successRate,
        eventsLastHour: eventsRes.data?.length || 0,
        status: incidentsRes.data?.length === 0 && successRate > 95 ? "healthy" : "degraded",
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const statusConfig = {
    healthy: {
      label: "All Systems Operational",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    degraded: {
      label: "Degraded Performance",
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
  };

  const status = statusConfig[health?.status || "healthy"];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      <Card className={status.bgColor}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${status.color}`} />
            {status.label}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.activeIncidents}</div>
            {health?.criticalIncidents > 0 && (
              <Badge variant="destructive" className="mt-2">
                {health.criticalIncidents} Critical
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redirect Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.redirectSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events/Hour</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.eventsLastHour.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
          </CardHeader>
          <CardContent>
            <Badge variant={health?.status === "healthy" ? "default" : "secondary"}>
              {health?.status === "healthy" ? "Healthy" : "Degraded"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
