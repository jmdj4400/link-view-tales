import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";

interface FlowStats {
  totalClicks: number;
  successfulRedirects: number;
  fallbacksUsed: number;
  conversions: number;
  flowIntegrityScore: number;
  leaks: {
    webViewLost: number;
    redirectFailed: number;
    goalNotReached: number;
  };
}

export function FlowVisualization() {
  const [stats, setStats] = useState<FlowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlowStats();
  }, []);

  const fetchFlowStats = async () => {
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

      // Get redirects
      const { data: redirects } = await supabase
        .from('redirects')
        .select('*, links!inner(user_id)')
        .eq('links.user_id', user.user.id)
        .gte('ts', thirtyDaysAgo);

      // Get conversions
      const { data: conversions } = await supabase
        .from('goal_events')
        .select('*, goals!inner(user_id)')
        .eq('goals.user_id', user.user.id)
        .gte('ts', thirtyDaysAgo);

      if (redirects) {
        const totalClicks = clickCount || 0;
        const successfulRedirects = redirects.filter(r => r.success).length;
        const fallbacksUsed = redirects.filter(r => r.fallback_used).length;
        const totalConversions = conversions?.length || 0;

        const redirectSuccessRate = redirects.length > 0 
          ? successfulRedirects / redirects.length 
          : 0;
        
        const conversionRate = totalClicks > 0 
          ? totalConversions / totalClicks 
          : 0;

        const flowIntegrityScore = redirectSuccessRate * conversionRate * 100;

        const webViewLost = fallbacksUsed;
        const redirectFailed = redirects.filter(r => !r.success).length;
        const goalNotReached = totalClicks - totalConversions;

        setStats({
          totalClicks,
          successfulRedirects,
          fallbacksUsed,
          conversions: totalConversions,
          flowIntegrityScore,
          leaks: {
            webViewLost,
            redirectFailed,
            goalNotReached
          }
        });
      }
    } catch (error) {
      console.error('Error fetching flow stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Traffic Flow Analysis</CardTitle>
          <CardDescription>Visualizing your conversion funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBarWidth = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Traffic Flow Analysis
          <div className="text-sm font-normal text-muted-foreground">
            Integrity Score: <span className={`font-bold ${stats.flowIntegrityScore > 5 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.flowIntegrityScore.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
        <CardDescription>Visualizing clicks → redirects → conversions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Flow bars */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1 text-sm">
              <span className="font-medium">Clicks</span>
              <span className="text-muted-foreground">{stats.totalClicks.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-blue-500 rounded flex items-center px-3 text-white text-sm font-medium">
              100%
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-sm">
              <span className="font-medium">Successful Redirects</span>
              <span className="text-muted-foreground">{stats.successfulRedirects.toLocaleString()}</span>
            </div>
            <div 
              className="h-8 bg-green-500 rounded flex items-center px-3 text-white text-sm font-medium"
              style={{ width: `${getBarWidth(stats.successfulRedirects, stats.totalClicks)}%` }}
            >
              {getBarWidth(stats.successfulRedirects, stats.totalClicks).toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 text-sm">
              <span className="font-medium">Conversions</span>
              <span className="text-muted-foreground">{stats.conversions.toLocaleString()}</span>
            </div>
            <div 
              className="h-8 bg-purple-500 rounded flex items-center px-3 text-white text-sm font-medium"
              style={{ width: `${getBarWidth(stats.conversions, stats.totalClicks)}%` }}
            >
              {getBarWidth(stats.conversions, stats.totalClicks).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Leak summary */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            Traffic Leaks
          </h4>
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-2 rounded bg-orange-50 dark:bg-orange-950/20">
              <span className="text-sm">WebView Lost (Fallbacks)</span>
              <span className="font-semibold text-orange-600">{stats.leaks.webViewLost}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950/20">
              <span className="text-sm">Redirect Failed</span>
              <span className="font-semibold text-red-600">{stats.leaks.redirectFailed}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
              <span className="text-sm">Goal Not Reached</span>
              <span className="font-semibold text-yellow-600">{stats.leaks.goalNotReached}</span>
            </div>
          </div>
        </div>

        {/* Score interpretation */}
        <div className="flex items-start gap-3 p-3 rounded border bg-card">
          {stats.flowIntegrityScore > 5 ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          )}
          <div className="flex-1 text-sm">
            <p className="font-medium mb-1">
              {stats.flowIntegrityScore > 5 ? 'Healthy Traffic Flow' : 'Optimization Needed'}
            </p>
            <p className="text-muted-foreground">
              {stats.flowIntegrityScore > 5 
                ? 'Your traffic flow is performing well. Most clicks are converting successfully.'
                : 'Your flow integrity score is low. Review the leaks above and apply recommended optimizations.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}