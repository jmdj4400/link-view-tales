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
      case 'sm': return 'h-16 w-16';
      case 'md': return 'h-20 w-20';
      case 'lg': return 'h-24 w-24';
      case 'xl': return 'h-32 w-32';
      default: return 'h-24 w-24';
    }
  };

  const getAvatarStyle = () => {
    switch (layout.avatarStyle) {
      case 'circle': return 'rounded-full';
      case 'rounded': return 'rounded-2xl';
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
    boxShadow: `0 0 20px ${cards.glowColor || colors.primary}`,
  } : {};

  return (
    <header className={cn("flex flex-col gap-4", getLayoutAlignment())}>
      <Avatar 
        className={cn(getAvatarSize(), getAvatarStyle(), "ring-2 ring-offset-2 transition-transform hover:scale-105")}
        style={{ 
          borderColor: colors.primary,
          ...avatarGlowStyle,
        }}
      >
        <AvatarImage 
          src={avatarUrl} 
          alt={`${name}'s profile`}
          className="object-cover"
        />
        <AvatarFallback 
          className="text-xl font-bold"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.cardBackground,
          }}
        >
          {name?.substring(0, 2).toUpperCase() || 'LP'}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <h1 
          className={cn(
            "text-3xl md:text-4xl font-bold tracking-tight",
            getTextAnimationClass()
          )}
          style={{ 
            fontFamily: typography.headingFont,
            fontWeight: typography.headingWeight,
            color: colors.text,
          }}
        >
          {name}
        </h1>
        <p 
          className="text-sm md:text-base"
          style={{ color: colors.textMuted }}
        >
          @{handle}
        </p>
      </div>

      {tagline && (
        <p 
          className="max-w-md text-base md:text-lg leading-relaxed"
          style={{ 
            fontFamily: typography.bodyFont,
            fontWeight: typography.bodyWeight,
            color: colors.textMuted,
          }}
        >
          {tagline}
        </p>
      )}
    </header>
  );
}
