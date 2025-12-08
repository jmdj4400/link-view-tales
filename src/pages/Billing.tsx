import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Sparkles, Gift, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Billing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <div className="mb-10 text-center">
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white border-0">
            <Gift className="h-4 w-4 mr-2" />
            Early Adopter Access
          </Badge>
          <h1 className="text-3xl font-bold mb-2">You're In! 🎉</h1>
          <p className="text-muted-foreground">
            As one of our first 200 users, you have full access to all features—completely free.
          </p>
        </div>

        <Card className="border-primary shadow-xl shadow-primary/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
          <CardHeader className="text-center pt-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Early Access Plan</CardTitle>
            <CardDescription>Full Pro features, forever free</CardDescription>
            <div className="pt-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">$0</span>
              <span className="text-muted-foreground text-lg">/forever</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">
                Your early access is active. All features unlocked!
              </p>
            </div>
            
            <ul className="space-y-3">
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
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Thank you for being an early adopter! 💙
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Questions about your account?
          </p>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
