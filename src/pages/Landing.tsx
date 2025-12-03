import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Link as LinkIcon, Instagram, Twitter, Calendar, ArrowRight } from "lucide-react";
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
        // Send confirmation email
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
          {/* Simple Header */}
          <header className="container mx-auto px-6 py-8 max-w-7xl">
            <div className="flex items-center justify-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-background/80 backdrop-blur-sm border border-primary/20 rounded-xl p-3 shadow-lg">
                  <img src={logo} alt="LinkPeek Logo" className="h-10 relative z-10" />
                </div>
              </div>
            </div>
          </header>

          {/* Hero Content */}
          <main className="container mx-auto px-6 pt-20 pb-32 max-w-4xl text-center">
            <div className="space-y-8 animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Coming Soon</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  The Future of
                </span>
                <br />
                <span className="text-foreground">Link Management</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Transform how you share and track your digital presence. 
                <span className="text-foreground font-medium"> LinkPeek</span> is redefining the game.
              </p>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:scale-105">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <LinkIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Smart Links</h3>
                  <p className="text-sm text-muted-foreground">Intelligent routing & tracking</p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-accent/30 transition-all duration-300 hover:scale-105">
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">Real-time Analytics</h3>
                  <p className="text-sm text-muted-foreground">Instant performance insights</p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-secondary/30 transition-all duration-300 hover:scale-105">
                  <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground">Beautiful Design</h3>
                  <p className="text-sm text-muted-foreground">Stunning customization</p>
                </div>
              </div>

              {/* Waitlist Form */}
              <div className="pt-12">
                <p className="text-sm font-medium text-foreground mb-4">
                  Be the first to know when we launch
                </p>
                <form onSubmit={handleWaitlistSignup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 bg-card/50 border-border/50 backdrop-blur-sm focus:border-primary transition-colors"
                  />
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
                  >
                    {isSubmitting ? "Joining..." : "Join Waitlist"}
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">
                  Join hundreds of creators waiting for early access
                </p>
              </div>

              {/* Social Links */}
              <div className="pt-16">
                <p className="text-sm text-muted-foreground mb-4">Follow our journey</p>
                <div className="flex items-center justify-center gap-4">
                  <a 
                    href="https://www.instagram.com/linkpeeek?igsh=MTg4aHhpYXRqMjB1bA%3D%3D&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                  <a 
                    href="https://x.com/link_peek?s=21" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </main>

          {/* Launch Countdown */}
          <LaunchCountdown />

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
                              {format(new Date(article.published_at), "MMM dd, yyyy")}
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

          {/* Footer */}
          <footer className="container mx-auto px-6 py-8 max-w-7xl border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 LinkPeek. Something amazing is on the way.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
