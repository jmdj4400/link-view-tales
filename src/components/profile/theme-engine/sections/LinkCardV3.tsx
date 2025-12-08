import { ExternalLink, Star, ArrowRight, Link2, Sparkles } from "lucide-react";
import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, memo } from "react";
import { GlowPulse } from "../effects/GlowPulse";

interface LinkCardV3Props {
  id: string;
  title: string;
  description?: string;
  url: string;
  isFeatured?: boolean;
  theme: ThemePreset;
  onClick?: (id: string, url: string) => void;
  index?: number;
  cardStyle?: 'default' | 'hologram' | 'liquid' | 'glass' | 'neon' | 'minimal' | 'bold';
}

export const LinkCardV3 = memo(function LinkCardV3({ 
  id, 
  title, 
  description, 
  url, 
  isFeatured, 
  theme, 
  onClick,
  index = 0,
  cardStyle: overrideStyle 
}: LinkCardV3Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLButtonElement>(null);
  
  const { cards, buttons, colors, typography, icons, effects } = theme;
  const activeStyle = overrideStyle || cards.style;

  // Truncate title if too long
  const displayTitle = title && title.length > 60 ? title.substring(0, 60) + '...' : title;
  const displayDescription = description && description.length > 80 
    ? description.substring(0, 80) + '...' 
    : description;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const getCardStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: typography.bodyFont,
      borderRadius: `${Math.min(cards.borderRadius, 24)}px`,
      borderWidth: `${cards.borderWidth}px`,
      borderColor: isFeatured ? colors.accent : colors.cardBorder,
      backgroundColor: colors.cardBackground,
      color: colors.text,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    switch (activeStyle) {
      case 'hologram':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, 
            ${colors.cardBackground} 0%, 
            ${colors.primary}08 25%, 
            ${colors.secondary}08 50%, 
            ${colors.accent}08 75%, 
            ${colors.cardBackground} 100%)`,
          backgroundSize: '400% 400%',
          animation: isHovered ? 'hologram-shift 3s ease infinite' : 'none',
          boxShadow: isHovered 
            ? `0 0 20px ${colors.primary}25, 0 0 40px ${colors.secondary}15`
            : `0 0 10px ${colors.primary}08`,
          borderColor: 'transparent',
        };
      case 'liquid':
        return {
          ...baseStyles,
          background: `linear-gradient(${mousePosition.x}deg, 
            ${colors.primary}12, 
            ${colors.secondary}12, 
            ${colors.accent}12)`,
          boxShadow: isHovered 
            ? `0 15px 30px -8px ${colors.primary}25` 
            : '0 8px 20px -8px rgba(0,0,0,0.08)',
        };
      case 'neon':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? `0 0 20px ${cards.glowColor || colors.primary}40, 
               0 0 40px ${cards.glowColor || colors.primary}20,
               inset 0 0 20px ${cards.glowColor || colors.primary}08`
            : `0 0 10px ${cards.glowColor || colors.primary}15`,
          borderColor: cards.glowColor || colors.primary,
        };
      case 'glass':
        return {
          ...baseStyles,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: colors.cardBackground,
          boxShadow: isHovered 
            ? '0 8px 24px rgba(0,0,0,0.12)' 
            : '0 4px 12px rgba(0,0,0,0.08)',
        };
      case 'minimal':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderBottom: `1px solid ${colors.cardBorder}`,
          borderRadius: 0,
        };
      case 'bold':
        return {
          ...baseStyles,
          backgroundColor: colors.primary,
          color: colors.cardBackground,
          borderWidth: 0,
          boxShadow: isHovered 
            ? `0 15px 30px -8px ${colors.primary}50` 
            : `0 8px 20px -8px ${colors.primary}35`,
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
          borderWidth: 0,
        };
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? '0 20px 40px -10px rgba(0,0,0,0.2)' 
            : '0 8px 20px -8px rgba(0,0,0,0.12)',
        };
      default:
        return baseStyles;
    }
  };

  const getHoverTransform = () => {
    if (!isHovered) return 'none';
    
    switch (buttons.hoverEffect) {
      case 'scale': return 'scale(1.02) translateY(-1px)';
      case 'tilt': return 'perspective(1000px) rotateX(-1deg) rotateY(1deg)';
      case 'slide': return 'translateX(6px)';
      case 'glow': return 'scale(1.01)';
      default: return 'none';
    }
  };

  const getAnimationDelay = () => {
    switch (effects.linkAnimation) {
      case 'fade':
      case 'slide':
      case 'scale':
      case 'bounce':
        return { animationDelay: `${index * 60}ms` };
      default:
        return {};
    }
  };

  const getAnimationClass = () => {
    switch (effects.linkAnimation) {
      case 'fade': return 'animate-fade-in opacity-0 fill-mode-forwards';
      case 'slide': return 'animate-slide-in-right opacity-0 fill-mode-forwards';
      case 'scale': return 'animate-scale-in opacity-0 fill-mode-forwards';
      case 'bounce': return 'animate-bounce-in opacity-0 fill-mode-forwards';
      case 'flip': return 'animate-flip-in opacity-0 fill-mode-forwards';
      default: return '';
    }
  };

  const renderIcon = () => {
    if (icons.style === 'none' || icons.position === 'none') return null;
    
    const iconColor = activeStyle === 'bold' ? colors.cardBackground : colors.textMuted;
    const iconProps = {
      className: cn(
        "transition-all duration-200 flex-shrink-0",
        isHovered && "translate-x-0.5 scale-105"
      ),
      size: 16,
      style: { color: iconColor },
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

  const cardContent = (
    <button
      ref={cardRef}
      onClick={() => onClick?.(id, url)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={cn(
        "w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 group cursor-pointer",
        "border transition-all duration-200 touch-manipulation",
        getAnimationClass(),
        isFeatured && "ring-2 ring-offset-2"
      )}
      style={{
        ...getCardStyles(),
        transform: getHoverTransform(),
        ...getAnimationDelay(),
        ...(isFeatured ? { 
          '--tw-ring-color': colors.accent,
        } as React.CSSProperties : {}),
      }}
      aria-label={`Visit ${displayTitle}`}
    >
      {/* Hologram scanline effect - simplified */}
      {activeStyle === 'hologram' && isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: `linear-gradient(180deg, 
              transparent 0%, 
              ${colors.primary}05 50%, 
              transparent 100%)`,
            backgroundSize: '100% 6px',
            animation: 'scanline 1.5s linear infinite',
          }}
        />
      )}

      {/* Liquid shine effect */}
      {activeStyle === 'liquid' && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(255,255,255,0.12) 0%, 
              transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Featured star */}
      {isFeatured && (
        <div className="relative flex-shrink-0">
          <Star 
            className="fill-current animate-pulse" 
            size={18}
            style={{ color: colors.accent }}
          />
          <Sparkles 
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5"
            style={{ color: colors.accent }}
          />
        </div>
      )}

      {/* Left icon */}
      {icons.position === 'left' && renderIcon()}

      {/* Content */}
      <div className="flex-1 text-left min-w-0 overflow-hidden">
        <h3 
          className={cn(
            "font-medium truncate transition-colors duration-200 text-sm md:text-base",
            isHovered && activeStyle !== 'bold' && "text-primary"
          )}
          style={{ 
            fontWeight: typography.bodyWeight + 100,
            color: activeStyle === 'bold' ? colors.cardBackground : undefined,
          }}
        >
          {displayTitle || 'Untitled'}
        </h3>
        {displayDescription && (
          <p 
            className="text-xs md:text-sm truncate mt-0.5 transition-opacity duration-200"
            style={{ 
              color: activeStyle === 'bold' ? `${colors.cardBackground}cc` : colors.textMuted,
              opacity: isHovered ? 1 : 0.75,
            }}
          >
            {displayDescription}
          </p>
        )}
      </div>

      {/* Right icon */}
      {icons.position === 'right' && renderIcon()}
    </button>
  );

  // Wrap with glow effect for featured items or neon style
  if ((isFeatured || activeStyle === 'neon') && buttons.hoverEffect === 'glow') {
    return (
      <GlowPulse 
        enabled={isHovered} 
        color={cards.glowColor || colors.primary}
        intensity={Math.min(cards.glowIntensity || 0.4, 0.6)}
      >
        {cardContent}
      </GlowPulse>
    );
  }

  return cardContent;
});

// Add required CSS animations
const styles = `
@keyframes hologram-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes scanline {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.9) translateY(15px); }
  60% { transform: scale(1.02) translateY(-3px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes flip-in {
  0% { opacity: 0; transform: perspective(400px) rotateX(60deg); }
  100% { opacity: 1; transform: perspective(400px) rotateX(0deg); }
}

.fill-mode-forwards {
  animation-fill-mode: forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-flip-in {
  animation: flip-in 0.4s ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce-in,
  .animate-flip-in,
  [style*="animation"] {
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
`;

// Inject styles once
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('[data-linkcard-v3-styles]');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    styleSheet.setAttribute('data-linkcard-v3-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}
