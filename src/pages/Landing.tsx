import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Zap, Link as LinkIcon, Instagram, Twitter, Linkedin } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast.success("You're on the list! We'll notify you when we launch 🚀");
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
        title="LinkPeek - Launching Soon"
        description="Something amazing is coming. Be the first to know when LinkPeek launches."
        canonicalUrl={`${window.location.origin}/`}
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
              <img src={logo} alt="LinkPeek Logo" className="h-10" />
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
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-110"
                  >
                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </main>

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
