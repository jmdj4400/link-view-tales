import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [signUpData, setSignUpData] = useState({ email: "", password: "", handle: "", name: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

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
                <div className="w-14 h-14 gradient-primary rounded-2xl shadow-lg"></div>
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
                    hint={`Your profile: linkpeek.app/${signUpData.handle || 'yourhandle'}`}
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
              </TabsContent>
              
              <TabsContent value="signin">
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
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
    </>
  );
}
