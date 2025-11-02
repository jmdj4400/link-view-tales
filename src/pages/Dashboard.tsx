import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, Link as LinkIcon, CreditCard, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, signOut, loading, subscriptionStatus, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [metrics, setMetrics] = useState({ views: 0, clicks: 0, ctr: 0 });
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
      fetchMetrics();
      fetchLinks();
    }
  }, [user]);

  const fetchMetrics = async () => {
    const { data, error } = await supabase
      .from('metrics_daily')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })
      .limit(7);

    if (!error && data) {
      const totalViews = data.reduce((sum, m) => sum + (m.page_views || 0), 0);
      const totalClicks = data.reduce((sum, m) => sum + (m.clicks || 0), 0);
      const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
      setMetrics({ views: totalViews, clicks: totalClicks, ctr: Math.round(ctr * 10) / 10 });
    }
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">LinkPeek</h1>
          <div className="flex items-center gap-2">
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's your LinkPeek overview</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Page Views (7d)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.views}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Link Clicks (7d)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.clicks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                CTR (7d)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.ctr}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Links</CardTitle>
              <CardDescription>{links.length} active links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/settings/links')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Manage Links
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Current plan: {getPlanName()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
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
