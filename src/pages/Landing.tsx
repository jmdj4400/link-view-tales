import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Link as LinkIcon, Instagram, Twitter, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import logo from "@/assets/logo.png";
import { LaunchCountdown } from "@/components/landing/LaunchCountdown";
import { Testimonials } from "@/components/landing/Testimonials";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { WaitlistCounter } from "@/components/landing/WaitlistCounter";
import { ValueProps } from "@/components/landing/ValueProps";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { motion } from "framer-motion";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  featured_image_url: string | null;
  published_at: string;
  reading_time_minutes: number;
}

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, description, category, featured_image_url, published_at, reading_time_minutes")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('beta_whitelist')
        .insert([{ email, status: 'pending' }]);

      if (error) {
        if (error.code === '23505') {
          toast.success("You're already on the list! 🎉");
        } else {
          throw error;
        }
      } else {
        try {
          await supabase.functions.invoke('send-waitlist-confirmation', {
            body: { email }
          });
          toast.success(
            "🎉 You're on the waitlist! Check your email for confirmation.",
            {
              description: "Didn't receive it? Check your spam folder or contact us.",
              duration: 6000,
            }
          );
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          toast.success(
            "✅ You're on the waitlist!",
            {
              description: "There was an issue sending the confirmation email, but you're successfully registered.",
              duration: 6000,
            }
          );
        }
        
        setEmail("");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "See real delivered visits, not vanity metrics",
    "Recover clicks lost to in-app browsers",
    "Compare performance across all channels",
  ];

  return (
    <>
      <SEOHead
        title="LinkPeek - Link in Bio Tool with Real Traffic Analytics | Launching December 2025"
        description="Create your link in bio page and see real delivered visits. Track in-app browser failures and recover lost clicks. Join the waitlist for early access."
        canonicalUrl="https://link-peek.org/"
      />
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="relative z-10">
          {/* Header with Sign In */}
          <header className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-between">
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-3 shadow-lg">
                  <img 
                    src={logo} 
                    alt="LinkPeek - Link in Bio Analytics Tool" 
                    className="h-10 relative z-10" 
                    width={40}
                    height={40}
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <Link to="/pricing">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="border-primary/30 hover:border-primary hover:bg-primary/5">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </div>
          </header>

          {/* Hero Content */}
          <main className="container mx-auto px-6 pt-12 pb-24 max-w-4xl text-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Launching December 10, 2025</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Stop Losing
                </span>
                <br />
                <span className="text-foreground">Social Traffic</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The link in bio tool that shows you{" "}
                <span className="text-foreground font-semibold">real delivered visits</span>
                —not platform-reported taps. Recover clicks lost to in-app browsers.
              </p>

              {/* Benefits List */}
              <div className="flex flex-col items-center gap-3 py-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Waitlist Counter */}
              <WaitlistCounter />

              {/* Waitlist Form */}
              <div className="pt-8">
                <p className="text-sm font-medium text-foreground mb-4">
                  Get early access + 30% lifetime discount
                </p>
                <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 bg-card/50 border-border/50 backdrop-blur-sm focus:border-primary transition-colors"
                    aria-label="Email address"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    {isSubmitting ? "Joining..." : "Join Waitlist →"}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">
                  Free to join. No credit card required.
                </p>
              </div>

              {/* Trust Badges */}
              <div className="pt-8">
                <TrustBadges />
              </div>

              {/* Social Links */}
              <div className="pt-12">
                <p className="text-sm text-muted-foreground mb-4">Follow our journey</p>
                <div className="flex items-center justify-center gap-4">
                  <a 
                    href="https://www.instagram.com/linkpeeek?igsh=MTg4aHhpYXRqMjB1bA%3D%3D&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                    aria-label="Follow LinkPeek on Instagram"
                  >
                    <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                  <a 
                    href="https://x.com/link_peek?s=21" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                    aria-label="Follow LinkPeek on X (Twitter)"
                  >
                    <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>
          </main>

          {/* Launch Countdown - Moved higher */}
          <LaunchCountdown />

          {/* How It Works */}
          <HowItWorks />

          {/* Value Propositions */}
          <ValueProps />

          {/* Testimonials */}
          <Testimonials />

          {/* Articles Section */}
          {articles.length > 0 && (
            <section className="container mx-auto px-6 pb-24 max-w-7xl">
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                      Latest Updates
                    </span>
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Stay informed with our launch teasers and feature announcements
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Link key={article.id} to={`/blog/${article.slug}`}>
                      <Card className="group hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
                        {article.featured_image_url && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={article.featured_image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-6 space-y-3">
                          <Badge variant="secondary" className="w-fit">
                            {article.category}
                          </Badge>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <time dateTime={article.published_at}>
                                {format(new Date(article.published_at), "MMM dd, yyyy")}
                              </time>
                            </div>
                            <span>{article.reading_time_minutes} min read</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="text-center">
                  <Link to="/blog">
                    <Button variant="outline" className="group">
                      View All Articles
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Final CTA Section */}
          <section className="container mx-auto px-6 py-24 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to see your{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    real traffic
                  </span>
                  ?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Join thousands of creators who are tired of losing clicks to broken in-app browsers.
                  Early access members get a 30% lifetime discount.
                </p>
                <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12"
                    aria-label="Email address for waitlist"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 px-8"
                  >
                    {isSubmitting ? "Joining..." : "Get Early Access"}
                  </Button>
                </form>
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="container mx-auto px-6 py-8 max-w-7xl border-t border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 LinkPeek. All rights reserved.
              </p>
              <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
