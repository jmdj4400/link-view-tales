import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";

export default function Beta() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if email already exists in whitelist
    const { data: existing } = await supabase
      .from('beta_whitelist')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      toast.info("You're already on the list! Check your email for access.");
      setIsSubmitting(false);
      return;
    }

    // Add to beta whitelist
    const { error } = await supabase
      .from('beta_whitelist')
      .insert({ email, status: 'pending' });

    if (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } else {
      toast.success("You're on the list! We'll email you when you're in.");
      setEmail("");
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <SEOHead
        title="Join the Beta - LinkPeek"
        description="Get early access to LinkPeek. Track your links with analytics-first design."
        canonicalUrl={`${window.location.origin}/beta`}
      />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation */}
        <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-7xl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-primary rounded-lg"></div>
              <h1 className="text-xl font-heading font-semibold">LinkPeek</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/auth')}>Sign in</Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-8 animate-fade-in">
              <Lock className="h-4 w-4" />
              Limited Beta Access
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.05] tracking-tight mb-6 animate-fade-in">
              Join the beta and get{" "}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                1 month Pro free
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Be among the first to experience LinkPeek's analytics-first link management. Setup takes less than 60 seconds.
            </p>

            {/* Email Form */}
            <Card className="max-w-md mx-auto border-2 border-primary/50 shadow-elegant-xl mb-16 animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading">Request Early Access</CardTitle>
                <CardDescription className="text-base">
                  Join the waitlist and we'll email you when it's your turn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12 text-base"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full gradient-primary shadow-elegant text-base"
                  >
                    {isSubmitting ? "Joining..." : "Join the Waitlist"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Free forever • No credit card required
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 animate-fade-in">
              {[
                {
                  icon: Sparkles,
                  title: "Complete setup in 60s",
                  description: "Get Pro free for 1 month when you finish onboarding under 60 seconds"
                },
                {
                  icon: Zap,
                  title: "Analytics-first design",
                  description: "Track clicks, views, CTR, devices, and traffic sources in real-time"
                },
                {
                  icon: Check,
                  title: "Privacy-focused",
                  description: "GDPR compliant. No cookies. No third-party trackers."
                }
              ].map((benefit, index) => (
                <Card key={index} className="text-left border-2 hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-3">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-heading">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container mx-auto px-6 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LinkPeek. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
