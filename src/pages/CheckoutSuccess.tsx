import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Mail, Sparkles, ArrowRight } from "lucide-react";
import { triggerSuccessConfetti } from "@/lib/success-animations";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { refreshSubscription, subscriptionStatus } = useAuth();

  useEffect(() => {
    // Trigger confetti on mount
    triggerSuccessConfetti();
    
    // Refresh subscription status
    refreshSubscription();
  }, [refreshSubscription]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to LinkPeek Pro! 🎉
            </CardTitle>
            <CardDescription className="text-base">
              Your 14-day free trial has started
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Confirmation Notice */}
          <div className="bg-accent/10 border-2 border-accent/20 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Check Your Email</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a confirmation email with all your trial details, feature access information, and helpful tips to get started.
                </p>
              </div>
            </div>
          </div>

          {/* Features Unlocked */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Premium Features Unlocked:</h3>
            </div>
            
            <div className="grid gap-3">
              {[
                "Unlimited smart links with custom domains",
                "Advanced analytics & conversion tracking",
                "A/B testing to optimize performance",
                "Lead capture forms & email collection",
                "QR codes for offline marketing",
                "UTM parameters & campaign tracking",
                "Custom link scheduling",
                "Priority support",
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg transition-all hover:bg-muted"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">🚀 Get Started in 3 Easy Steps:</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">1.</span>
                <span>Create your first smart link with UTM tracking</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">2.</span>
                <span>Set up A/B testing to compare destinations</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary flex-shrink-0">3.</span>
                <span>Add a lead capture form to collect audience data</span>
              </li>
            </ol>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              size="lg" 
              className="flex-1 shadow-lg"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/links')}
            >
              Create Your First Link
            </Button>
          </div>

          {/* Trial Info */}
          <p className="text-center text-xs text-muted-foreground pt-4 border-t">
            Your trial will automatically convert to a paid subscription after 14 days. Cancel anytime from your billing page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
