import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { LogOut, Settings, Link as LinkIcon, CreditCard, Eye, MousePointerClick, TrendingUp, ArrowRight, Download, Plus, BarChart3, Palette, Users, Target, Zap, Mail, FileDown, Sparkles, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopLinksTable } from "@/components/analytics/TopLinksTable";
import { TrafficSources } from "@/components/analytics/TrafficSources";
import { DeviceBrowserStats } from "@/components/analytics/DeviceBrowserStats";
import { CountryStats } from "@/components/analytics/CountryStats";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { ComparisonMetrics } from "@/components/analytics/ComparisonMetrics";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ProfileCompleteness } from "@/components/profile/ProfileCompleteness";
import { SetupBanner } from "@/components/profile/SetupBanner";
import { getDeviceType, getBrowserName, convertToCSV, downloadCSV, formatAnalyticsForCSV } from "@/lib/analytics-utils";
import { exportAnalyticsToPDF } from "@/lib/pdf-export";
import { triggerSuccessConfetti } from "@/lib/success-animations";
import { useRealtimeEvents } from "@/hooks/use-realtime-events";
import { logger } from "@/lib/logger";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { useCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/ui/keyboard-shortcuts-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UsageIndicator } from "@/components/ui/usage-indicator";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { FirewallStats } from "@/components/analytics/FirewallStats";
import { IncidentRadar } from "@/components/analytics/IncidentRadar";
import { PlanBadge } from "@/components/ui/plan-badge";
import { TrialCountdownBanner } from "@/components/ui/trial-countdown-banner";
import { PageHeader } from "@/components/ui/page-header";
import { AdminNav } from "@/components/navigation/AdminNav";
import { useUserRoles } from "@/hooks/use-user-roles";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { TrustModal } from "@/components/ui/trust-modal";
import { generateDemoLink } from "@/lib/demo-data-generator";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  useCommonShortcuts();
  const { user, signOut, loading, subscriptionStatus, refreshSubscription } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [metrics, setMetrics] = useState({ 
    views: 0, 
    clicks: 0, 
    ctr: 0, 
    integrityScore: 0, 
    recoveredClicks: 0, 
    inAppBrowserPercent: 0 
  });
  const [chartData, setChartData] = useState<Array<{ date: string; clicks: number; views: number }>>([]);
  const [topLinks, setTopLinks] = useState<Array<any>>([]);
  const [trafficSources, setTrafficSources] = useState<Array<any>>([]);
  const [links, setLinks] = useState([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [deviceStats, setDeviceStats] = useState<Array<{ type: string; count: number; percentage: number }>>([]);
  const [browserStats, setBrowserStats] = useState<Array<{ name: string; count: number; percentage: number }>>([]);
  const [countryStats, setCountryStats] = useState<Array<{ country: string; count: number; percentage: number }>>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showSetupBanner, setShowSetupBanner] = useState(false);
  const [profileHandle, setProfileHandle] = useState("");
  const [comparisonMode, setComparisonMode] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState({ 
    views: 0, 
    clicks: 0, 
    ctr: 0, 
    integrityScore: 0, 
    recoveredClicks: 0, 
    inAppBrowserPercent: 0 
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkSetupStatus();
      checkOnboarding();
    }
  }, [user, loading, navigate]);

  const checkOnboarding = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('id', user?.id)
        .single();

      if (!profile?.onboarding_completed_at) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding:", error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchAnalytics();
  };

  const checkSetupStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('instagram_bio_setup_completed, setup_guide_dismissed, handle, onboarding_completed_at')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfileHandle(data.handle || '');
      // Show banner if onboarding is complete but Instagram setup is not
      const shouldShow = data.onboarding_completed_at && 
                        !data.instagram_bio_setup_completed && 
                        !data.setup_guide_dismissed;
      setShowSetupBanner(!!shouldShow);
    }
  };

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
      fetchProfile();
      if (comparisonMode) {
        fetchPreviousPeriodAnalytics();
      }
    }
  }, [user, dateRange, comparisonMode]);

  // Real-time updates
  const handleRealtimeUpdate = useCallback(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  useRealtimeEvents({ userId: user?.id, onUpdate: handleRealtimeUpdate });

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.id) return;
    
    setIsLoadingAnalytics(true);

    // Fetch events (excluding bots)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_bot', false)
      .gte('created_at', dateRange.from.toISOString())
      .lte('created_at', dateRange.to.toISOString());

    if (eventsError) {
      logger.error('Error fetching events', eventsError);
      toast.error('Failed to load analytics data');
      setIsLoadingAnalytics(false);
      return;
    }

    // Fetch redirects for integrity and recovery metrics
    const { data: redirects } = await supabase
      .from('redirects')
      .select('*')
      .eq('link_id', user.id)
      .gte('ts', dateRange.from.toISOString())
      .lte('ts', dateRange.to.toISOString());

    // Calculate metrics
    const viewEvents = events?.filter(e => e.event_type === 'view') || [];
    const clickEvents = events?.filter(e => e.event_type === 'click') || [];
    const totalViews = viewEvents.length;
    const totalClicks = clickEvents.length;
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    // Calculate integrity score
    const successfulRedirects = redirects?.filter(r => r.success).length || 0;
    const totalRedirects = redirects?.length || 0;
    const integrityScore = totalRedirects > 0 
      ? Math.round((successfulRedirects / totalRedirects) * 100) 
      : 100;
    
    // Calculate recovered clicks
    const recoveredClicks = redirects?.filter(r => r.recovery_strategy_used && r.success).length || 0;
    
    // Calculate in-app browser percentage
    const inAppBrowserClicks = redirects?.filter(r => r.in_app_browser_detected).length || 0;
    const inAppBrowserPercent = totalRedirects > 0 
      ? Math.round((inAppBrowserClicks / totalRedirects) * 100) 
      : 0;
    
    setMetrics({ 
      views: totalViews, 
      clicks: totalClicks, 
      ctr: Math.round(ctr * 10) / 10,
      integrityScore,
      recoveredClicks,
      inAppBrowserPercent
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
      .eq('user_id', user.id);

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
    
    // Calculate device statistics
    const deviceMap = new Map<string, number>();
    clickEvents.forEach(event => {
      const userAgent = event.user_agent_hash ? atob(event.user_agent_hash) : '';
      const deviceType = getDeviceType(userAgent);
      deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1);
    });

    const deviceArray = Array.from(deviceMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    setDeviceStats(deviceArray);

    // Calculate browser statistics
    const browserMap = new Map<string, number>();
    clickEvents.forEach(event => {
      const userAgent = event.user_agent_hash ? atob(event.user_agent_hash) : '';
      const browser = getBrowserName(userAgent);
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });

    const browserArray = Array.from(browserMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    setBrowserStats(browserArray);

    // Calculate country statistics
    const countryMap = new Map<string, number>();
    clickEvents.forEach(event => {
      const country = event.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });

    const countryArray = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: totalClicks > 0 ? (count / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries
    
    setCountryStats(countryArray);
    
    setIsLoadingAnalytics(false);
  };

  const fetchLinks = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
  };

  const getPlanName = () => {
    // Check profile plan first (for manually set plans or trials)
    if (profile?.plan === 'pro') return 'Pro';
    if (profile?.plan === 'business') return 'Business';
    
    // Then check Stripe subscription
    if (!subscriptionStatus?.subscribed) return 'Free';
    if (subscriptionStatus.product_id === 'prod_TLc8xSNHXDJoLm') return 'Pro';
    if (subscriptionStatus.product_id === 'prod_TLc9WRMahXD66M') return 'Business';
    return 'Free';
  };

  const isPaidUser = () => {
    // User is paid if they have a non-free plan in profile OR active Stripe subscription
    return (profile?.plan && profile.plan !== 'free') || subscriptionStatus?.subscribed;
  };

  const fetchPreviousPeriodAnalytics = async () => {
    if (!user?.id) return;
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    const previousFrom = new Date(dateRange.from);
    previousFrom.setDate(previousFrom.getDate() - daysDiff);
    const previousTo = new Date(dateRange.from);

    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_bot', false)
      .gte('created_at', previousFrom.toISOString())
      .lt('created_at', previousTo.toISOString());

    const viewEvents = events?.filter(e => e.event_type === 'view') || [];
    const clickEvents = events?.filter(e => e.event_type === 'click') || [];
    const totalViews = viewEvents.length;
    const totalClicks = clickEvents.length;
    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    setPreviousMetrics({ 
      views: totalViews, 
      clicks: totalClicks, 
      ctr: Math.round(ctr * 10) / 10,
      integrityScore: 0,
      recoveredClicks: 0,
      inAppBrowserPercent: 0
    });
  };

  const handleExportCSV = () => {
    try {
      const formattedData = formatAnalyticsForCSV(chartData, topLinks, trafficSources);
      
      const overviewCSV = convertToCSV(formattedData.overview, ['Date', 'Page Views', 'Link Clicks']);
      const dateStr = `${dateRange.from.toISOString().split('T')[0]}_${dateRange.to.toISOString().split('T')[0]}`;
      downloadCSV(`linkpeek-analytics-${dateStr}.csv`, overviewCSV);
      
      triggerSuccessConfetti();
      toast.success('Analytics exported successfully');
    } catch (error) {
      logger.error('Failed to export analytics', error);
      toast.error('Failed to export analytics');
    }
  };

  const handleExportPDF = () => {
    try {
      exportAnalyticsToPDF({
        dateRange,
        metrics,
        chartData,
        topLinks,
        trafficSources,
        deviceStats,
        browserStats,
      }, 'Dashboard Analytics Report');
      
      triggerSuccessConfetti();
      toast.success('PDF report generated successfully');
    } catch (error) {
      logger.error('Failed to export PDF', error);
      toast.error('Failed to export PDF');
    }
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
        <KeyboardShortcutsDialog />
        {/* Navigation */}
        <nav className="border-b bg-background sticky top-0 z-50" role="navigation" aria-label="Dashboard navigation">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="LinkPeek Logo" className="h-6 sm:h-7" />
            {subscriptionStatus?.subscribed ? (
              <PlanBadge plan={getPlanName()} className="hidden sm:inline-flex" />
            ) : (
              <PlanBadge plan="free" className="hidden sm:inline-flex" />
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {isAdmin && <AdminNav />}
            <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')} className="px-2 sm:px-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Profile analytics</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings/profile')} className="px-2 sm:px-3">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Settings</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="px-2 sm:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Sign out</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <BreadcrumbNav />
        {/* Header */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-1">
                  Dashboard
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Traffic overview and performance metrics
                </p>
              </div>
              {subscriptionStatus?.subscribed && (
                <div className="hidden md:block">
                  <PlanBadge plan={getPlanName()} showIcon={true} />
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="comparison-mode"
                  checked={comparisonMode}
                  onCheckedChange={setComparisonMode}
                />
                <Label htmlFor="comparison-mode" className="text-xs sm:text-sm cursor-pointer whitespace-nowrap">
                  Compare
                </Label>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isLoadingAnalytics || chartData.length === 0}
                className="text-xs sm:text-sm"
              >
                <FileDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isLoadingAnalytics || chartData.length === 0}
                className="text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrustModal(true)}
                className="text-xs sm:text-sm"
              >
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">How we measure</span>
                <span className="sm:hidden">Help</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Setup Banner */}
        {showSetupBanner && (
          <div className="mb-8">
            <SetupBanner
              userId={user!.id}
              profileUrl={`${window.location.origin}/${profileHandle}`}
              onDismiss={() => setShowSetupBanner(false)}
            />
          </div>
        )}

        {/* Trial Countdown Banner */}
        {subscriptionStatus?.subscribed && 
         subscriptionStatus?.status === 'trialing' && 
         subscriptionStatus?.trial_days_remaining !== undefined &&
         subscriptionStatus?.trial_end_date && (
          <div className="mb-8">
            <TrialCountdownBanner 
              trialDaysRemaining={subscriptionStatus.trial_days_remaining}
              planName={getPlanName()}
              trialEndDate={subscriptionStatus.trial_end_date}
            />
          </div>
        )}

        {/* Usage & Upgrade Section for Free Users */}
        {!isPaidUser() && (
          <div className="mb-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">You're on the Free Plan</CardTitle>
                    <CardDescription>Upgrade to unlock premium features</CardDescription>
                  </div>
                  <PlanBadge plan="free" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <UsageIndicator
                  current={links.length}
                  limit={5}
                  label="Active links"
                />
                {links.length >= 4 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <p className="text-sm text-warning-foreground font-medium mb-2">
                      ⚠️ You're almost at your link limit!
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upgrade to Pro for unlimited links, advanced analytics, A/B testing, and more.
                    </p>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/billing')}
                      className="w-full"
                    >
                      View Plans & Pricing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Date Range Picker */}
        <div className="mb-8">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {/* Comparison Metrics or Regular Metrics */}
        {comparisonMode && !isLoadingAnalytics ? (
          <div className="mb-8">
            <ComparisonMetrics
              currentMetrics={metrics}
              previousMetrics={previousMetrics}
            />
          </div>
        ) : (
          <div className="space-y-2 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
...
            </div>
            <p className="text-xs text-muted-foreground text-center pt-1">
              Measured from real delivered visits — not platform-reported taps.
            </p>
          </div>
        )}

        {/* Analytics Chart or Empty State */}
        {metrics.views === 0 && metrics.clicks === 0 ? (
          <Card className="mb-10 border-2 p-4">
            <EmptyState
              icon={BarChart3}
              title="No clicks yet"
              description="No clicks yet — share your link to see redirect health and delivered traffic."
              action={{
                label: "View your profile",
                onClick: () => {
                  if (profileHandle) {
                    window.open(`/${profileHandle}`, '_blank');
                  } else {
                    toast.error('Profile handle not loaded yet');
                  }
                }
              }}
            />
          </Card>
        ) : (
          <>
            <div className="mb-10">
              <AnalyticsChart data={chartData} />
            </div>

            {/* Top Links & Traffic Sources */}
            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              <TopLinksTable links={topLinks} />
              <TrafficSources sources={trafficSources} />
            </div>

            {/* Device, Browser & Country Stats */}
            <div className="mb-10">
              <DeviceBrowserStats deviceStats={deviceStats} browserStats={browserStats} />
            </div>

            <div className="mb-10">
              <CountryStats countryStats={countryStats} />
            </div>

            {/* Pro Features - Traffic Firewall & Incident Monitoring */}
            {isPaidUser() && (
              <>
                <div className="mb-6">
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg">Premium Features</CardTitle>
                        </div>
                        <PlanBadge plan={getPlanName()} />
                      </div>
                      <CardDescription>
                        Advanced monitoring and protection for your links
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  <FirewallStats />
                  <IncidentRadar />
                </div>
              </>
            )}
          </>
        )}

        {/* Profile Completeness & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {profile && (
            <ProfileCompleteness profile={profile} linksCount={links.length} />
          )}

          <div className={profile ? "lg:col-span-2 grid md:grid-cols-4 gap-6" : "grid md:grid-cols-4 gap-6"}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Your Links
              </CardTitle>
              <CardDescription>
                {links.length === 0 ? (
                  <span className="text-destructive font-medium">No links yet - add your first link!</span>
                ) : (
                  <span>{links.length} active {links.length === 1 ? 'link' : 'links'}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <Button
                  className="w-full gradient-primary shadow-elegant"
                  onClick={() => navigate('/settings/links')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Link
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => navigate('/settings/links')}
                >
                  Manage Links
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Traffic Intelligence
              </CardTitle>
              <CardDescription>
                Flow analysis & AI optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/insights')}
              >
                View Insights
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Lead Generation
              </CardTitle>
              <CardDescription>
                Collect leads with custom forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/settings/leads')}
              >
                Manage Leads
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Palette className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Theme & design</CardTitle>
                  <CardDescription className="text-xs">Customize appearance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings/theme')}
              >
                Customize theme
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Conversions</CardTitle>
                  <CardDescription className="text-xs">Track goals and conversions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings/conversions')}
              >
                Manage Goals
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Subscription</CardTitle>
                  <CardDescription className="text-xs">Current plan: {getPlanName()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => navigate('/billing')}
              >
                Manage billing
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPaidUser() && (
          <Card className="mt-8 border-2 border-primary/50 gradient-subtle">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-heading font-bold mb-2">
                Unlock the full potential
              </CardTitle>
              <CardDescription className="text-base">
                Get unlimited links, 90-day analytics history, and remove branding
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/billing')}
                className="gradient-primary shadow-elegant text-base px-8"
              >
                Upgrade to Pro
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                From $9/month • No long-term commitment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

    {/* Onboarding Modal */}
    <OnboardingModal
      open={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      onComplete={handleOnboardingComplete}
    />

    {/* Trust Modal */}
    <TrustModal
      open={showTrustModal}
      onClose={() => setShowTrustModal(false)}
    />
  </>
  );
}
