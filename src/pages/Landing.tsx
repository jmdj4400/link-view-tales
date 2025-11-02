import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart3, Link as LinkIcon, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

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
            {user ? (
              <Button onClick={() => navigate('/dashboard')} size="lg" className="gradient-primary">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button onClick={() => navigate('/auth')} size="lg">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-4">
            <Zap className="h-4 w-4" />
            Complete setup in under 60 seconds
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
            Link-in-Bio with<br />
            <span className="gradient-primary bg-clip-text text-transparent">Analytics That Matter</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create your bio link in seconds and get insights that help you understand what works. GDPR-compliant, fast, and beautiful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg" onClick={() => navigate('/auth')} className="gradient-primary text-lg h-14 px-8 shadow-elegant hover:shadow-elegant-xl transition-all">
              <Zap className="h-5 w-5 mr-2" />
              1-Minute Setup Challenge
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg h-14 px-8">
              Start Free
            </Button>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            ⚡ Complete setup in under 60 seconds → Get 1 month Pro free
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <LinkIcon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Lightning Fast Setup</CardTitle>
              <CardDescription className="text-base">Add your links, share your page. No complexity, no bloat.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Deep Analytics</CardTitle>
              <CardDescription className="text-base">See clicks, sources, CTR and trends. Real data, actionable insights.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
              <CardDescription className="text-base">GDPR compliant. No cookies, no tracking scripts. Just clean analytics.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">Choose the plan that fits your needs. Upgrade anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.featured ? "border-2 border-primary shadow-elegant scale-105" : "border-2"} hover:shadow-elegant-xl transition-all`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="gradient-primary text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}
              <CardHeader className="pb-8 pt-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="pt-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
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
                  className={`w-full h-12 text-base ${plan.featured ? "gradient-primary" : ""}`}
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
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
      <footer className="border-t mt-24 bg-card">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 gradient-primary rounded-lg"></div>
            <span className="font-semibold">LinkPeek</span>
          </div>
          <p className="text-muted-foreground">© 2025 LinkPeek. All rights reserved.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Built with ❤️ for creators, by creators
          </p>
        </div>
      </footer>
    </div>
  );
}
