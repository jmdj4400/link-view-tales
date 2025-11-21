import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, MousePointerClick, TrendingUp, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEOHead } from "@/components/SEOHead";

export function PublicReportView() {
  const { scorecardId } = useParams();
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScorecard();
  }, [scorecardId]);

  const fetchScorecard = async () => {
    if (!scorecardId) return;

    const { data, error } = await supabase
      .from('scorecards')
      .select('*')
      .eq('id', scorecardId)
      .single();

    if (error) {
      setError('Scorecard not found or has been removed');
      setLoading(false);
      return;
    }

    setScorecard(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Scorecard not found'}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const data = scorecard.data;
  const stats = data.stats || {};

  return (
    <>
      <SEOHead
        title={`Performance Report - ${data.period} - LinkPeek`}
        description="View public analytics report"
      />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Performance Report</h1>
            <p className="text-muted-foreground">Period: {data.period}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPageViews || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.conversionRate || 0}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CTR</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgCTR || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Flow Integrity</p>
                  <p className="text-2xl font-bold">{stats.flowIntegrity || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Redirect Success</p>
                  <p className="text-2xl font-bold">{stats.redirectSuccess || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                  <p className="text-2xl font-bold">{stats.avgSessionDuration || 0}s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Channels */}
          {data.topChannels && data.topChannels.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Traffic Sources</CardTitle>
                <CardDescription>Your best performing channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topChannels.map((channel: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{channel.referrer}</span>
                      <span className="text-sm text-muted-foreground">{channel.clicks} clicks</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>Powered by LinkPeek • Track smarter, grow faster</p>
          </div>
        </div>
      </div>
    </>
  );
}
