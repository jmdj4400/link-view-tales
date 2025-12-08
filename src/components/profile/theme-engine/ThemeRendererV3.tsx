import { ThemePreset } from "@/lib/theme-presets";
import { HeroSection } from "./sections/HeroSection";
import { LinkListSection } from "./sections/LinkListSection";
import { SocialIconsSection } from "./sections/SocialIconsSection";
import { DividerSection } from "./sections/DividerSection";
import { NoteBlockSection } from "./sections/NoteBlockSection";
import { AuroraBackground } from "./effects/AuroraBackground";
import { NoiseOverlay } from "./effects/NoiseOverlay";
import { ParticleEffectV3 } from "./effects/ParticleEffectV3";
import { ParallaxBackground } from "./effects/ParallaxBackground";
import { Tilt3DWrapper } from "./effects/Tilt3DWrapper";
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

// Modular section type for future extensibility
type SectionType = 'hero' | 'links' | 'socials' | 'featured' | 'note' | 'divider';

interface Section {
  type: SectionType;
  config?: Record<string, unknown>;
}

interface ThemeRendererV3Props {
  profile: ProfileData;
  links: LinkData[];
  socials?: SocialData[];
  theme: ThemePreset;
  onLinkClick?: (id: string, url: string) => void;
  note?: string;
  showFooter?: boolean;
  sections?: Section[];
  enable3DTilt?: boolean;
}

export function ThemeRendererV3({ 
  profile, 
  links, 
  socials = [], 
  theme, 
  onLinkClick,
  note,
  showFooter = true,
  sections,
  enable3DTilt = false,
}: ThemeRendererV3Props) {
  const { background, colors, layout, effects } = theme;

  // Default sections if none provided
  const defaultSections: Section[] = [
    { type: 'hero' },
    ...(socials.length > 0 ? [{ type: 'socials' as const }, { type: 'divider' as const }] : []),
    { type: 'links' },
    ...(note ? [{ type: 'divider' as const }, { type: 'note' as const }] : []),
  ];

  const activeSections = sections || defaultSections;

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

  const renderSection = (section: Section, index: number) => {
    switch (section.type) {
      case 'hero':
        return (
          <HeroSection
            key={`section-${index}`}
            name={profile.name}
            handle={profile.handle}
            tagline={profile.bio}
            avatarUrl={profile.avatar_url}
            theme={theme}
          />
        );
      case 'socials':
        return <SocialIconsSection key={`section-${index}`} socials={socials} theme={theme} />;
      case 'divider':
        return <DividerSection key={`section-${index}`} theme={theme} style="gradient" />;
      case 'links':
        return (
          <Tilt3DWrapper 
            key={`section-${index}`}
            enabled={enable3DTilt && effects.parallax}
            intensity={5}
            glare
            glareColor={`${colors.primary}30`}
          >
            <LinkListSection 
              links={links} 
              theme={theme} 
              onLinkClick={onLinkClick}
            />
          </Tilt3DWrapper>
        );
      case 'note':
        return note ? <NoteBlockSection key={`section-${index}`} content={note} theme={theme} /> : null;
      default:
        return null;
    }
  };

  const mainContent = (
    <div className={cn("w-full flex flex-col", getMaxWidthClass(), getSpacingClass())}>
      {activeSections.map((section, index) => renderSection(section, index))}

      {/* Footer */}
      {showFooter && (
        <footer className="text-center pt-4">
          <Link 
            to="/" 
            className="text-sm opacity-50 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            style={{ color: colors.textMuted }}
          >
            Create your own with <span className="font-semibold">LinkPeek</span>
          </Link>
        </footer>
      )}
    </div>
  );

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
          className="absolute inset-0 z-[5]"
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

      {/* Enhanced Particle effects V3 */}
      {effects.particles !== 'none' && (
        <ParticleEffectV3 
          type={effects.particles as any}
          color={colors.primary} 
          secondaryColor={colors.secondary}
          intensity={1}
        />
      )}

      {/* Main content with optional parallax */}
      <ParallaxBackground 
        enabled={effects.parallax}
        intensity={15}
        type="mouse"
      >
        <main 
          className={cn(
            "relative z-20 min-h-screen flex flex-col justify-center",
            "px-6 py-12 md:py-16",
            getLayoutAlignment()
          )}
        >
          {mainContent}
        </main>
      </ParallaxBackground>

      {/* Inject theme-specific CSS animations */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes glow-pulse {
          0%, 100% { 
            opacity: 0.7;
            text-shadow: 0 0 10px currentColor;
          }
          50% { 
            opacity: 1;
            text-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
        
        .animate-gradient-text {
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
