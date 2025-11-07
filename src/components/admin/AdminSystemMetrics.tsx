import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, CheckCircle, TrendingUp, Users } from "lucide-react";

export function AdminSystemMetrics() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: async () => {
      const [profilesRes, linksRes, eventsRes, incidentsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("links").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("incidents").select("id", { count: "exact", head: true }).eq("resolved_at", null),
      ]);

      return {
        totalUsers: profilesRes.count || 0,
        totalLinks: linksRes.count || 0,
        totalEvents: eventsRes.count || 0,
        activeIncidents: incidentsRes.count || 0,
      };
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const stats = [
    {
      title: "Total Users",
      value: metrics?.totalUsers.toLocaleString() || "0",
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Links",
      value: metrics?.totalLinks.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Total Events",
      value: metrics?.totalEvents.toLocaleString() || "0",
      icon: CheckCircle,
      color: "text-primary",
    },
    {
      title: "Active Incidents",
      value: metrics?.activeIncidents.toLocaleString() || "0",
      icon: AlertCircle,
      color: metrics?.activeIncidents === 0 ? "text-muted-foreground" : "text-destructive",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
