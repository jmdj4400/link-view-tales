import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import confetti from 'canvas-confetti';

export default function EmailConfirmed() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
      });
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-redirect countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/onboarding');
    }
  }, [countdown, navigate]);

  return (
    <>
      <SEOHead
        title="Email Verified - LinkPeek"
        description="Your email has been successfully verified. Welcome to LinkPeek!"
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant-xl border-2">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-bounce-slow">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-heading font-bold mb-2">
                  Email Verified! 🎉
                </CardTitle>
                <CardDescription className="text-base">
                  Your email has been successfully verified. You can now continue setting up your
                  profile.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Redirecting in</p>
                <p className="text-3xl font-bold text-primary">{countdown}</p>
              </div>

              <Button
                onClick={() => navigate('/onboarding')}
                className="w-full gradient-primary shadow-md group"
                size="lg"
              >
                Continue to Setup
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Get ready to create your LinkPeek profile!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
