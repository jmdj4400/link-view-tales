import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, Link as LinkIcon, CreditCard, Eye, MousePointerClick, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-2xl mx-auto animate-pulse"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-sm bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 gradient-primary rounded-xl shadow-md"></div>
            <h1 className="text-2xl font-heading font-bold">LinkPeek</h1>
          </motion.div>
          <div className="flex items-center gap-2">
            {subscriptionStatus?.subscribed && (
              <div className="hidden sm:flex items-center px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {getPlanName()}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/billing')}>
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Billing</span>
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings/profile')}>
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-3">
            Welcome back 👋
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's your LinkPeek analytics overview
          </p>
        </motion.div>

        {/* Time Range Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as '7d' | '30d')} className="mb-10">
            <TabsList className="bg-card shadow-md border">
              <TabsTrigger value="7d" className="px-6 font-medium">Last 7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="px-6 font-medium">Last 30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Eye,
              label: "Page Views",
              value: metrics.views,
              subtitle: "Total profile visits",
              delay: 0.2,
            },
            {
              icon: MousePointerClick,
              label: "Link Clicks",
              value: metrics.clicks,
              subtitle: "Total link interactions",
              delay: 0.25,
            },
            {
              icon: TrendingUp,
              label: "Click-Through Rate",
              value: `${metrics.ctr}%`,
              subtitle: "Engagement ratio",
              delay: 0.3,
            },
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: metric.delay }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant hover-scale">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-sm font-medium">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <metric.icon className="h-4 w-4 text-primary" />
                    </div>
                    {metric.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-heading font-bold">
                    {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{metric.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <AnalyticsChart data={chartData} timeRange={timeRange} />
        </motion.div>

        {/* Top Links & Traffic Sources */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <TopLinksTable links={topLinks} timeRange={timeRange} />
          <TrafficSources sources={trafficSources} timeRange={timeRange} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <LinkIcon className="h-5 w-5 text-primary" />
                Your Links
              </CardTitle>
              <CardDescription className="text-base">
                {links.length} active {links.length === 1 ? 'link' : 'links'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full gradient-primary shadow-md group"
                size="lg"
                onClick={() => navigate('/settings/links')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Manage Links
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription
              </CardTitle>
              <CardDescription className="text-base">
                Current plan: <span className="font-semibold text-foreground">{getPlanName()}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full group"
                size="lg"
                variant="outline"
                onClick={() => navigate('/billing')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upgrade CTA for Free Users */}
        {!subscriptionStatus?.subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="mt-12 border-2 border-primary shadow-elegant-xl gradient-accent">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
                  <Sparkles className="h-4 w-4" />
                  Unlock more with Pro
                </div>
                <CardTitle className="text-3xl font-heading font-bold">
                  See where your traffic comes from
                </CardTitle>
                <CardDescription className="text-base pt-2">
                  Get unlimited links, 90 days of analytics, and remove branding
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  className="gradient-primary shadow-md group"
                  size="lg"
                  onClick={() => navigate('/billing')}
                >
                  View Plans & Pricing
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
