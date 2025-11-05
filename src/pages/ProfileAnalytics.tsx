import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Download,
  Users,
  Share2,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { DeviceBrowserStats } from "@/components/analytics/DeviceBrowserStats";
import { CountryStats } from "@/components/analytics/CountryStats";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getDeviceType, getBrowserName, convertToCSV, downloadCSV, formatAnalyticsForCSV } from "@/lib/analytics-utils";
import { ProfileQRDialog } from "@/components/profile/ProfileQRDialog";
import { ReliabilityMetrics } from "@/components/analytics/ReliabilityMetrics";
import { ConversionMetrics } from "@/components/analytics/ConversionMetrics";
import { PageHeader } from "@/components/ui/page-header";
import { logger } from "@/lib/logger";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { useCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function ProfileAnalytics() {
  useCommonShortcuts();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [metrics, setMetrics] = useState({ 
    pageViews: 0, 
    linkClicks: 0, 
    uniqueVisitors: 0,
    ctr: 0 
  });
  const [chartData, setChartData] = useState<Array<{ date: string; clicks: number; views: number }>>([]);
  const [topLinks, setTopLinks] = useState<Array<any>>([]);
  const [trafficSources, setTrafficSources] = useState<Array<any>>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [deviceStats, setDeviceStats] = useState<Array<{ type: string; count: number; percentage: number }>>([]);
  const [browserStats, setBrowserStats] = useState<Array<{ name: string; count: number; percentage: number }>>([]);
  const [countryStats, setCountryStats] = useState<Array<{ country: string; count: number; percentage: number }>>([]);
  const [profile, setProfile] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchProfileAnalytics();
    }
  }, [user, dateRange]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchProfileAnalytics = async () => {
    setIsLoadingAnalytics(true);

    // Fetch all events for the user's public profile
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_bot', false)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    if (eventsError) {
      logger.error('Error fetching profile analytics events', eventsError);
      toast.error('Failed to load analytics data');
      setIsLoadingAnalytics(false);
      return;
    }

    // Separate page views and clicks
    const pageViewEvents = events?.filter(e => e.event_type === 'page_view') || [];
    const clickEvents = events?.filter(e => e.event_type === 'click') || [];
    
    const totalPageViews = pageViewEvents.length;
    const totalClicks = clickEvents.length;
    
    // Calculate unique visitors based on user_agent_hash
    const uniqueHashes = new Set(pageViewEvents.map(e => e.user_agent_hash).filter(Boolean));
    const uniqueVisitors = uniqueHashes.size;
    
    // Calculate CTR
    const ctr = totalPageViews > 0 ? (totalClicks / totalPageViews) * 100 : 0;
    
    setMetrics({ 
      pageViews: totalPageViews, 
      linkClicks: totalClicks,
      uniqueVisitors,
      ctr: Math.round(ctr * 10) / 10 
    });

    // Prepare chart data (group by date)
    const dateMap = new Map<string, { clicks: number; views: number }>();
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= days; i++) {
      const date = new Date(dateRange.from);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { clicks: 0, views: 0 });
    }

    pageViewEvents.forEach(event => {
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
      const linkCtr = totalPageViews > 0 ? (linkClicks / totalPageViews) * 100 : 0;
      return {
        ...link,
        clicks: linkClicks,
        views: totalPageViews,
        ctr: linkCtr
      };
    }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);

    setTopLinks(linksWithStats);

    // Calculate traffic sources
    const sourceMap = new Map<string, number>();
    [...pageViewEvents, ...clickEvents].forEach(event => {
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

    const totalEvents = pageViewEvents.length + clickEvents.length;
    const sourcesArray = Array.from(sourceMap.entries())
      .map(([source, clicks]) => ({
        source,
        clicks,
        percentage: totalEvents > 0 ? (clicks / totalEvents) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    setTrafficSources(sourcesArray);
    
    // Calculate device statistics
    const deviceMap = new Map<string, number>();
    pageViewEvents.forEach(event => {
      const userAgent = event.user_agent_hash ? atob(event.user_agent_hash) : '';
      const deviceType = getDeviceType(userAgent);
      deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);
    });

    const deviceArray = Array.from(deviceMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalPageViews > 0 ? (count / totalPageViews) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    setDeviceStats(deviceArray);

    // Calculate browser statistics
    const browserMap = new Map<string, number>();
    pageViewEvents.forEach(event => {
      const userAgent = event.user_agent_hash ? atob(event.user_agent_hash) : '';
      const browser = getBrowserName(userAgent);
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });

    const browserArray = Array.from(browserMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPageViews > 0 ? (count / totalPageViews) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    setBrowserStats(browserArray);

    // Calculate country statistics
    const countryMap = new Map<string, number>();
    pageViewEvents.forEach(event => {
      const country = event.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const countryArray = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalPageViews > 0 ? (count / totalPageViews) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    setCountryStats(countryArray);
    
    setIsLoadingAnalytics(false);
  };

  const handleExportCSV = () => {
    try {
      const formattedData = formatAnalyticsForCSV(chartData, topLinks, trafficSources);
      const overviewCSV = convertToCSV(formattedData.overview, ['Date', 'Page Views', 'Link Clicks']);
      const dateStr = `${dateRange.from.toISOString().split('T')[0]}_${dateRange.to.toISOString().split('T')[0]}`;
      downloadCSV(`profile-analytics-${dateStr}.csv`, overviewCSV);
      toast.success('Analytics exported successfully');
    } catch (error) {
      logger.error('Failed to export profile analytics', error);
      toast.error('Failed to export analytics');
    }
  };

  const profileUrl = profile ? `${window.location.origin}/@${profile.handle}` : '';

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Profile Analytics - LinkPeek"
        description="View your public profile analytics and visitor insights."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader 
          showBack 
          title="LinkPeek"
          actions={
            <Button 
              variant="outline" 
              size="sm"
                onClick={() => setQrDialogOpen(true)}
                aria-label="Share your profile"
              >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
          }
        />

        <div className="container mx-auto px-6 py-10 max-w-7xl">
          <BreadcrumbNav />
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-semibold mb-2">
                Profile Analytics
              </h1>
              <p className="text-muted-foreground">
                Track visitors and engagement on your public profile
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isLoadingAnalytics || chartData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Date Range Picker */}
          <div className="mb-8">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>

          {/* Performance & Reliability Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Performance & Reliability</h2>
            <ReliabilityMetrics />
          </div>

          {/* Conversion Metrics Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Conversion Tracking</h2>
            <ConversionMetrics />
          </div>

          {/* Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {isLoadingAnalytics ? (
              <>
                {[1, 2, 3, 4].map((i) => (
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
                  label: "Profile Views",
                  value: metrics.pageViews,
                  subtitle: "Total visits to your profile",
                  tooltip: "Number of times your public profile was viewed"
                },
                {
                  icon: Users,
                  label: "Unique Visitors",
                  value: metrics.uniqueVisitors,
                  subtitle: "Individual people who visited",
                  tooltip: "Unique visitors based on browser fingerprint"
                },
                {
                  icon: MousePointerClick,
                  label: "Link Clicks",
                  value: metrics.linkClicks,
                  subtitle: "Total link interactions",
                  tooltip: "Number of times your links were clicked"
                },
                {
                  icon: TrendingUp,
                  label: "Click-Through Rate",
                  value: `${metrics.ctr}%`,
                  subtitle: "Engagement ratio",
                  tooltip: "Percentage of visitors who clicked at least one link"
                },
              ].map((metric, index) => (
                <Card key={index} className="transition-all hover:shadow-elegant hover-scale border-2">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-sm font-medium">
                      <metric.icon className="h-4 w-4" />
                      {metric.label}
                      <InfoTooltip content={metric.tooltip} />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-heading font-bold bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                      {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{metric.subtitle}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Analytics Chart or Empty State */}
          {metrics.pageViews === 0 && metrics.linkClicks === 0 ? (
            <Card className="mb-8 border-2">
              <EmptyState
                icon={BarChart3}
                title="No profile data yet"
                description="Share your public profile link to start tracking visitors. Your insights will appear here once people visit your profile."
                action={profile ? {
                  label: "View Your Profile",
                  onClick: () => window.open(`/@${profile.handle}`, '_blank')
                } : undefined}
              />
            </Card>
          ) : (
            <>
              <div className="mb-8">
                <AnalyticsChart data={chartData} />
              </div>

              {/* Top Links & Traffic Sources */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <TopLinksTable links={topLinks} />
                <TrafficSources sources={trafficSources} />
              </div>

              {/* Device, Browser & Country Stats */}
              <div className="mb-8">
                <DeviceBrowserStats deviceStats={deviceStats} browserStats={browserStats} />
              </div>

              <div className="mb-8">
                <CountryStats countryStats={countryStats} />
              </div>
            </>
          )}
        </div>
      </div>

      {profile && (
        <ProfileQRDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          profileName={profile.name}
          profileHandle={profile.handle}
          profileUrl={profileUrl}
        />
      )}
    </>
  );
}
