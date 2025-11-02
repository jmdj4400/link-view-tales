import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [startTime] = useState(Date.now());
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ bio: "" });
  const [link, setLink] = useState({ title: "", dest_url: "" });

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
    } else {
      const elapsed = Date.now() - startTime;
      const seconds = Math.round(elapsed / 1000);
      
      if (seconds < 60) {
        toast.success(`🎉 Challenge complete in ${seconds}s! Pro plan unlocked for 1 month!`);
        // Grant trial
        const { error: trialError } = await supabase
          .from('subscriptions')
          .update({
            trial_granted: true,
            trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('user_id', user?.id);

        if (trialError) console.error('Failed to grant trial:', trialError);
      } else {
        toast.success('Setup complete! Welcome to LinkPeek');
      }
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quick Setup - Step {step} of 2</CardTitle>
          <CardDescription>
            {step === 1 ? 'Tell us about yourself' : 'Add your first link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell your visitors about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Next
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Link Title</Label>
                <Input
                  id="title"
                  placeholder="My Website"
                  value={link.title}
                  onChange={(e) => setLink({ ...link, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={link.dest_url}
                  onChange={(e) => setLink({ ...link, dest_url: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Complete Setup
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
