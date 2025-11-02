import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

interface Profile {
  name: string;
  handle: string;
  bio: string;
  avatar_url: string;
}

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
}

export default function PublicProfile() {
  const { handle } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
    trackPageView();
  }, [handle]);

  const fetchProfileData = async () => {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name, handle, bio, avatar_url, id')
      .eq('handle', handle)
      .single();

    if (profileError || !profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('id, title, dest_url, position')
      .eq('user_id', profileData.id)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (!linksError && linksData) {
      setLinks(linksData);
    }

    setLoading(false);
  };

  const trackPageView = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .single();

    if (profileData) {
      await supabase.from('events').insert({
        user_id: profileData.id,
        event_type: 'page_view',
        referrer: document.referrer,
        user_agent_hash: btoa(navigator.userAgent).substring(0, 32),
      });
    }
  };

  const handleLinkClick = async (linkId: string, destUrl: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('handle', handle)
      .single();

    if (profileData) {
      await supabase.from('events').insert({
        user_id: profileData.id,
        link_id: linkId,
        event_type: 'click',
        referrer: document.referrer,
        user_agent_hash: btoa(navigator.userAgent).substring(0, 32),
      });
    }

    window.open(destUrl, '_blank');
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground">This profile doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback className="text-2xl">
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
          </div>
          {profile.bio && (
            <p className="text-center max-w-sm mx-auto">{profile.bio}</p>
          )}
        </div>

        <div className="space-y-3">
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No links yet</p>
          ) : (
            links.map((link) => (
              <Button
                key={link.id}
                variant="outline"
                className="w-full h-auto py-4 justify-between"
                onClick={() => handleLinkClick(link.id, link.dest_url)}
              >
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            ))
          )}
        </div>

        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold">LinkPeek</span>
          </p>
        </div>
      </div>
    </div>
  );
}
