import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2, RefreshCw, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const PLANS = {
  pro: {
    name: "Pro",
    price: "39 DKK",
    priceId: "price_1SOuubFmM9HF7Fk31nMk3kIe",
    productId: "prod_TLc8xSNHXDJoLm",
    features: [
      "Unlimited links",
      "90 days data history",
      "Advanced analytics & CSV export",
      "Remove LinkPeek branding",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    price: "99 DKK",
    priceId: "price_1SOuvFFmM9HF7Fk3KZ2I0CHV",
    productId: "prod_TLc9WRMahXD66M",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom domain",
      "Real-time alerts",
      "API access",
    ],
  },
};

export default function Billing() {
  const { user, loading, subscriptionStatus, session, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleCheckout = async (priceId: string, planKey: string) => {
    setIsLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session');
    }
    setIsLoading(null);
  };

  const handleManageSubscription = async () => {
    setIsLoading('portal');
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open customer portal');
    }
    setIsLoading(null);
  };

  const currentPlan = subscriptionStatus?.product_id || 'free';

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshSubscription}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Billing & Plans</h1>
          <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        {subscriptionStatus?.subscribed && (
          <Card className="mb-12 border-2 border-primary shadow-elegant animate-fade-in">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Current Subscription
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    You're on the <span className="font-semibold text-foreground">{Object.values(PLANS).find(p => p.productId === currentPlan)?.name || 'Free'}</span> plan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus.subscription_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>Renews on {format(new Date(subscriptionStatus.subscription_end), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <Button 
                onClick={handleManageSubscription} 
                disabled={isLoading === 'portal'}
                className="gradient-primary"
                size="lg"
              >
                {isLoading === 'portal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = plan.productId === currentPlan;
            const isPro = key === 'pro';
            return (
              <Card 
                key={key} 
                className={`relative transition-all hover:shadow-elegant-xl ${
                  isCurrent 
                    ? "border-2 border-primary shadow-elegant" 
                    : isPro 
                    ? "border-2 border-primary/50 shadow-elegant scale-105" 
                    : "border-2"
                } animate-fade-in`}
              >
                {isPro && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                {isCurrent && (
                  <div className="gradient-primary text-white text-center py-2 text-sm font-semibold">
                    ✓ Your Current Plan
                  </div>
                )}
                <CardHeader className="pb-8 pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="pt-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 text-base ${isPro && !isCurrent ? "gradient-primary" : ""}`}
                    variant={isPro && !isCurrent ? "default" : isCurrent ? "outline" : "outline"}
                    size="lg"
                    disabled={isCurrent || isLoading === key}
                    onClick={() => handleCheckout(plan.priceId, key)}
                  >
                    {isLoading === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isCurrent ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
