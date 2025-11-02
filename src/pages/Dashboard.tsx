import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Link as LinkIcon, CreditCard, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { user, signOut, loading, subscriptionStatus, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [metrics, setMetrics] = useState({ views: 0, clicks: 0, ctr: 0 });
  const [chartData, setChartData] = useState<Array<{ date: string; clicks: number; views: number }>>([]);
  const [topLinks, setTopLinks] = useState<Array<any>>([]);
  const [trafficSources, setTrafficSources] = useState<Array<any>>([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated!');
      refreshSubscription();
    }
  }, [searchParams, refreshSubscription]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
      fetchLinks();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    const days = timeRange === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch events (excluding bots)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_bot', false)
      .gte('created_at', startDate.toISOString());

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return;
    }

    // Calculate metrics
    const viewEvents = events?.filter(e => e.event_type === 'view') || [];
    const clickEvents = events?.filter(e => e.event_type === 'click') || [];
    const totalViews = viewEvents.length;
    const totalClicks = clickEvents.length;
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    setMetrics({ 
      views: totalViews, 
      clicks: totalClicks, 
      ctr: Math.round(ctr * 10) / 10 
    });

    // Prepare chart data (group by date)
    const dateMap = new Map<string, { clicks: number; views: number }>();
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { clicks: 0, views: 0 });
    }

    viewEvents.forEach(event => {
      const dateStr = new Date(event.created_at).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.views++;
      }
    });

    clickEvents.forEach(event => {
      const dateStr = new Date(event.created_at).toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr)!.clicks++;
      }
    });

    const chartDataArray = Array.from(dateMap.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...data
    }));
    setChartData(chartDataArray);

    // Calculate top links
    const linkClickMap = new Map<string, number>();
    clickEvents.forEach(event => {
      if (event.link_id) {
        linkClickMap.set(event.link_id, (linkClickMap.get(event.link_id) || 0) + 1);
      }
    });

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user?.id);

    const linksWithStats = (linksData || []).map(link => {
      const linkClicks = linkClickMap.get(link.id) || 0;
      const linkCtr = totalViews > 0 ? (linkClicks / totalViews) * 100 : 0;
      return {
        ...link,
        clicks: linkClicks,
        views: totalViews,
        ctr: linkCtr
      };
    }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    setTopLinks(linksWithStats);

    // Calculate traffic sources
    const sourceMap = new Map<string, number>();
    clickEvents.forEach(event => {
      let source = 'Direct';
      if (event.referrer) {
        try {
          const url = new URL(event.referrer);
          source = url.hostname.replace('www.', '');
        } catch {
          source = 'Direct';
        }
      } else if (event.utm_source) {
        source = event.utm_source;
      }
      sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
    });

    const sourcesArray = Array.from(sourceMap.entries())
      .map(([source, clicks]) => ({
        source,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    setTrafficSources(sourcesArray);
  };

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user?.id)
      .order('position', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
  };

  const getPlanName = () => {
    if (!subscriptionStatus?.subscribed) return 'Free';
    if (subscriptionStatus.product_id === 'prod_TLc8xSNHXDJoLm') return 'Pro';
    if (subscriptionStatus.product_id === 'prod_TLc9WRMahXD66M') return 'Business';
    return 'Free';
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg"></div>
            <h1 className="text-2xl font-bold">LinkPeek</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-lg text-muted-foreground">Here's your LinkPeek analytics overview</p>
        </div>

        {/* Time Range Toggle */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')} className="mb-8">
          <TabsList className="bg-card shadow-sm">
            <TabsTrigger value="7d" className="px-6">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d" className="px-6">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 animate-slide-up">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-sm font-medium">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                Page Views
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{metrics.views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total profile visits</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-sm font-medium">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MousePointerClick className="h-4 w-4 text-primary" />
                </div>
                Link Clicks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{metrics.clicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total link interactions</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-sm font-medium">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Click-Through Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{metrics.ctr}%</div>
              <p className="text-xs text-muted-foreground mt-1">Engagement ratio</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <div className="mb-10">
          <AnalyticsChart data={chartData} timeRange={timeRange} />
        </div>

        {/* Top Links & Traffic Sources */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <TopLinksTable links={topLinks} timeRange={timeRange} />
          <TrafficSources sources={trafficSources} timeRange={timeRange} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-primary" />
                Your Links
              </CardTitle>
              <CardDescription className="text-base">{links.length} active links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gradient-primary"
                size="lg"
                onClick={() => navigate('/settings/links')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Manage Links
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription
              </CardTitle>
              <CardDescription className="text-base">Current plan: <span className="font-semibold text-foreground">{getPlanName()}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => navigate('/billing')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
