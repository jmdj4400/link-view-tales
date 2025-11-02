import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart3, Link as LinkIcon, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "0 DKK",
      description: "Perfect for getting started",
      features: [
        "Up to 3 active links",
        "7 days data history",
        "Basic analytics",
        "LinkPeek branding",
      ],
      cta: user ? "Current Plan" : "Start Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "39 DKK",
      period: "/month",
      description: "For serious creators",
      features: [
        "Unlimited links",
        "90 days data history",
        "Advanced analytics & CSV export",
        "Remove LinkPeek branding",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      featured: true,
    },
    {
      name: "Business",
      price: "99 DKK",
      period: "/month",
      description: "For teams and businesses",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom domain",
        "Real-time alerts",
        "API access",
      ],
      cta: "Go Business",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">LinkPeek</h1>
          <div className="space-x-2">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button onClick={() => navigate('/auth')}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold">
            Link-in-Bio with<br />
            <span className="text-primary">Analytics That Matter</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Create your bio link in under 60 seconds and get insights that help you understand what works.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="gap-2">
              <Zap className="h-5 w-5" />
              1-Minute Setup Challenge
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Start Free
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Complete setup in under 60 seconds → Get 1 month Pro free 🚀
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <LinkIcon className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Simple Setup</CardTitle>
              <CardDescription>Add your links, share your page. No complexity.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Deep Analytics</CardTitle>
              <CardDescription>See clicks, sources, CTR and trends over time.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>GDPR Compliant</CardTitle>
              <CardDescription>No cookies. Privacy-first analytics.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Choose the plan that fits your needs</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.featured ? "border-primary shadow-lg" : ""}>
              {plan.featured && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => navigate(user ? '/billing' : '/auth')}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 LinkPeek. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
