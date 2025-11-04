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
      toast.success("Welcome! Let's set up your profile");
      navigate('/onboarding');
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
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="handle" className="text-sm font-medium">Handle</Label>
                    <Input
                      id="handle"
                      placeholder="yourhandle"
                      value={signUpData.handle}
                      onChange={(e) => setSignUpData({ ...signUpData, handle: e.target.value })}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your profile: linkpeek.app/<span className="text-primary font-medium">{signUpData.handle || 'yourhandle'}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="name@example.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
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
