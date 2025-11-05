import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";

export const FirewallStats = () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: firewallData, isLoading } = useQuery({
    queryKey: ['firewall-stats'],
    queryFn: async () => {
      const { data: redirects, error } = await supabase
        .from('redirects')
        .select('avoided_failure, risk_score, firewall_strategy, ts')
        .gte('ts', sevenDaysAgo)
        .order('ts', { ascending: true });

      if (error) throw error;

      const saved = redirects?.filter(r => r.avoided_failure) || [];
      const total = redirects?.length || 0;
      const avgRisk = saved.length > 0
        ? saved.reduce((sum, r) => sum + (r.risk_score || 0), 0) / saved.length
        : 0;

      // Group by day for sparkline
      const dailyData = redirects?.reduce((acc: any[], redirect) => {
        const date = new Date(redirect.ts).toLocaleDateString();
        const existing = acc.find(d => d.date === date);
        if (existing) {
          if (redirect.avoided_failure) existing.saved++;
        } else {
          acc.push({ date, saved: redirect.avoided_failure ? 1 : 0 });
        }
        return acc;
      }, []) || [];

      return {
        clicksSaved: saved.length,
        totalClicks: total,
        savingsRate: total > 0 ? (saved.length / total) * 100 : 0,
        avgRiskScore: avgRisk,
        dailyData,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Traffic Firewall
          </CardTitle>
          <CardDescription>Loading firewall statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Traffic Firewall
            </CardTitle>
            <CardDescription>Clicks protected in last 7 days</CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {firewallData?.savingsRate.toFixed(1)}% protected
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Clicks Saved</div>
              <AnimatedCounter
                end={firewallData?.clicksSaved || 0}
                className="text-3xl font-bold text-primary"
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Avg Risk Score</div>
              <div className="text-3xl font-bold">
                {firewallData?.avgRiskScore.toFixed(0)}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </div>

          {firewallData?.dailyData && firewallData.dailyData.length > 0 && (
            <div className="h-[100px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={firewallData.dailyData}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="saved"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Firewall automatically reroutes high-risk traffic through safe fallback pages
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
