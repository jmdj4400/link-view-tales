import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, BarChart3, Link as LinkIcon, Zap, Palette, Share2, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SEOHead } from "@/components/SEOHead";

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
        <section className="container mx-auto px-6 pt-20 pb-16 max-w-7xl" aria-labelledby="hero-heading">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6 animate-fade-in">
                <Zap className="h-4 w-4" />
                Complete setup in 60s • Get Pro free
              </div>
              <h2 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] tracking-tight mb-6 animate-fade-in">
                Your bio deserves better data
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in">
                Track clicks, not guesses. Fast, focused, and built for creators who care about analytics.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="text-base shadow-elegant hover:shadow-elegant-xl transition-all"
                >
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: document.getElementById('how-it-works')?.offsetTop || 0, behavior: 'smooth' })} className="text-base">
                  See How It Works
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6 animate-fade-in">
                No credit card required • Setup in 60 seconds • 1 month Pro trial
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-full"></div>
                <Card className="relative shadow-elegant-xl border-2 hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 gradient-primary rounded-xl"></div>
                        <div>
                          <div className="font-semibold">@creator</div>
                          <div className="text-sm text-muted-foreground">Creator & Designer</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['Portfolio', 'YouTube Channel', 'Newsletter'].map((item, i) => (
                      <div key={i} className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                        <div className="font-medium">{item}</div>
                        <div className="text-sm text-muted-foreground mt-1">View {item.toLowerCase()}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="how-it-works-heading">
          <div className="max-w-2xl mb-16 text-center mx-auto">
            <h2 id="how-it-works-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Setup in 3 simple steps
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in less than 60 seconds
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign up & share your story',
                description: 'Create your account and add a short bio to introduce yourself to visitors.',
                icon: '✍️'
              },
              {
                step: '2',
                title: 'Add your first link',
                description: 'Add your most important link. You can add unlimited links later.',
                icon: '🔗'
              },
              {
                step: '3',
                title: 'Share & track',
                description: 'Get your unique LinkPeek URL and watch real-time analytics roll in.',
                icon: '📊'
              }
            ].map((item) => (
              <Card key={item.step} className="relative overflow-hidden border-2 hover:border-primary transition-all hover-scale">
                <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-5 rounded-full -mr-16 -mt-16"></div>
                <CardHeader>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-sm font-bold text-primary mb-2">STEP {item.step}</div>
                  <CardTitle className="text-2xl font-heading">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="features-heading">
          <div className="max-w-2xl mb-16 text-center mx-auto">
            <h2 id="features-heading" className="text-4xl md:text-5xl font-heading font-bold mb-4 leading-tight">
              Analytics-first design
            </h2>
            <p className="text-lg text-muted-foreground">
              Understand your audience with powerful, privacy-first analytics
            </p>
          </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Real-time analytics',
              description: 'Track every click, view, and interaction as it happens.'
            },
            {
              icon: Share2,
              title: 'UTM tracking',
              description: 'Add campaign parameters and track traffic sources.'
            },
            {
              icon: Palette,
              title: 'Custom branding',
              description: 'Match your brand with custom themes and domains.'
            },
            {
              icon: Check,
              title: 'Privacy-first',
              description: 'GDPR compliant. No cookies. No tracking pixels.'
            },
            {
              icon: Zap,
              title: 'Click limits',
              description: 'Set maximum clicks for time-sensitive campaigns.'
            },
            {
              icon: LinkIcon,
              title: 'QR codes',
              description: 'Generate QR codes for offline-to-online tracking.'
            },
            {
              icon: BarChart3,
              title: 'Device insights',
              description: 'See which devices your audience uses most.'
            },
            {
              icon: TrendingUp,
              title: 'Export data',
              description: 'Download your analytics as CSV for deeper analysis.'
            }
          ].map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-all hover-scale">
              <CardHeader>
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
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

        {/* Beta Signup CTA */}
        <section className="container mx-auto px-6 py-24 max-w-7xl border-t" aria-labelledby="beta-heading">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-5"></div>
            <Card className="relative border-2 border-primary/50 shadow-elegant-xl">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mx-auto mb-4">
                  <Sparkles className="h-4 w-4" />
                  Limited Beta Access
                </div>
                <CardTitle className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Join the beta
                </CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  Be among the first to experience LinkPeek. Complete setup in under 60 seconds and get 1 month Pro free.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')} 
                  className="text-lg px-8 gradient-primary shadow-elegant"
                >
                  Get Early Access
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
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
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Help Center</button></li>
                <li><button onClick={() => navigate('/')} className="hover:text-foreground transition-colors">Contact Support</button></li>
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
