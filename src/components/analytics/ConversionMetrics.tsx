import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, MousePointerClick, DollarSign } from "lucide-react";

interface ConversionStats {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalValue: number;
}

export function ConversionMetrics() {
  const [stats, setStats] = useState<ConversionStats>({
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get clicks
      const { count: clickCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('event_type', 'click')
        .gte('created_at', thirtyDaysAgo);

      // Get conversions
      const { data: conversions } = await supabase
        .from('goal_events')
        .select('conversion_value, goals!inner(user_id)')
        .eq('goals.user_id', user.user.id)
        .gte('ts', thirtyDaysAgo);

      const conversionCount = conversions?.length || 0;
      const totalValue = conversions?.reduce((sum, c) => sum + (Number(c.conversion_value) || 0), 0) || 0;
      const clicks = clickCount || 0;
      const rate = clicks > 0 ? (conversionCount / clicks) * 100 : 0;

      setStats({
        totalClicks: clicks,
        totalConversions: conversionCount,
        conversionRate: rate,
        totalValue
      });
    } catch (error) {
      console.error('Error fetching conversion stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate.toFixed(2)}%`,
      icon: Target,
      description: "Clicks → Conversions",
      color: "text-green-600"
    },
    {
      title: "Total Conversions",
      value: stats.totalConversions.toLocaleString(),
      icon: TrendingUp,
      description: "Last 30 days",
      color: "text-blue-600"
    },
    {
      title: "Total Clicks",
      value: stats.totalClicks.toLocaleString(),
      icon: MousePointerClick,
      description: "Last 30 days",
      color: "text-primary"
    },
    {
      title: "Conversion Value",
      value: `$${stats.totalValue.toFixed(2)}`,
      icon: DollarSign,
      description: "Total value tracked",
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
