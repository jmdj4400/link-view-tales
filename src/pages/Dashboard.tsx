import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Settings, Link as LinkIcon, CreditCard, Eye, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";

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
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

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
    setIsLoadingAnalytics(true);
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
    setIsLoadingAnalytics(false);
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
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Dashboard - LinkPeek"
        description="View your link analytics and manage your profile."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background sticky top-0 z-50" role="navigation" aria-label="Dashboard navigation">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-heading font-semibold">LinkPeek</h1>
            {subscriptionStatus?.subscribed && (
              <span className="hidden sm:inline-block px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                {getPlanName()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/billing')}>
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Billing</span>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings/profile')}>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-semibold mb-2">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Your analytics overview
          </p>
        </div>

        {/* Time Range Toggle */}
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')} className="mb-8">
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {isLoadingAnalytics ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-24 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            [
              {
                icon: Eye,
                label: "Page Views",
                value: metrics.views,
                subtitle: "Total profile visits",
              },
              {
                icon: MousePointerClick,
                label: "Link Clicks",
                value: metrics.clicks,
                subtitle: "Total link interactions",
              },
              {
                icon: TrendingUp,
                label: "Click-Through Rate",
                value: `${metrics.ctr}%`,
                subtitle: "Engagement ratio",
              },
            ].map((metric, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <metric.icon className="h-4 w-4" />
                    {metric.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{metric.subtitle}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Analytics Chart */}
        <div className="mb-8">
          <AnalyticsChart data={chartData} timeRange={timeRange} />
        </div>

        {/* Top Links & Traffic Sources */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <TopLinksTable links={topLinks} timeRange={timeRange} />
          <TrafficSources sources={trafficSources} timeRange={timeRange} />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Your Links
              </CardTitle>
              <CardDescription>
                {links.length} active {links.length === 1 ? 'link' : 'links'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => navigate('/settings/links')}
              >
                Manage Links
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>
                Current plan: {getPlanName()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/billing')}
              >
                Manage Billing
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA for Free Users */}
        {!subscriptionStatus?.subscribed && (
          <Card className="mt-8 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold">
                Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Get unlimited links, extended analytics, and remove branding
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/billing')}
              >
                View Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
}
