import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { FormFieldWithValidation } from "@/components/ui/form-field-with-validation";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";

// Validation schemas
const emailValidation = {
  validate: (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email address";
    if (value.length > 255) return "Email must be less than 255 characters";
    return null;
  }
};

const passwordValidation = {
  validate: (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 72) return "Password must be less than 72 characters";
    return null;
  }
};

const handleValidation = {
  validate: (value: string) => {
    if (!value) return "Handle is required";
    if (!/^[a-z0-9_-]+$/i.test(value)) return "Handle can only contain letters, numbers, hyphens and underscores";
    if (value.length < 3) return "Handle must be at least 3 characters";
    if (value.length > 30) return "Handle must be less than 30 characters";
    return null;
  }
};

const nameValidation = {
  validate: (value: string) => {
    if (!value) return "Name is required";
    if (value.length > 100) return "Name must be less than 100 characters";
    return null;
  }
};

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({ email: "", password: "", handle: "", name: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { signUp, signIn, user, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Validate redirect URL to prevent open redirect attacks
  const getSafeRedirect = (redirectParam: string | null): string => {
    const fallback = '/dashboard';
    if (!redirectParam) return fallback;
    // Only allow relative paths starting with / (not //)
    if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      return redirectParam;
    }
    return fallback;
  };

  useEffect(() => {
    if (user) {
      const redirect = getSafeRedirect(searchParams.get('redirect'));
      navigate(redirect);
    }
  }, [user, navigate, searchParams]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error("Failed to sign in with Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Start the challenge timer
    localStorage.setItem('challenge_start_time', Date.now().toString());

    const { error } = await signUp(
      signUpData.email,
      signUpData.password,
      signUpData.handle,
      signUpData.name
    );

    if (error) {
      toast.error(error.message);
      localStorage.removeItem('challenge_start_time');
    } else {
      toast.success("Please check your email to verify your account");
      navigate('/verify-email', { state: { email: signUpData.email } });
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(signInData.email, signInData.password);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back! 👋");
      const redirect = getSafeRedirect(searchParams.get('redirect'));
      navigate(redirect);
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await resetPasswordForEmail(forgotPasswordEmail);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    }
    setIsLoading(false);
  };

  const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  return (
    <>
      <SEOHead
        title="Sign Up or Sign In - LinkPeek"
        description="Create your LinkPeek account in seconds. Get started with professional link management and analytics today."
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant-xl border-2">
            <CardHeader className="space-y-3 text-center pb-6">
              <div className="flex justify-center mb-2">
                <img src={logo} alt="LinkPeek Logo" className="h-16" />
              </div>
              <CardTitle className="text-3xl font-heading font-bold">Welcome to LinkPeek</CardTitle>
              <CardDescription className="text-base">
                Create your account in seconds
              </CardDescription>
            </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup" className="font-medium">Sign Up</TabsTrigger>
                <TabsTrigger value="signin" className="font-medium">Sign In</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup">
                <div className="space-y-5">
                  {/* Google Sign-In Button */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Continue with Google</span>
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-5">
                    <FormFieldWithValidation
                      id="name"
                      label="Name"
                      value={signUpData.name}
                      onChange={(value) => setSignUpData({ ...signUpData, name: value })}
                      validation={nameValidation}
                      placeholder="Your name"
                      required
                    />
                    
                    <FormFieldWithValidation
                      id="handle"
                      label="Handle"
                      value={signUpData.handle}
                      onChange={(value) => setSignUpData({ ...signUpData, handle: value })}
                      validation={handleValidation}
                      placeholder="yourhandle"
                      hint={`Your profile: link-peek.org/${signUpData.handle || 'yourhandle'}`}
                      required
                    />
                    
                    <FormFieldWithValidation
                      id="signup-email"
                      label="Email"
                      type="email"
                      value={signUpData.email}
                      onChange={(value) => setSignUpData({ ...signUpData, email: value })}
                      validation={emailValidation}
                      placeholder="name@example.com"
                      required
                    />
                    
                    <FormFieldWithValidation
                      id="signup-password"
                      label="Password"
                      type="password"
                      value={signUpData.password}
                      onChange={(value) => setSignUpData({ ...signUpData, password: value })}
                      validation={passwordValidation}
                      placeholder="••••••••"
                      hint="At least 6 characters"
                      required
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full gradient-primary shadow-md" 
                      disabled={isLoading} 
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                    <p className="text-xs text-center text-muted-foreground pt-2">
                      Complete setup in 60s → Get 1 month Pro free
                    </p>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="signin">
                {!showForgotPassword ? (
                  <div className="space-y-5">
                    {/* Google Sign-In Button */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      <span className="ml-2">Continue with Google</span>
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                      </div>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-5">
                      <FormFieldWithValidation
                        id="signin-email"
                        label="Email"
                        type="email"
                        value={signInData.email}
                        onChange={(value) => setSignInData({ ...signInData, email: value })}
                        validation={emailValidation}
                        placeholder="name@example.com"
                        required
                      />
                      
                      <FormFieldWithValidation
                        id="signin-password"
                        label="Password"
                        type="password"
                        value={signInData.password}
                        onChange={(value) => setSignInData({ ...signInData, password: value })}
                        validation={passwordValidation}
                        placeholder="••••••••"
                        required
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading} 
                        size="lg"
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                      
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm text-muted-foreground"
                          onClick={() => setShowForgotPassword(true)}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg mb-2">Reset Password</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your email and we'll send you a reset link
                      </p>
                    </div>
                    
                    <FormFieldWithValidation
                      id="forgot-email"
                      label="Email"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(value) => setForgotPasswordEmail(value)}
                      validation={emailValidation}
                      placeholder="name@example.com"
                      required
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading} 
                      size="lg"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Link
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-muted-foreground"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordEmail("");
                        }}
                      >
                        Back to sign in
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
    </>
  );
}