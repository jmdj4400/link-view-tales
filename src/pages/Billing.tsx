import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Billing & Plans</h2>
          <p className="text-muted-foreground">Choose the plan that fits your needs</p>
        </div>

        {subscriptionStatus?.subscribed && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                You're on the {Object.values(PLANS).find(p => p.productId === currentPlan)?.name || 'Free'} plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleManageSubscription} disabled={isLoading === 'portal'}>
                {isLoading === 'portal' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => {
            const isCurrent = plan.productId === currentPlan;
            return (
              <Card key={key} className={isCurrent ? "border-primary" : ""}>
                {isCurrent && (
                  <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-semibold">
                    Current Plan
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    disabled={isCurrent || isLoading === key}
                    onClick={() => handleCheckout(plan.priceId, key)}
                  >
                    {isLoading === key ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
