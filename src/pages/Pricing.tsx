import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { Check, Sparkles, Zap, ArrowLeft, Gift, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Pricing - LinkPeek | Free for First 200 Users"
        description="LinkPeek is free for the first 200 users! Track real delivered visits and recover lost clicks from social traffic."
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
            <Badge className="px-6 py-2 text-lg bg-gradient-to-r from-primary to-accent text-white border-0">
              <Gift className="h-4 w-4 mr-2" />
              First 200 Users Get Full Access FREE
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Free
              </span>{" "}
              for Early Adopters
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're launching! The first 200 users get full Pro access completely free. 
              No credit card required. No strings attached.
            </p>
          </motion.div>
        </section>

        {/* Single Card - Free Access */}
        <section className="container mx-auto px-6 pb-16 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
              <CardHeader className="text-center pt-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <Badge className="mx-auto mb-4 bg-green-500/10 text-green-600 border-green-500/20">
                  <Users className="h-3 w-3 mr-1" />
                  Limited Spots
                </Badge>
                <CardTitle className="text-3xl">Early Access</CardTitle>
                <CardDescription className="text-lg">
                  Full Pro features, completely free
                </CardDescription>
                <div className="pt-6">
                  <span className="text-5xl font-bold text-primary">$0</span>
                  <span className="text-muted-foreground text-lg ml-2">forever*</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  *For the first 200 users
                </p>
              </CardHeader>
              <CardContent className="pb-10">
                <ul className="space-y-4 mb-8">
                  {[
                    "Unlimited link pages",
                    "Advanced analytics dashboard",
                    "Unlimited clicks tracking",
                    "In-app browser recovery",
                    "Custom themes & layouts",
                    "UTM tracking",
                    "Priority support",
                    "All future features included",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6"
                  onClick={() => navigate("/auth")}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Claim Your Free Spot
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No credit card required
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 pb-24 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Is this really free?</h3>
              <p className="text-muted-foreground text-sm">
                Yes! The first 200 users get full access completely free, forever. We're building in public and want early users to help shape the product.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">What happens after 200 users?</h3>
              <p className="text-muted-foreground text-sm">
                After we reach 200 users, we'll introduce paid plans for new users. But early adopters keep their free access as a thank you for being early supporters.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Will I lose my free access later?</h3>
              <p className="text-muted-foreground text-sm">
                No! Once you're in, you're in. Your early access is permanent as long as you remain an active user.
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
