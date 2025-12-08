import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Sparkles, ArrowRight, Gift } from "lucide-react";
import { triggerSuccessConfetti } from "@/lib/success-animations";

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    triggerSuccessConfetti();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Gift className="h-12 w-12 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Welcome to LinkPeek! 🎉
            </CardTitle>
            <CardDescription className="text-base">
              You're one of our first 200 users — enjoy full access for free!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features Unlocked */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">All Features Unlocked:</h3>
            </div>
            
            <div className="grid gap-3">
              {[
                "Unlimited link pages",
                "Advanced analytics dashboard",
                "In-app browser recovery",
                "Custom themes & layouts",
                "UTM tracking & attribution",
                "Lead capture forms",
                "QR codes for offline marketing",
                "Priority support",
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg transition-all hover:bg-muted"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              size="lg" 
              className="flex-1 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/settings/links')}
            >
              Create Your First Link
            </Button>
          </div>

          {/* Thank You Note */}
          <p className="text-center text-sm text-muted-foreground pt-4 border-t">
            Thank you for being an early adopter! 💚
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
