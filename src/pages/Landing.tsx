import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart3, Link as LinkIcon, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        "5 active links",
        "Basic click analytics",
        "LinkPeek subdomain",
        "Standard themes",
      ],
      cta: user ? "Current Plan" : "Start Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "9",
      description: "For creators and professionals",
      features: [
        "Unlimited links",
        "Advanced analytics & insights",
        "Custom domain connection",
        "Remove LinkPeek branding",
        "Priority email support",
        "Custom themes & colors",
      ],
      cta: "Start Pro Trial",
      featured: true,
    },
    {
      name: "Business",
      price: "29",
      description: "For growing teams",
      features: [
        "Everything in Pro",
        "Team collaboration (5 seats)",
        "API access",
        "Advanced integrations",
        "Dedicated account manager",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-xl font-heading font-semibold">LinkPeek</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => navigate('/dashboard')} variant="default">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Sign in</Button>
                <Button onClick={() => navigate('/auth')} variant="default">
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-24 pb-20 max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-semibold leading-[1.1] tracking-tight mb-6">
            Your Digital Hub for Every Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
            Share all your important links from one professional page. Track engagement, understand your audience, and grow your reach with real-time analytics.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')} 
              className="text-base"
            >
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-base">
              See How It Works
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day Pro trial included
          </p>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="container mx-auto px-6 pb-24 max-w-7xl">
        <div className="bg-card border rounded-lg p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-heading font-semibold mb-2">2,847</div>
              <div className="text-sm text-muted-foreground">Total clicks this month</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-semibold mb-2">64%</div>
              <div className="text-sm text-muted-foreground">From mobile devices</div>
            </div>
            <div>
              <div className="text-4xl font-heading font-semibold mb-2">12</div>
              <div className="text-sm text-muted-foreground">Active links</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-24 max-w-7xl border-t">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 leading-tight">
            Built for Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage and grow your online presence
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm mb-4">
              <BarChart3 className="h-4 w-4" />
              Real-Time Analytics
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-semibold mb-4 leading-tight">
              See exactly how your audience engages
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Track clicks, referral sources, and geographic data. Understand which platforms drive the most engagement and make data-driven decisions to optimize your content strategy.
            </p>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm mb-4">
              <LinkIcon className="h-4 w-4" />
              Unlimited Links
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-semibold mb-4 leading-tight">
              Add as many links as you need
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Organize your links with intuitive drag-and-drop ordering. Easily update, pause, or remove links anytime. No limits on Pro plan.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm mb-4">
                <Zap className="h-4 w-4" />
                Custom Branding
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-semibold mb-4 leading-tight">
                Match your brand perfectly
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Customize themes, colors, and fonts. Connect your own domain for a professional presence. Remove all LinkPeek branding on Pro plans.
              </p>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm mb-4">
                <Check className="h-4 w-4" />
                Privacy-First
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-semibold mb-4 leading-tight">
                GDPR compliant by default
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                No cookies. No third-party trackers. Your data stays private. Built with privacy regulations in mind from day one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-24 max-w-7xl border-t">
        <div className="max-w-2xl mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 leading-tight">
            Pricing That Scales With You
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you're ready. All plans include 14-day Pro trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-card border rounded-lg p-8 flex flex-col ${
                plan.featured ? "border-primary" : ""
              }`}
            >
              <div className="mb-8">
                <h3 className="text-lg font-heading font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-semibold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "default" : "outline"}
                className="w-full"
                onClick={() => navigate(user ? '/billing' : '/auth')}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-24 bg-muted/30">
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg"></div>
                <h3 className="font-heading font-semibold text-lg">LinkPeek</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional link management and analytics for creators, entrepreneurs, and brands
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-semibold">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Features</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Pricing</button></li>
                <li><button onClick={() => navigate('/auth')} className="hover:text-foreground transition-colors">Sign Up</button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-semibold">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Contact Support</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">API Documentation</button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-semibold">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LinkPeek. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
