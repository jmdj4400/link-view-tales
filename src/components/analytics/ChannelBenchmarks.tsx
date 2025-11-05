import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface BenchmarkData {
  platform: string;
  userCtr: number;
  avgCtr: number;
  userConversionRate: number;
  avgConversionRate: number;
  userRedirectSuccess: number;
  avgRedirectSuccess: number;
}

export function ChannelBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get user's links
      const { data: links } = await supabase
        .from('links')
        .select('id')
        .eq('user_id', user.user.id);

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      const linkIds = links.map(l => l.id);

      // Get platform benchmarks
      const { data: globalBenchmarks } = await supabase
        .from('channel_benchmarks')
        .select('*');

      const platforms = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter/X'];
      const benchmarkData: BenchmarkData[] = [];

      for (const platform of platforms) {
        // Get user's redirects for this platform
        const { data: userRedirects } = await supabase
          .from('redirects')
          .select('success')
          .in('link_id', linkIds)
          .eq('browser', platform)
          .gte('ts', thirtyDaysAgo);

        // Get user's clicks
        const { count: userClicks } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.user.id)
          .eq('event_type', 'click')
          .gte('created_at', thirtyDaysAgo);

        // Get user's conversions
        const { data: userConversions } = await supabase
          .from('goal_events')
          .select('*, goals!inner(user_id)')
          .eq('goals.user_id', user.user.id)
          .gte('ts', thirtyDaysAgo);

        const globalData = globalBenchmarks?.find(b => b.platform === platform);

        if (userRedirects && userRedirects.length > 0) {
          const userRedirectSuccess = (userRedirects.filter(r => r.success).length / userRedirects.length) * 100;
          const userConvRate = userClicks && userClicks > 0 
            ? ((userConversions?.length || 0) / userClicks) * 100 
            : 0;

          benchmarkData.push({
            platform,
            userCtr: 0, // Simplified for now
            avgCtr: globalData?.avg_ctr || 0,
            userConversionRate: userConvRate,
            avgConversionRate: globalData?.avg_conversion_rate || 0,
            userRedirectSuccess: userRedirectSuccess,
            avgRedirectSuccess: globalData?.avg_redirect_success || 0
          });
        }
      }

      setBenchmarks(benchmarkData);
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderComparison = (userValue: number, avgValue: number) => {
    const diff = userValue - avgValue;
    const diffAbs = Math.abs(diff);

    if (Math.abs(diff) < 0.5) {
      return (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-3 w-3" />
          ~{avgValue.toFixed(1)}%
        </span>
      );
    }

    return (
      <span className={`flex items-center gap-1 ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs avg
      </span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Benchmarks</CardTitle>
          <CardDescription>Compare your performance vs network averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Benchmarks</CardTitle>
          <CardDescription>Compare your performance vs network averages</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Not enough data yet. Benchmarks will appear once you have traffic from social platforms.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Benchmarks</CardTitle>
        <CardDescription>Your performance vs network averages (last 30 days)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {benchmarks.map(benchmark => (
            <div key={benchmark.platform} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3">{benchmark.platform}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Conversion Rate</p>
                  <p className="text-lg font-bold">{benchmark.userConversionRate.toFixed(1)}%</p>
                  <p className="text-xs mt-1">
                    {renderComparison(benchmark.userConversionRate, benchmark.avgConversionRate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Redirect Success</p>
                  <p className="text-lg font-bold">{benchmark.userRedirectSuccess.toFixed(1)}%</p>
                  <p className="text-xs mt-1">
                    {renderComparison(benchmark.userRedirectSuccess, benchmark.avgRedirectSuccess)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}