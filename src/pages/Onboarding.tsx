import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { CountdownTimer } from "@/components/onboarding/CountdownTimer";
import { CelebrationModal } from "@/components/onboarding/CelebrationModal";
import { SEOHead } from "@/components/SEOHead";
import { PageLoader } from "@/components/ui/loading-spinner";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(() => {
    const stored = localStorage.getItem('challenge_start_time');
    if (stored) {
      return parseInt(stored, 10);
    }
    const now = Date.now();
    localStorage.setItem('challenge_start_time', now.toString());
    return now;
  });
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ bio: "" });
  const [link, setLink] = useState({ title: "", dest_url: "" });
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionTime, setCompletionTime] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ bio: profile.bio })
      .eq('id', user?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      setStep(2);
    }
    setIsLoading(false);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user?.id,
        title: link.title,
        dest_url: link.dest_url,
        position: 0,
      });

    if (error) {
      toast.error('Failed to add link');
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - startTime;
    const seconds = Math.round(elapsed / 1000);
    setCompletionTime(seconds);
    
    if (seconds < 60) {
      // Grant trial using database function
      const { error: trialError } = await supabase.rpc('grant_trial', {
        p_user_id: user?.id
      });

      if (trialError) {
        console.error('Failed to grant trial:', trialError);
        toast.error('Setup complete, but trial grant failed');
      } else {
        setShowCelebration(true);
      }
    } else {
      toast.success('Setup complete! Welcome to LinkPeek');
      navigate('/dashboard');
    }
    
    localStorage.removeItem('challenge_start_time');
    setIsLoading(false);
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    navigate('/dashboard');
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Setup Your Profile - LinkPeek"
        description="Complete your LinkPeek profile setup in under 60 seconds."
        noindex={true}
      />
      <CountdownTimer startTime={startTime} />
      <CelebrationModal 
        open={showCelebration}
        seconds={completionTime}
        onContinue={handleCelebrationContinue}
      />
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant-xl border-2">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 gradient-primary rounded-2xl shadow-md"></div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mx-auto mb-4">
                <Sparkles className="h-4 w-4" />
                Step {step} of 2
              </div>
              <CardTitle className="text-3xl font-heading font-bold">
                {step === 1 ? 'Tell us about yourself' : 'Add your first link'}
              </CardTitle>
              <CardDescription className="text-base pt-2">
                {step === 1 
                  ? 'Share a bit about yourself (optional)' 
                  : 'Almost there! Add a link to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium">Bio (optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell your visitors about yourself..."
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full group" 
                    disabled={isLoading} 
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Next
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLinkSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Link Title</Label>
                    <Input
                      id="title"
                      placeholder="My Website"
                      value={link.title}
                      onChange={(e) => setLink({ ...link, title: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium">Destination URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={link.dest_url}
                      onChange={(e) => setLink({ ...link, dest_url: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full gradient-primary shadow-md group" 
                    disabled={isLoading} 
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Complete Setup
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Complete in under 60s to get 1 month Pro free
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
