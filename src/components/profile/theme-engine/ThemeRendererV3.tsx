import { ThemePreset } from "@/lib/theme-presets";
import { validateTheme, getOptimizedEffects, prefersReducedMotion } from "@/lib/theme-validation";
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
import { useMemo, useState, useEffect } from "react";

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
  visible?: boolean;
}

interface ThemeRendererV3Props {
  profile: ProfileData;
  links: LinkData[];
  socials?: SocialData[];
  theme: ThemePreset | Partial<ThemePreset> | null;
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
  theme: rawTheme, 
  onLinkClick,
  note,
  showFooter = true,
  sections,
  enable3DTilt = false,
}: ThemeRendererV3Props) {
  // Validate theme with fallback - ensures we never crash
  const theme = useMemo(() => validateTheme(rawTheme), [rawTheme]);
  
  // Track reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
    
    // Listen for preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  // Optimize effects based on device capabilities
  const optimizedEffects = useMemo(
    () => getOptimizedEffects(theme.effects),
    [theme.effects]
  );

  const { background, colors, layout } = theme;

  // Default sections if none provided
  const defaultSections: Section[] = [
    { type: 'hero', visible: true },
    ...(socials.length > 0 ? [{ type: 'socials' as const, visible: true }, { type: 'divider' as const, visible: true }] : []),
    { type: 'links', visible: true },
    ...(note ? [{ type: 'divider' as const, visible: true }, { type: 'note' as const, visible: true }] : []),
  ];

  const activeSections = (sections || defaultSections).filter(s => s.visible !== false);

  const getBackgroundStyles = (): React.CSSProperties => {
    if (background.type === 'gradient') {
      return {
        background: `linear-gradient(${background.gradientAngle || 135}deg, ${background.gradientFrom || '#667eea'}, ${background.gradientTo || '#764ba2'})`,
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
      case 'compact': return 'gap-4 md:gap-6';
      case 'relaxed': return 'gap-8 md:gap-12';
      default: return 'gap-6 md:gap-8';
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
    const key = `section-${section.type}-${index}`;
    
    try {
      switch (section.type) {
        case 'hero':
          return (
            <HeroSection
              key={key}
              name={profile.name || 'Unknown'}
              handle={profile.handle || 'user'}
              tagline={profile.bio}
              avatarUrl={profile.avatar_url}
              theme={theme}
            />
          );
        case 'socials':
          return <SocialIconsSection key={key} socials={socials} theme={theme} />;
        case 'divider':
          return <DividerSection key={key} theme={theme} style="gradient" />;
        case 'links':
          return (
            <Tilt3DWrapper 
              key={key}
              enabled={enable3DTilt && optimizedEffects.parallax && !reducedMotion}
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
          return note ? <NoteBlockSection key={key} content={note} theme={theme} /> : null;
        default:
          return null;
      }
    } catch (error) {
      console.error(`[ThemeEngine] Error rendering section ${section.type}:`, error);
      return null;
    }
  };

  const mainContent = (
    <div className={cn("w-full flex flex-col px-4 md:px-0", getMaxWidthClass(), getSpacingClass())}>
      {activeSections.map((section, index) => renderSection(section, index))}

      {/* Footer */}
      {showFooter && (
        <footer className="text-center pt-4 pb-8">
          <Link 
            to="/" 
            className="text-xs md:text-sm opacity-50 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
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
      {/* Background video - only on desktop for performance */}
      {background.type === 'video' && background.videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
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

      {/* Aurora effect - disabled on mobile for performance */}
      {optimizedEffects.aurora && !reducedMotion && (
        <AuroraBackground colors={colors} />
      )}

      {/* Noise texture */}
      {background.noise && (
        <NoiseOverlay opacity={background.noiseOpacity} />
      )}

      {/* Enhanced Particle effects V3 - reduced on mobile */}
      {optimizedEffects.particles !== 'none' && !reducedMotion && (
        <ParticleEffectV3 
          type={optimizedEffects.particles as any}
          color={colors.primary} 
          secondaryColor={colors.secondary}
          intensity={0.7}
        />
      )}

      {/* Main content with optional parallax - disabled on mobile */}
      <ParallaxBackground 
        enabled={optimizedEffects.parallax && !reducedMotion}
        intensity={10}
        type="mouse"
      >
        <main 
          className={cn(
            "relative z-20 min-h-screen flex flex-col justify-center",
            "px-4 py-8 md:px-6 md:py-16",
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
        
        @keyframes wave-text {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          75% { transform: translateY(2px); }
        }
        
        .animate-gradient-text {
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .animate-wave {
          animation: wave-text 2s ease-in-out infinite;
        }
        
        /* Reduced motion override */
        @media (prefers-reduced-motion: reduce) {
          .animate-gradient-text,
          .animate-glow-pulse,
          .animate-wave {
            animation: none !important;
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .animate-gradient-text {
            animation-duration: 5s;
          }
        }
      `}</style>
    </div>
  );
}
