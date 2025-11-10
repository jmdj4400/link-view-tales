import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Verify() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract parameters from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    // If no tokens present, show error
    if (!type || !accessToken) {
      setError("Invalid or missing verification tokens. Please request a new link.");
      return;
    }

    // Handle different verification types
    if (type === 'recovery') {
      // Password reset - redirect to reset password page with hash preserved
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    } else if (type === 'signup' || type === 'email_change') {
      // Email confirmation - redirect to confirmation page
      navigate('/email-confirmed', { replace: true });
    } else {
      // Unknown type
      setError(`Unknown verification type: ${type}`);
    }
  }, [navigate]);

  // Show error state
  if (error) {
    return (
      <>
        <SEOHead 
          title="Verification Error"
          description="There was an error verifying your email"
        />
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h1 className="text-2xl font-semibold">Verification Error</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show loading state while processing
  return (
    <>
      <SEOHead 
        title="Verifying"
        description="Verifying your authentication"
      />
      <PageLoader />
    </>
  );
}
