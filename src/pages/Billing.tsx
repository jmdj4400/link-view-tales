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
    return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshSubscription}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold mb-2">Billing & Plans</h1>
          <p className="text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        {subscriptionStatus?.subscribed && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>
                You're on the {Object.values(PLANS).find(p => p.productId === currentPlan)?.name || 'Free'} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionStatus.subscription_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <Calendar className="h-4 w-4" />
                  <span>Renews on {format(new Date(subscriptionStatus.subscription_end), 'MMMM d, yyyy')}</span>
                </div>
              )}
              <Button 
                onClick={handleManageSubscription} 
                disabled={isLoading === 'portal'}
              >
                {isLoading === 'portal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = plan.productId === currentPlan;
            return (
              <Card 
                key={key} 
                className={isCurrent ? "border-2 border-primary" : ""}
              >
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Current Plan
                  </div>
                )}
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="pt-4">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || isLoading === key}
                    onClick={() => handleCheckout(plan.priceId, key)}
                  >
                    {isLoading === key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
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
