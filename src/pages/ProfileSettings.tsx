import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Eye, Copy, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { PageLoader } from "@/components/ui/loading-spinner";
import { profileValidation } from "@/lib/security-utils";
import { PageHeader } from "@/components/ui/page-header";
import { useAutosave } from "@/hooks/use-autosave";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { FormFieldWithValidation } from "@/components/ui/form-field-with-validation";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { useCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ReportSettings } from "@/components/profile/ReportSettings";

export default function ProfileSettings() {
  useCommonShortcuts();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [profile, setProfile] = useState({ name: "", handle: "", bio: "", avatar_url: "" });

  // Autosave functionality
  const autosave = useAutosave({
    data: profile,
    onSave: async (data) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          bio: data.bio,
          avatar_url: data.avatar_url,
        })
        .eq('id', user?.id);

      if (error) throw error;
    },
    delay: 2000,
    key: `profile-autosave-${user?.id}`,
    enabled: !isFetchingProfile && !!user,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setIsFetchingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (!error && data) {
      setProfile({
        name: data.name || "",
        handle: data.handle || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
      });
    }
    setIsFetchingProfile(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    const nameError = profileValidation.name.validate(profile.name);
    const bioError = profileValidation.bio.validate(profile.bio);
    const avatarError = profileValidation.avatarUrl.validate(profile.avatar_url);

    if (nameError || bioError || avatarError) {
      toast.error(nameError || bioError || avatarError || 'Validation error');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq('id', user?.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
    setIsLoading(false);
  };

  if (loading || isFetchingProfile) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Profile Settings - LinkPeek"
        description="Update your LinkPeek profile settings."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader 
          showBack 
          title="LinkPeek"
          actions={
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`/@${profile.handle}`, '_blank')}
              disabled={!profile.handle}
              aria-label="View your public profile"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          }
        />

      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <BreadcrumbNav />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Profile Settings</h1>
            <p className="text-muted-foreground">Update your public profile information</p>
          </div>
          <AutosaveIndicator {...autosave} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormFieldWithValidation
                id="name"
                label="Name"
                value={profile.name}
                onChange={(value) => setProfile({ ...profile, name: value })}
                validation={profileValidation.name}
                maxLength={profileValidation.name.maxLength}
                showCharCount
                required
              />
              
              <div className="space-y-2">
                <Label htmlFor="handle">Handle</Label>
                <Input
                  id="handle"
                  value={profile.handle}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Handle cannot be changed</p>
              </div>

              <FormFieldWithValidation
                id="avatar"
                label="Avatar URL"
                type="url"
                value={profile.avatar_url}
                onChange={(value) => setProfile({ ...profile, avatar_url: value })}
                validation={profileValidation.avatarUrl}
                placeholder="https://example.com/avatar.jpg"
                hint="Optional: Link to your profile picture"
              />

              <FormFieldWithValidation
                id="bio"
                label="Bio"
                type="textarea"
                value={profile.bio}
                onChange={(value) => setProfile({ ...profile, bio: value })}
                validation={profileValidation.bio}
                maxLength={profileValidation.bio.maxLength}
                rows={4}
                showCharCount
                placeholder="Tell your visitors about yourself..."
                hint="Optional: A short description about you"
              />

              <Button type="submit" disabled={isLoading || autosave.isSaving} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">Share your profile</h3>
                  <p className="text-sm text-muted-foreground">Add this URL to Instagram, TikTok, LinkedIn, or any social platform</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Your LinkPeek URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={`${window.location.origin}/${profile.handle}`}
                    readOnly
                    className="font-mono text-sm bg-background"
                  />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/${profile.handle}`);
                      toast.success('Link copied to clipboard');
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Paste this link in your social media bio to start tracking clicks
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/${profile.handle}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ReportSettings />
      </div>
    </div>
    </>
  );
}
