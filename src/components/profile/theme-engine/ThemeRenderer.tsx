import { ThemePreset } from "@/lib/theme-presets";
import { HeroSection } from "./sections/HeroSection";
import { LinkListSection } from "./sections/LinkListSection";
import { SocialIconsSection } from "./sections/SocialIconsSection";
import { DividerSection } from "./sections/DividerSection";
import { NoteBlockSection } from "./sections/NoteBlockSection";
import { AuroraBackground } from "./effects/AuroraBackground";
import { NoiseOverlay } from "./effects/NoiseOverlay";
import { ParticleEffect } from "@/components/profile/effects/ParticleEffect";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ProfileData {
  name: string;
  handle: string;
  bio?: string;
  avatar_url?: string;
}

interface LinkData {
  id: string;
  title: string;
  description?: string;
  dest_url: string;
  isFeatured?: boolean;
}

interface SocialData {
  platform: string;
  url: string;
}

interface ThemeRendererProps {
  profile: ProfileData;
  links: LinkData[];
  socials?: SocialData[];
  theme: ThemePreset;
  onLinkClick?: (id: string, url: string) => void;
  note?: string;
  showFooter?: boolean;
}

export function ThemeRenderer({ 
  profile, 
  links, 
  socials = [], 
  theme, 
  onLinkClick,
  note,
  showFooter = true,
}: ThemeRendererProps) {
  const { background, colors, layout, effects } = theme;

  const getBackgroundStyles = (): React.CSSProperties => {
    if (background.type === 'gradient') {
      return {
        background: `linear-gradient(${background.gradientAngle || 135}deg, ${background.gradientFrom}, ${background.gradientTo})`,
      };
    }
    if (background.type === 'image' && background.imageUrl) {
      return {
        backgroundImage: `url(${background.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return {
      backgroundColor: background.color || '#ffffff',
    };
  };

  const getMaxWidthClass = () => {
    switch (layout.maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-2xl';
      default: return 'max-w-md';
    }
  };

  const getSpacingClass = () => {
    switch (layout.spacing) {
      case 'compact': return 'gap-6';
      case 'relaxed': return 'gap-12';
      default: return 'gap-8';
    }
  };

  const getLayoutAlignment = () => {
    switch (layout.style) {
      case 'left': return 'items-start';
      case 'asymmetric': return 'items-start md:items-center';
      default: return 'items-center';
    }
  };

  return (
    <div 
      className="min-h-screen w-full relative overflow-hidden"
      style={getBackgroundStyles()}
    >
      {/* Background video */}
      {background.type === 'video' && background.videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={background.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay for video/image backgrounds */}
      {(background.type === 'video' || background.type === 'image') && background.overlay && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: background.overlay }}
        />
      )}

      {/* Aurora effect */}
      {effects.aurora && (
        <AuroraBackground colors={colors} />
      )}

      {/* Noise texture */}
      {background.noise && (
        <NoiseOverlay opacity={background.noiseOpacity} />
      )}

      {/* Particle effects */}
      {effects.particles !== 'none' && (
        <ParticleEffect type={effects.particles} color={colors.primary} />
      )}

      {/* Main content */}
      <main 
        className={cn(
          "relative z-20 min-h-screen flex flex-col justify-center",
          "px-6 py-12 md:py-16",
          getLayoutAlignment()
        )}
      >
        <div className={cn("w-full flex flex-col", getMaxWidthClass(), getSpacingClass())}>
          {/* Hero Section */}
          <HeroSection
            name={profile.name}
            handle={profile.handle}
            tagline={profile.bio}
            avatarUrl={profile.avatar_url}
            theme={theme}
          />

          {/* Social Icons (if any) */}
          {socials.length > 0 && (
            <>
              <SocialIconsSection socials={socials} theme={theme} />
              <DividerSection theme={theme} style="gradient" />
            </>
          )}

          {/* Link List */}
          <LinkListSection 
            links={links} 
            theme={theme} 
            onLinkClick={onLinkClick}
          />

          {/* Optional Note Block */}
          {note && (
            <>
              <DividerSection theme={theme} style="dots" />
              <NoteBlockSection content={note} theme={theme} />
            </>
          )}

          {/* Footer */}
          {showFooter && (
            <footer className="text-center pt-4">
              <Link 
                to="/" 
                className="text-sm opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: colors.textMuted }}
              >
                Create your own with LinkPeek
              </Link>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}
