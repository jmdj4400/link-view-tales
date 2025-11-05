import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, ExternalLink, TrendingUp } from "lucide-react";

interface ReliabilityStats {
  totalRedirects: number;
  successfulRedirects: number;
  fallbacksUsed: number;
  successRate: number;
  recoveredSessions: number;
}

export function ReliabilityMetrics() {
  const [stats, setStats] = useState<ReliabilityStats>({
    totalRedirects: 0,
    successfulRedirects: 0,
    fallbacksUsed: 0,
    successRate: 0,
    recoveredSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get redirects for user's links (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: redirects } = await supabase
        .from('redirects')
        .select('*, links!inner(user_id)')
        .eq('links.user_id', user.user.id)
        .gte('ts', thirtyDaysAgo);

      if (redirects) {
        const total = redirects.length;
        const successful = redirects.filter(r => r.success).length;
        const fallbacks = redirects.filter(r => r.fallback_used).length;
        const rate = total > 0 ? (successful / total) * 100 : 0;

        setStats({
          totalRedirects: total,
          successfulRedirects: successful,
          fallbacksUsed: fallbacks,
          successRate: rate,
          recoveredSessions: fallbacks
        });
      }
    } catch (error) {
      console.error('Error fetching reliability stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Redirect Success Rate",
      value: `${stats.successRate.toFixed(1)}%`,
      icon: CheckCircle2,
      description: "Links that loaded successfully",
      color: "text-green-600"
    },
    {
      title: "Recovered Sessions",
      value: stats.recoveredSessions.toLocaleString(),
      icon: ExternalLink,
      description: "WebView fallbacks used",
      color: "text-blue-600"
    },
    {
      title: "Total Redirects",
      value: stats.totalRedirects.toLocaleString(),
      icon: Activity,
      description: "Last 30 days",
      color: "text-primary"
    },
    {
      title: "WebView Recovery Rate",
      value: stats.totalRedirects > 0 
        ? `${((stats.fallbacksUsed / stats.totalRedirects) * 100).toFixed(1)}%`
        : "0%",
      icon: TrendingUp,
      description: "In-app browser handling",
      color: "text-purple-600"
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
