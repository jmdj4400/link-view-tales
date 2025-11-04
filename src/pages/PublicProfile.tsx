import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { PageLoader } from "@/components/ui/loading-spinner";

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
      .from('public_profiles')
      .select('id, name, handle, bio, avatar_url')
      .eq('handle', handle)
      .single();

    if (profileError || !profileData) {
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('id, title, dest_url, position, active_from, active_until, max_clicks, current_clicks')
      .eq('user_id', profileData.id)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (!linksError && linksData) {
      // Filter links based on schedule and click limits
      const now = new Date();
      const activeLinks = linksData.filter(link => {
        const from = link.active_from ? new Date(link.active_from) : null;
        const until = link.active_until ? new Date(link.active_until) : null;
        
        if (from && now < from) return false;
        if (until && now > until) return false;
        if (link.max_clicks && link.current_clicks >= link.max_clicks) return false;
        return true;
      });
      setLinks(activeLinks);
    }

    setLoading(false);
  };

  const trackPageView = async () => {
    const { data: profileData } = await supabase
      .from('public_profiles')
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
      .from('public_profiles')
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
    return <PageLoader />;
  }

  if (!profile) {
    return (
      <>
        <SEOHead
          title="Profile Not Found - LinkPeek"
          description="This profile doesn't exist."
          noindex={true}
        />
        <main className="flex min-h-screen items-center justify-center bg-background">
          <article className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Profile not found</h1>
            <p className="text-muted-foreground">This profile doesn't exist</p>
            <Button asChild>
              <a href="/">Go to Home</a>
            </Button>
          </article>
        </main>
      </>
    );
  }

  const pageTitle = `${profile.name} (@${profile.handle}) - LinkPeek`;
  const pageDescription = profile.bio || `Check out ${profile.name}'s links on LinkPeek`;
  const canonicalUrl = `${window.location.origin}/${profile.handle}`;

  // Structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name,
    "url": canonicalUrl,
    "image": profile.avatar_url || undefined,
    "description": profile.bio || undefined,
    "sameAs": links.map(link => link.dest_url)
  };

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        ogImage={profile.avatar_url || undefined}
      />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <article className="w-full max-w-md space-y-8">
          <header className="text-center space-y-4">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarImage 
                src={profile.avatar_url} 
                alt={`${profile.name}'s profile picture`}
                loading="lazy"
              />
              <AvatarFallback className="text-xl">
                {profile.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold mb-1">{profile.name}</h1>
              <p className="text-muted-foreground">@{profile.handle}</p>
            </div>
            {profile.bio && (
              <p className="text-center max-w-sm mx-auto text-muted-foreground">{profile.bio}</p>
            )}
          </header>

          <nav className="space-y-3" aria-label="Social links">
            {links.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No links yet</p>
            ) : (
              links.map((link) => (
                <Button
                  key={link.id}
                  variant="outline"
                  className="w-full h-auto py-4 justify-between transition-all hover:shadow-md"
                  onClick={() => handleLinkClick(link.id, link.dest_url)}
                  aria-label={`Visit ${link.title}`}
                >
                  <span className="font-medium">{link.title}</span>
                  <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
                </Button>
              ))
            )}
          </nav>

          <footer className="text-center pt-6">
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Create your own with LinkPeek
            </a>
          </footer>
        </article>
      </main>
    </>
  );
}
