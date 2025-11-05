import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SEOHead } from '@/components/SEOHead';
import { logger } from '@/lib/logger';

export default function VerifyEmail() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [lastResendTime, setLastResendTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if email is already confirmed
      if (user.email_confirmed_at) {
        navigate('/dashboard');
        return;
      }

      setEmail(user.email || location.state?.email || '');
    }
  }, [user, loading, navigate, location.state]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    const now = Date.now();
    const timeSinceLastResend = now - lastResendTime;
    const cooldownPeriod = 60000; // 1 minute in milliseconds

    if (timeSinceLastResend < cooldownPeriod) {
      const remainingSeconds = Math.ceil((cooldownPeriod - timeSinceLastResend) / 1000);
      toast.error(`Please wait ${remainingSeconds} seconds before resending`);
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast.success('Verification email sent! Check your inbox.');
      setLastResendTime(now);
      setCountdown(60); // Start 60 second countdown
    } catch (error) {
      logger.error('Failed to resend verification email', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        toast.success('Email verified! Redirecting...');
        navigate('/onboarding');
      } else {
        toast.info('Email not yet verified. Please check your inbox.');
      }
    } catch (error) {
      logger.error('Failed to check verification status', error);
      toast.error('Failed to check status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Verify Your Email - LinkPeek"
        description="Please verify your email address to continue setting up your LinkPeek account."
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant-xl border-2">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-heading font-bold mb-2">
                  Check your email
                </CardTitle>
                <CardDescription className="text-base">
                  We sent a verification link to
                </CardDescription>
                <p className="text-sm font-medium text-foreground mt-2">{email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-medium text-sm">Next steps:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open the email we sent you</li>
                  <li>Click the verification link</li>
                  <li>You'll be automatically redirected</li>
                </ol>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleCheckStatus}
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                I've verified my email
              </Button>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  Didn't receive the email?
                </p>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={isResending || countdown > 0}
                  size="lg"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground pt-2">
                Check your spam folder if you don't see the email
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
