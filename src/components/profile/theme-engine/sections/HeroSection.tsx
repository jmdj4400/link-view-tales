import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  name: string;
  handle: string;
  tagline?: string;
  avatarUrl?: string;
  theme: ThemePreset;
}

export function HeroSection({ name, handle, tagline, avatarUrl, theme }: HeroSectionProps) {
  const { layout, typography, colors, effects, cards } = theme;

  const getAvatarSize = () => {
    switch (layout.avatarSize) {
      case 'sm': return 'h-14 w-14 md:h-16 md:w-16';
      case 'md': return 'h-16 w-16 md:h-20 md:w-20';
      case 'lg': return 'h-20 w-20 md:h-24 md:w-24';
      case 'xl': return 'h-24 w-24 md:h-32 md:w-32';
      default: return 'h-20 w-20 md:h-24 md:w-24';
    }
  };

  const getAvatarStyle = () => {
    switch (layout.avatarStyle) {
      case 'circle': return 'rounded-full';
      case 'rounded': return 'rounded-xl md:rounded-2xl';
      case 'square': return 'rounded-none';
      default: return 'rounded-full';
    }
  };

  const getLayoutAlignment = () => {
    switch (layout.style) {
      case 'left': return 'items-start text-left';
      case 'asymmetric': return 'items-start text-left md:items-center md:text-center';
      default: return 'items-center text-center';
    }
  };

  const getTextAnimationClass = () => {
    switch (effects.textAnimation) {
      case 'gradient': return 'animate-gradient-text bg-gradient-to-r from-current via-primary to-current bg-[length:200%_auto] bg-clip-text';
      case 'glow': return 'animate-glow-pulse';
      case 'wave': return 'animate-wave';
      case 'glitch': return 'animate-glitch';
      default: return '';
    }
  };

  const avatarGlowStyle = cards.style === 'neon' ? {
    boxShadow: `0 0 20px ${cards.glowColor || colors.primary}50`,
  } : {};

  // Truncate name if too long
  const displayName = name && name.length > 30 ? name.substring(0, 30) + '...' : name;
  
  // Truncate bio if too long
  const displayBio = tagline && tagline.length > 200 ? tagline.substring(0, 200) + '...' : tagline;

  return (
    <header className={cn("flex flex-col gap-3 md:gap-4 w-full", getLayoutAlignment())}>
      <Avatar 
        className={cn(
          getAvatarSize(), 
          getAvatarStyle(), 
          "ring-2 ring-offset-2 transition-transform hover:scale-105 flex-shrink-0"
        )}
        style={{ 
          borderColor: colors.primary,
          ...avatarGlowStyle,
        }}
      >
        <AvatarImage 
          src={avatarUrl} 
          alt={`${displayName || 'User'}'s profile`}
          className="object-cover"
          loading="lazy"
        />
        <AvatarFallback 
          className="text-lg md:text-xl font-bold"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.cardBackground,
          }}
        >
          {displayName?.substring(0, 2).toUpperCase() || 'LP'}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-0.5 md:space-y-1 min-w-0 max-w-full">
        <h1 
          className={cn(
            "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight break-words",
            getTextAnimationClass()
          )}
          style={{ 
            fontFamily: typography.headingFont,
            fontWeight: typography.headingWeight,
            color: colors.text,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {displayName || 'Unknown'}
        </h1>
        <p 
          className="text-sm md:text-base truncate max-w-full"
          style={{ color: colors.textMuted }}
        >
          @{handle || 'user'}
        </p>
      </div>

      {displayBio && (
        <p 
          className="max-w-xs md:max-w-md text-sm md:text-base lg:text-lg leading-relaxed break-words"
          style={{ 
            fontFamily: typography.bodyFont,
            fontWeight: typography.bodyWeight,
            color: colors.textMuted,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {displayBio}
        </p>
      )}
    </header>
  );
}
