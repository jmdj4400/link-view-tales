import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-2xl mx-auto animate-pulse"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-heading font-bold">Profile not found</h1>
          <p className="text-muted-foreground text-lg">This profile doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <motion.div 
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-5">
          <Avatar className="h-28 w-28 mx-auto border-4 border-primary/10 shadow-lg">
            <AvatarImage src={profile.avatar_url} alt={profile.name} />
            <AvatarFallback className="text-2xl font-heading gradient-primary text-white">
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-heading font-bold mb-1">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
          </div>
          {profile.bio && (
            <p className="text-center max-w-sm mx-auto text-base leading-relaxed">{profile.bio}</p>
          )}
        </div>

        <div className="space-y-3">
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No links yet</p>
          ) : (
            links.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto py-5 justify-between hover:border-primary/50 hover:shadow-md transition-all group"
                  onClick={() => handleLinkClick(link.id, link.dest_url)}
                >
                  <span className="font-medium text-base">{link.title}</span>
                  <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </motion.div>
            ))
          )}
        </div>

        <div className="text-center pt-8">
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <div className="w-5 h-5 gradient-primary rounded-lg"></div>
            <span className="font-medium">Create your own with LinkPeek</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
