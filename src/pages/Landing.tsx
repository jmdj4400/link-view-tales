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
      price: "0 DKK",
      description: "Perfect to start tracking",
      features: [
        "Up to 3 active links",
        "7 days analytics history",
        "Basic click tracking",
        "LinkPeek branding",
      ],
      cta: user ? "Current Plan" : "Start Free",
      featured: false,
    },
    {
      name: "Pro",
      price: "39 DKK",
      period: "/month",
      description: "For creators who care about data",
      features: [
        "Unlimited links",
        "90 days analytics history",
        "Advanced analytics & CSV export",
        "Remove branding",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      featured: true,
    },
    {
      name: "Business",
      price: "99 DKK",
      period: "/month",
      description: "Built for teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom domain support",
        "Real-time alerts",
        "Full API access",
      ],
      cta: "Go Business",
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-sm bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 gradient-primary rounded-xl shadow-md"></div>
            <h1 className="text-2xl font-heading font-bold">LinkPeek</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => navigate('/dashboard')} size="lg" className="gradient-primary shadow-md">
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')}>Sign In</Button>
                <Button onClick={() => navigate('/auth')} size="lg" className="gradient-primary shadow-md">
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section - Asymmetric Layout */}
      <section className="container mx-auto px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-2">
              <Sparkles className="h-4 w-4" />
              Complete setup in under 60 seconds
            </div>
            <h2 className="text-5xl lg:text-6xl font-heading font-bold leading-[1.1]">
              Your bio deserves<br />
              <span className="gradient-primary bg-clip-text text-transparent">better data</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              See where your clicks come from — not just how many. Fast, focused, and built for creators who care about analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')} 
                className="gradient-primary shadow-elegant hover:shadow-elegant-xl group"
              >
                <Zap className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Try 60-Second Setup
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Start Free
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Complete setup in under 60 seconds → Get 1 month Pro free
            </p>
          </motion.div>

          {/* Right: Visual Element */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elegant-xl border-2 border-border">
              <div className="bg-gradient-primary p-8 lg:p-12">
                <div className="space-y-4">
                  <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Total Clicks</p>
                        <p className="text-white text-2xl font-bold">2,847</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <p className="text-white/80 text-sm mb-2">Top performing link</p>
                    <p className="text-white font-semibold">Instagram Profile</p>
                    <p className="text-white/60 text-sm mt-1">847 clicks • 29% CTR</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features - Asymmetric Grid */}
      <section className="container mx-auto px-6 py-16 lg:py-20">
        <motion.div 
          className="text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
            Built different by design
          </h2>
          <p className="text-lg text-muted-foreground">
            No bloat. No unnecessary features. Just what you need to understand your audience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: LinkIcon,
              title: "Setup in seconds",
              description: "Add your links, share your page. Zero complexity, maximum speed.",
              delay: 0,
            },
            {
              icon: BarChart3,
              title: "Analytics that matter",
              description: "Track clicks, sources, and CTR. Real insights, not vanity metrics.",
              delay: 0.1,
            },
            {
              icon: Zap,
              title: "Privacy first",
              description: "GDPR compliant from day one. No cookies, no tracking scripts.",
              delay: 0.2,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-elegant hover-scale h-full">
                <CardHeader>
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-6 py-16 lg:py-20">
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl lg:text-5xl font-heading font-bold">
            Simple pricing, no surprises
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free. Upgrade when your audience grows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full flex flex-col ${
                  plan.featured 
                    ? "border-2 border-primary shadow-elegant-xl scale-[1.02]" 
                    : "border-2 hover:border-primary/30 transition-all"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="gradient-primary text-white px-5 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="pb-8 pt-8">
                  <CardTitle className="text-2xl font-heading">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-6">
                    <span className="text-5xl font-heading font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.featured ? "gradient-primary shadow-md hover:shadow-lg" : ""}`}
                    variant={plan.featured ? "default" : "outline"}
                    size="lg"
                    onClick={() => navigate(user ? '/billing' : '/auth')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-card">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 gradient-primary rounded-lg shadow-md"></div>
              <span className="font-heading font-semibold text-lg">LinkPeek</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LinkPeek. Built for creators, by creators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
