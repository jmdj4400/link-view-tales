import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { FormFieldWithValidation } from "@/components/ui/form-field-with-validation";

const passwordValidation = {
  validate: (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 72) return "Password must be less than 72 characters";
    return null;
  }
};

const confirmPasswordValidation = (password: string) => ({
  validate: (value: string) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return null;
  }
});

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const { updatePassword, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery tokens in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    if (type === 'recovery' && accessToken) {
      setIsRecoveryMode(true);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    // Only redirect if we're not in recovery mode and there's no user after loading
    if (!loading && !user && !isRecoveryMode) {
      toast.error("Invalid or expired reset link. Please request a new one.");
      navigate('/auth');
    }
  }, [user, loading, isRecoveryMode, navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully! 🎉");
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow rendering if in recovery mode OR if user exists
  if (!user && !isRecoveryMode) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Reset Password - LinkPeek"
        description="Reset your LinkPeek account password"
        noindex={true}
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant-xl border-2">
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <KeyRound className="h-7 w-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-heading font-bold">Reset Password</CardTitle>
              <CardDescription className="text-base">
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <FormFieldWithValidation
                  id="new-password"
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(value) => setPassword(value)}
                  validation={passwordValidation}
                  placeholder="••••••••"
                  hint="At least 6 characters"
                  required
                />
                
                <FormFieldWithValidation
                  id="confirm-password"
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(value) => setConfirmPassword(value)}
                  validation={confirmPasswordValidation(password)}
                  placeholder="••••••••"
                  required
                />
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary shadow-md" 
                  disabled={isLoading} 
                  size="lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Button
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={() => navigate('/auth')}
            >
              Back to sign in
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
