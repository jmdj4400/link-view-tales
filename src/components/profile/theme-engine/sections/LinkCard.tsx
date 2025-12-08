import { ExternalLink, Star, ArrowRight, Link2 } from "lucide-react";
import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LinkCardProps {
  id: string;
  title: string;
  description?: string;
  url: string;
  isFeatured?: boolean;
  theme: ThemePreset;
  onClick?: (id: string, url: string) => void;
  index?: number;
}

export function LinkCard({ 
  id, 
  title, 
  description, 
  url, 
  isFeatured, 
  theme, 
  onClick,
  index = 0 
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { cards, buttons, colors, typography, icons, effects } = theme;

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: typography.bodyFont,
      borderRadius: `${cards.borderRadius}px`,
      borderWidth: `${cards.borderWidth}px`,
      borderColor: isFeatured ? colors.accent : colors.cardBorder,
      backgroundColor: colors.cardBackground,
      color: colors.text,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // Card style variations
    switch (cards.style) {
      case 'neon':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? `0 0 30px ${cards.glowColor || colors.primary}40, inset 0 0 20px ${cards.glowColor || colors.primary}10`
            : `0 0 15px ${cards.glowColor || colors.primary}20`,
        };
      case 'glass':
        return {
          ...baseStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: `${colors.cardBackground}`,
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
        };
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? '0 20px 40px -10px rgba(0,0,0,0.25)' 
            : '0 10px 30px -10px rgba(0,0,0,0.15)',
        };
      default:
        return baseStyles;
    }
  };

  const getHoverTransform = () => {
    if (!isHovered) return 'none';
    
    switch (buttons.hoverEffect) {
      case 'scale': return 'scale(1.02)';
      case 'tilt': return 'perspective(1000px) rotateX(-2deg) rotateY(2deg)';
      case 'slide': return 'translateX(8px)';
      default: return 'none';
    }
  };

  const getAnimationDelay = () => {
    switch (effects.linkAnimation) {
      case 'fade':
      case 'slide':
      case 'scale':
        return { animationDelay: `${index * 100}ms` };
      default:
        return {};
    }
  };

  const getAnimationClass = () => {
    switch (effects.linkAnimation) {
      case 'fade': return 'animate-fade-in';
      case 'slide': return 'animate-slide-in-right';
      case 'scale': return 'animate-scale-in';
      case 'bounce': return 'animate-bounce-in';
      default: return '';
    }
  };

  const renderIcon = () => {
    if (icons.style === 'none' || icons.position === 'none') return null;
    
    const iconProps = {
      className: cn(
        "transition-transform",
        isHovered && "translate-x-1"
      ),
      size: 18,
      style: { color: colors.textMuted },
    };

    switch (icons.style) {
      case 'filled':
        return <ExternalLink {...iconProps} fill="currentColor" />;
      case 'minimal':
        return <ArrowRight {...iconProps} />;
      default:
        return <Link2 {...iconProps} />;
    }
  };

  return (
    <button
      onClick={() => onClick?.(id, url)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full flex items-center gap-4 p-4 md:p-5 group cursor-pointer",
        "border transition-all duration-300",
        getAnimationClass(),
        isFeatured && "ring-2 ring-offset-2"
      )}
      style={{
        ...getCardStyles(),
        transform: getHoverTransform(),
        ...getAnimationDelay(),
        ...(isFeatured ? { 
          ringColor: colors.accent,
        } : {}),
      }}
      aria-label={`Visit ${title}`}
    >
      {/* Featured star */}
      {isFeatured && (
        <Star 
          className="flex-shrink-0 fill-current" 
          size={20}
          style={{ color: colors.accent }}
        />
      )}

      {/* Left icon */}
      {icons.position === 'left' && renderIcon()}

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h3 
          className="font-medium truncate"
          style={{ 
            fontWeight: typography.bodyWeight + 100,
          }}
        >
          {title}
        </h3>
        {description && (
          <p 
            className="text-sm truncate mt-0.5"
            style={{ color: colors.textMuted }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Right icon */}
      {icons.position === 'right' && renderIcon()}

      {/* Gradient border animation for neon theme */}
      {cards.style === 'neon' && isHovered && (
        <div 
          className="absolute inset-0 rounded-inherit pointer-events-none opacity-50"
          style={{
            borderRadius: `${cards.borderRadius}px`,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`,
            backgroundSize: '200% 100%',
            animation: 'gradient-shift 2s linear infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '2px',
          }}
        />
      )}
    </button>
  );
}
