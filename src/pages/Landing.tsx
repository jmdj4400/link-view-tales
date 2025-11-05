import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart3, Link as LinkIcon, Zap, Palette, Share2, Sparkles, TrendingUp, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/SEOHead";
import { useAggregateRecoveryStats } from "@/components/analytics/AggregateRecoveryStats";
import { Testimonials } from "@/components/landing/Testimonials";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const aggregateStats = useAggregateRecoveryStats();

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
    <>
      <SEOHead
        title="LinkPeek - Professional Link Management & Analytics Platform"
        description="Transform your online presence with LinkPeek. Create a beautiful landing page for all your links with powerful real-time analytics and insights. Start free today."
        canonicalUrl={`${window.location.origin}/`}
      />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <h1 className="text-xl font-heading font-semibold">LinkPeek</h1>
          </div>
          <div className="flex items-center gap-4">
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
        <section className="container mx-auto px-6 pt-24 pb-20 max-w-7xl" aria-labelledby="hero-heading">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-xs font-medium text-primary mb-6 animate-fade-in">
                <Zap className="h-3.5 w-3.5" />
                Traffic integrity: {aggregateStats.recoveryRate.toFixed(1)}% • +{aggregateStats.totalRecoveries} sessions recovered
              </div>
              <h2 id="hero-heading" className="text-5xl md:text-6xl font-heading font-bold leading-[1.1] tracking-tight mb-6 animate-fade-in">
                See every social click, and what it becomes
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-in">
                Reliable redirects, conversion tracking, and actionable insights — a cockpit for your social traffic.
              </p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-8 animate-fade-in">
                <p className="text-sm font-semibold text-primary mb-2">🎯 60-Second Setup Challenge</p>
                <p className="text-sm text-muted-foreground">
                  Complete your profile in under 60 seconds and get <span className="font-semibold text-foreground">1 month Pro free</span> — unlimited links, advanced analytics, and priority support.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 animate-fade-in">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="shadow-lg"
                >
                  Start 60s Challenge
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: document.getElementById('insights')?.offsetTop || 0, behavior: 'smooth' })}>
                  View insights
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground animate-fade-in">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span>60s setup</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <Card className="relative shadow-lg border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Flow integrity</CardTitle>
                      <span className="text-2xl font-bold text-foreground">{aggregateStats.recoveryRate.toFixed(1)}%</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Redirect success</span>
                        <span className="font-semibold">{aggregateStats.redirectSuccessRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${aggregateStats.redirectSuccessRate}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Click → Conversion</span>
                        <span className="font-semibold text-primary">+0.6%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">This week</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{aggregateStats.totalRecoveries}</span>
                        <span className="text-sm text-muted-foreground">sessions recovered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section id="insights" className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="insights-heading">
          <div className="max-w-2xl mb-12 mx-auto text-center">
            <h2 id="insights-heading" className="text-3xl md:text-4xl font-heading font-bold mb-3 leading-tight">
              Professional social traffic intelligence
            </h2>
            <p className="text-base text-muted-foreground">
              Built for creators and teams who need reliable data and actionable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Redirect reliability',
                value: `${aggregateStats.redirectSuccessRate.toFixed(1)}%`,
                description: 'Works inside Instagram, TikTok, and LinkedIn in-app browsers',
                trend: '+2.1%'
              },
              {
                title: 'Sessions recovered',
                value: aggregateStats.totalRecoveries.toString(),
                description: 'Traffic saved from WebView failures this week',
                trend: '+47'
              },
              {
                title: 'Click → conversion rate',
                value: '2.4%',
                description: 'End-to-end attribution from social to goal completion',
                trend: '+0.6%'
              }
            ].map((item, i) => (
              <Card key={i} className="border hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.title}</div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">{item.value}</div>
                    <div className="text-sm font-medium text-primary">{item.trend}</div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t bg-muted/30" aria-labelledby="how-it-works-heading">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-heading font-bold mb-3 leading-tight">How it works</h2>
            <p className="text-base text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Create your profile</h3>
              <p className="text-muted-foreground leading-relaxed">Sign up and add your links in seconds. Customize your profile to match your brand.</p>
            </Card>
            <Card className="text-center p-8 border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Copy your unique URL</h3>
              <p className="text-muted-foreground leading-relaxed">Get your personalized LinkPeek URL. It's short, clean, and professional.</p>
            </Card>
            <Card className="text-center p-8 border hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">Add to your bio</h3>
              <p className="text-muted-foreground leading-relaxed">Paste your LinkPeek URL in Instagram, TikTok, or any social platform. Start tracking immediately.</p>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="features-heading">
          <div className="max-w-2xl mb-12 text-center mx-auto">
            <h2 id="features-heading" className="text-3xl md:text-4xl font-heading font-bold mb-3 leading-tight">
              Data-centric features
            </h2>
            <p className="text-base text-muted-foreground">
              Everything you need to understand and optimize your social traffic
            </p>
          </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: TrendingUp,
              title: 'Flow visualization',
              description: 'See exactly where sessions drop between click and conversion'
            },
            {
              icon: BarChart3,
              title: 'Channel benchmarks',
              description: 'Compare your performance vs network averages per platform'
            },
            {
              icon: Sparkles,
              title: 'Smart recommendations',
              description: 'AI-powered optimization suggestions based on your data'
            },
            {
              icon: Zap,
              title: 'WebView recovery',
              description: 'Automatic fallback for in-app browser redirect failures'
            },
            {
              icon: Target,
              title: 'Conversion tracking',
              description: 'Pixel and webhook-based goal tracking with attribution'
            },
            {
              icon: Share2,
              title: 'UTM builder',
              description: 'Campaign parameter management and source tracking'
            },
            {
              icon: LinkIcon,
              title: 'QR codes',
              description: 'Generate codes for offline-to-online tracking'
            },
            {
              icon: Check,
              title: 'Privacy-first',
              description: 'GDPR compliant with no cookies or tracking pixels'
            }
          ].map((feature, index) => (
            <Card key={index} className="border hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="cta-heading">
          <div className="relative overflow-hidden">
            <Card className="relative border shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl md:text-3xl font-heading font-bold mb-3">
                  Start tracking what matters
                </CardTitle>
                <CardDescription className="text-base max-w-xl mx-auto">
                  Join creators and teams using LinkPeek to understand and optimize their social traffic
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 pb-8">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                    View demo
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                  <span>No credit card required</span>
                  <span>•</span>
                  <span>60-second setup</span>
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="faq-heading">
          <div className="max-w-2xl mb-16 text-center mx-auto">
            <h2 id="faq-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about LinkPeek
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "What is LinkPeek?",
                answer: "LinkPeek is a professional link management platform that lets you create a beautiful landing page for all your links with powerful real-time analytics. Track clicks, views, traffic sources, and more to understand your audience better."
              },
              {
                question: "How does the 60-second setup challenge work?",
                answer: "Complete your profile setup in under 60 seconds during onboarding and get a free 1-month Pro trial! This includes adding your name, bio, and first link. The timer starts when you begin the onboarding flow."
              },
              {
                question: "Is LinkPeek free to use?",
                answer: "Yes! LinkPeek offers a free plan with 5 active links and basic analytics. Upgrade to Pro for unlimited links, advanced analytics, custom domains, and more features. No credit card required to start."
              },
              {
                question: "How accurate is the analytics tracking?",
                answer: "LinkPeek uses privacy-first analytics that are highly accurate. We filter out bot traffic and provide real-time data on clicks, page views, device types, browsers, geographic locations, and traffic sources."
              },
              {
                question: "Can I use my own domain?",
                answer: "Yes! Pro and Business plans allow you to connect your custom domain (e.g., links.yourdomain.com) instead of using the LinkPeek subdomain. This provides better branding and professionalism."
              },
              {
                question: "What's included in the Pro plan?",
                answer: "Pro includes unlimited links, advanced analytics with detailed insights, custom domain connection, QR code generation, UTM tracking, link scheduling, click limits, and removal of LinkPeek branding."
              },
              {
                question: "Is my data secure and private?",
                answer: "Absolutely. LinkPeek is GDPR compliant and uses no tracking cookies or pixels. We only collect essential analytics data to provide you with insights. Your data is encrypted and never shared with third parties."
              },
              {
                question: "Can I export my analytics data?",
                answer: "Yes! All plans include CSV export functionality. You can download your analytics data for further analysis in spreadsheet tools or your own analytics platform."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="pricing-heading">
          <div className="max-w-2xl mb-16 text-center mx-auto">
            <h2 id="pricing-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you're ready
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
                  <span className="text-muted-foreground" aria-label="per month">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className="w-full"
                  onClick={() => navigate(user ? '/billing' : '/auth')}
                  aria-label={`Choose ${plan.name} plan`}
                >
                  {plan.cta}
                </Button>
            </div>
          ))}
        </div>
      </section>

        {/* Footer */}
        <footer className="border-t mt-24 bg-muted/30" role="contentinfo">
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
                <li><button onClick={() => navigate('/help')} className="hover:text-foreground transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-foreground transition-colors">Contact Support</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">API Documentation</button></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-heading font-semibold">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><button onClick={() => navigate('/privacy')} className="hover:text-foreground transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('/terms')} className="hover:text-foreground transition-colors">Terms of Service</button></li>
                <li><button onClick={() => navigate('/cookies')} className="hover:text-foreground transition-colors">Cookie Policy</button></li>
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
    </>
  );
}
