import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Check, Sparkles, Zap, Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    period: "forever",
    features: [
      "1 link in bio page",
      "Basic analytics",
      "Up to 1,000 clicks/month",
      "LinkPeek branding",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro",
    description: "For serious creators",
    price: "$9",
    period: "/month",
    originalPrice: "$12",
    features: [
      "Unlimited link pages",
      "Advanced analytics",
      "Unlimited clicks",
      "Remove LinkPeek branding",
      "Custom domains",
      "In-app browser recovery",
      "Priority support",
      "A/B testing",
      "UTM tracking",
    ],
    cta: "Start Free Trial",
    popular: true,
    icon: Sparkles,
  },
  {
    name: "Business",
    description: "For teams and agencies",
    price: "$29",
    period: "/month",
    originalPrice: "$39",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "API access",
      "Multiple workspaces",
      "Advanced permissions",
      "Dedicated support",
      "Custom integrations",
      "SSO (coming soon)",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Building2,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Pricing - LinkPeek | Affordable Link in Bio Analytics"
        description="Simple, transparent pricing for LinkPeek. Start free, upgrade when you need more. Track real delivered visits and recover lost clicks from social traffic."
        canonicalUrl="https://link-peek.org/pricing"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-2 shadow-lg">
                <img src={logo} alt="LinkPeek" className="h-8" />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="container mx-auto px-6 py-16 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Badge variant="secondary" className="px-4 py-1">
              <Sparkles className="h-3 w-3 mr-2" />
              Launch Special: 30% off for early adopters
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">
              Simple,{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Transparent
              </span>{" "}
              Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-6 pb-24 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`relative h-full flex flex-col ${
                    plan.popular
                      ? "border-primary shadow-lg shadow-primary/10 scale-105"
                      : "border-border/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="pt-4">
                      {plan.originalPrice && (
                        <span className="text-muted-foreground line-through text-lg mr-2">
                          {plan.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-6">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => navigate("/auth")}
                      >
                        {plan.cta}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 pb-24 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Can I change plans later?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">What happens after my trial?</h3>
              <p className="text-muted-foreground text-sm">
                Your 30-day Pro trial gives you full access. After it ends, you can choose to subscribe or continue with the free plan.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Do you offer refunds?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">What makes LinkPeek different?</h3>
              <p className="text-muted-foreground text-sm">
                Unlike other link in bio tools, we show you real delivered visits—not platform-reported taps. We also recover clicks lost to in-app browser failures.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 max-w-7xl border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 LinkPeek. All rights reserved.
            </p>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
