import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, QrCode } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { PageLoader } from "@/components/ui/loading-spinner";
import { hashUserAgent } from "@/lib/security-utils";
import { ProfileQRDialog } from "@/components/profile/ProfileQRDialog";
import { ProfileLayoutBento } from "@/components/profile/layouts/ProfileLayoutBento";
import { ProfileLayoutNeon } from "@/components/profile/layouts/ProfileLayoutNeon";
import { ProfileLayoutGradient } from "@/components/profile/layouts/ProfileLayoutGradient";
import { ProfileLayoutMinimal } from "@/components/profile/layouts/ProfileLayoutMinimal";
import { ParticleEffect } from "@/components/profile/effects/ParticleEffect";
import { AnimatedText } from "@/components/profile/effects/AnimatedText";
import { BackgroundEffects } from "@/components/profile/BackgroundEffects";
import { ThemeRenderer } from "@/components/profile/theme-engine/ThemeRenderer";
import { themePresets, ThemePreset } from "@/lib/theme-presets";

interface Profile {
  name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  heading_font?: string;
  body_font?: string;
  layout_style?: string;
  button_style?: string;
  card_style?: string;
  profile_layout?: string;
  gradient_enabled?: boolean;
  gradient_from?: string;
  gradient_to?: string;
  animation_enabled?: boolean;
  background_blur?: boolean;
  card_border_width?: number;
  background_image_url?: string;
  background_video_url?: string;
  particle_effect?: string;
  text_animation?: string;
  link_animation?: string;
  enable_parallax?: boolean;
  enable_glassmorphism?: boolean;
  theme?: string; // Theme preset ID for new theme engine
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
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfileData();
    trackPageView();
  }, [handle]);

  const fetchProfileData = async () => {
    const { data: profileData, error: profileError } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('handle', handle?.toLowerCase())
      .maybeSingle();

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
      .eq('handle', handle?.toLowerCase())
      .maybeSingle();

    if (profileData) {
      const userAgentHash = await hashUserAgent(navigator.userAgent);
      await supabase.from('events').insert({
        user_id: profileData.id,
        event_type: 'page_view',
        referrer: document.referrer,
        user_agent_hash: userAgentHash,
      });
    }
  };

  const handleLinkClick = async (linkId: string, destUrl: string) => {
    const { data: profileData } = await supabase
      .from('public_profiles')
      .select('id')
      .eq('handle', handle?.toLowerCase())
      .maybeSingle();

    if (profileData) {
      const userAgentHash = await hashUserAgent(navigator.userAgent);
      await supabase.from('events').insert({
        user_id: profileData.id,
        link_id: linkId,
        event_type: 'click',
        referrer: document.referrer,
        user_agent_hash: userAgentHash,
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
              <Link to="/">Go to Home</Link>
            </Button>
          </article>
        </main>
      </>
    );
  }

  const pageTitle = `${profile.name} (@${profile.handle}) - LinkPeek`;
  const pageDescription = profile.bio || `Check out ${profile.name}'s links on LinkPeek`;
  const canonicalUrl = `${window.location.origin}/${profile.handle}`;

  // Apply custom theme or defaults
  const theme = {
    primaryColor: profile.primary_color || "#3b82f6",
    secondaryColor: profile.secondary_color || "#8b5cf6",
    backgroundColor: profile.background_color || "#ffffff",
    textColor: profile.text_color || "#000000",
    accentColor: profile.accent_color || "#10b981",
    headingFont: profile.heading_font || "Inter",
    bodyFont: profile.body_font || "Inter",
    layoutStyle: profile.layout_style || "classic",
    buttonStyle: profile.button_style || "rounded",
    cardStyle: profile.card_style || "elevated",
    profileLayout: profile.profile_layout || "classic",
    gradientEnabled: profile.gradient_enabled || false,
    gradientFrom: profile.gradient_from || "#3b82f6",
    gradientTo: profile.gradient_to || "#8b5cf6",
    animationEnabled: profile.animation_enabled !== false,
    backgroundBlur: profile.background_blur || false,
    cardBorderWidth: profile.card_border_width || 1,
    backgroundVideoUrl: profile.background_video_url,
    backgroundImageUrl: profile.background_image_url,
    particleEffect: profile.particle_effect || "none",
    textAnimation: profile.text_animation || "none",
    linkAnimation: profile.link_animation || "fade",
    enableParallax: profile.enable_parallax || false,
    enableGlassmorphism: profile.enable_glassmorphism || false,
  };

  // Check if using new theme engine preset
  const getThemePreset = (): ThemePreset | null => {
    const presetName = profile.theme;
    if (presetName && themePresets[presetName as keyof typeof themePresets]) {
      return themePresets[presetName as keyof typeof themePresets];
    }
    return null;
  };

  // Render appropriate layout
  const renderProfileLayout = () => {
    // Check for new theme engine presets first
    const themePreset = getThemePreset();
    if (themePreset) {
      return (
        <ThemeRenderer
          profile={{
            name: profile.name,
            handle: profile.handle,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
          }}
          links={links.map(l => ({
            id: l.id,
            title: l.title,
            dest_url: l.dest_url,
          }))}
          theme={themePreset}
          onLinkClick={handleLinkClick}
          showFooter={true}
        />
      );
    }

    const commonProps = {
      profile,
      links,
      theme,
      onLinkClick: handleLinkClick,
      animationEnabled: theme.animationEnabled,
    };

    switch (theme.profileLayout) {
      case "bento":
        return <ProfileLayoutBento {...commonProps} />;
      case "neon":
        return <ProfileLayoutNeon {...commonProps} />;
      case "gradient":
        return <ProfileLayoutGradient 
          {...commonProps} 
          gradientFrom={theme.gradientFrom}
          gradientTo={theme.gradientTo}
        />;
      case "minimal":
        return <ProfileLayoutMinimal {...commonProps} />;
      default:
        return renderClassicLayout();
    }
  };

  const renderClassicLayout = () => (
    <>
      <ParticleEffect type={theme.particleEffect} color={theme.primaryColor} />
      <BackgroundEffects 
        videoUrl={theme.backgroundVideoUrl}
        imageUrl={theme.backgroundImageUrl}
        color={theme.backgroundColor}
        enableParallax={theme.enableParallax}
        enableGlassmorphism={theme.enableGlassmorphism}
      />
      <main 
        className="min-h-screen flex items-center justify-center p-6 relative z-10"
        style={{
          color: theme.textColor,
          fontFamily: theme.bodyFont,
        }}
      >
        <article className={getContainerClasses()}>
          <header className="text-center space-y-4">
            <Avatar 
              className="h-24 w-24 mx-auto"
              style={{ border: `3px solid ${theme.primaryColor}` }}
            >
              <AvatarImage 
                src={profile.avatar_url} 
                alt={`${profile.name}'s profile picture`}
                loading="lazy"
              />
              <AvatarFallback 
                className="text-xl"
                style={{ backgroundColor: theme.primaryColor, color: 'white' }}
              >
                {profile.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <AnimatedText animation={theme.textAnimation}>
                <h1 
                  className="text-3xl font-bold mb-1"
                  style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                >
                  {profile.name}
                </h1>
              </AnimatedText>
              <p style={{ color: theme.textColor, opacity: 0.7 }}>@{profile.handle}</p>
            </div>
          {profile.bio && (
            <p 
              className="text-center max-w-sm mx-auto"
              style={{ color: theme.textColor, opacity: 0.8 }}
            >
              {profile.bio}
            </p>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setQrDialogOpen(true)}
            className="mt-2"
            style={{
              borderColor: theme.accentColor,
              color: theme.accentColor,
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Share QR Code
          </Button>
        </header>

        <nav className="space-y-3" aria-label="Social links">
          {links.length === 0 ? (
            <p 
              className="text-center py-8"
              style={{ color: theme.textColor, opacity: 0.7 }}
            >
              No links yet
            </p>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                className={getButtonClasses()}
                onClick={() => handleLinkClick(link.id, link.dest_url)}
                aria-label={`Visit ${link.title}`}
                style={{
                  backgroundColor: theme.layoutStyle === "bold" ? theme.primaryColor : "white",
                  color: theme.layoutStyle === "bold" ? "white" : theme.textColor,
                  borderWidth: `${theme.cardBorderWidth}px`,
                  borderColor: theme.primaryColor,
                  fontFamily: theme.bodyFont,
                }}
              >
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="h-4 w-4 ml-2" aria-hidden="true" />
              </button>
            ))
          )}
        </nav>

        <footer className="text-center pt-6">
          <Link 
            to="/" 
            className="text-sm transition-colors"
            style={{ 
              color: theme.textColor, 
              opacity: 0.6,
            }}
          >
            Create your own with LinkPeek
          </Link>
        </footer>
      </article>
    </main>
    </>
  );

  const getButtonClasses = () => {
    const base = "w-full h-auto py-4 justify-between transition-all";
    const shadow = theme.cardStyle === "elevated" ? "hover:shadow-md" : "";
    switch (theme.buttonStyle) {
      case "pill":
        return `${base} ${shadow} rounded-full`;
      case "sharp":
        return `${base} ${shadow} rounded-none`;
      default:
        return `${base} ${shadow} rounded-lg`;
    }
  };

  const getContainerClasses = () => {
    switch (theme.layoutStyle) {
      case "modern":
        return "w-full max-w-md space-y-8";
      case "minimal":
        return "w-full max-w-sm space-y-10";
      case "bold":
        return "w-full max-w-2xl space-y-6";
      default:
        return "w-full max-w-lg space-y-8";
    }
  };

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

  // Inject structured data via useEffect
  useEffect(() => {
    const scriptId = 'public-profile-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(structuredData);
    
    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [profile, links, canonicalUrl]);

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        ogImage={profile.avatar_url || undefined}
      />
      
      {renderProfileLayout()}
      
      <ProfileQRDialog
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        profileName={profile.name}
        profileHandle={profile.handle}
        profileUrl={canonicalUrl}
      />
    </>
  );
}
