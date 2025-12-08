import { ExternalLink, Star, ArrowRight, Link2, Sparkles } from "lucide-react";
import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
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

export function LinkCardV3({ 
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement>(null);
  
  const { cards, buttons, colors, typography, icons, effects } = theme;
  const activeStyle = overrideStyle || cards.style;

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
      borderRadius: `${cards.borderRadius}px`,
      borderWidth: `${cards.borderWidth}px`,
      borderColor: isFeatured ? colors.accent : colors.cardBorder,
      backgroundColor: colors.cardBackground,
      color: colors.text,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
    };

    switch (activeStyle) {
      case 'hologram':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, 
            ${colors.cardBackground} 0%, 
            ${colors.primary}10 25%, 
            ${colors.secondary}10 50%, 
            ${colors.accent}10 75%, 
            ${colors.cardBackground} 100%)`,
          backgroundSize: '400% 400%',
          animation: isHovered ? 'hologram-shift 3s ease infinite' : 'none',
          boxShadow: isHovered 
            ? `0 0 30px ${colors.primary}30, 0 0 60px ${colors.secondary}20`
            : `0 0 15px ${colors.primary}10`,
          borderColor: 'transparent',
          borderImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}) 1`,
        };
      case 'liquid':
        return {
          ...baseStyles,
          background: `linear-gradient(${mousePosition.x}deg, 
            ${colors.primary}15, 
            ${colors.secondary}15, 
            ${colors.accent}15)`,
          boxShadow: isHovered 
            ? `0 20px 40px -10px ${colors.primary}30` 
            : '0 10px 30px -10px rgba(0,0,0,0.1)',
        };
      case 'neon':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? `0 0 30px ${cards.glowColor || colors.primary}50, 
               0 0 60px ${cards.glowColor || colors.primary}30,
               inset 0 0 30px ${cards.glowColor || colors.primary}10`
            : `0 0 15px ${cards.glowColor || colors.primary}20`,
          borderColor: cards.glowColor || colors.primary,
        };
      case 'glass':
        return {
          ...baseStyles,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: `${colors.cardBackground}`,
          boxShadow: isHovered 
            ? '0 8px 32px rgba(0,0,0,0.15)' 
            : '0 4px 16px rgba(0,0,0,0.1)',
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
            ? `0 20px 40px -10px ${colors.primary}60` 
            : `0 10px 30px -10px ${colors.primary}40`,
        };
      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${colors.primary}25, ${colors.secondary}25)`,
          borderWidth: 0,
        };
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0,0,0,0.25)' 
            : '0 10px 30px -10px rgba(0,0,0,0.15)',
        };
      default:
        return baseStyles;
    }
  };

  const getHoverTransform = () => {
    if (!isHovered) return 'none';
    
    switch (buttons.hoverEffect) {
      case 'scale': return 'scale(1.03) translateY(-2px)';
      case 'tilt': return 'perspective(1000px) rotateX(-2deg) rotateY(2deg)';
      case 'slide': return 'translateX(8px)';
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
        return { animationDelay: `${index * 80}ms` };
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
        "transition-all duration-300",
        isHovered && "translate-x-1 scale-110"
      ),
      size: 18,
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
          '--tw-ring-color': colors.accent,
        } as React.CSSProperties : {}),
      }}
      aria-label={`Visit ${title}`}
    >
      {/* Hologram scanline effect */}
      {activeStyle === 'hologram' && isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, 
              transparent 0%, 
              ${colors.primary}05 50%, 
              transparent 100%)`,
            backgroundSize: '100% 8px',
            animation: 'scanline 2s linear infinite',
          }}
        />
      )}

      {/* Liquid shine effect */}
      {activeStyle === 'liquid' && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(255,255,255,0.15) 0%, 
              transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Featured star */}
      {isFeatured && (
        <div className="relative">
          <Star 
            className="flex-shrink-0 fill-current animate-pulse" 
            size={20}
            style={{ color: colors.accent }}
          />
          <Sparkles 
            className="absolute -top-1 -right-1 w-3 h-3"
            style={{ color: colors.accent }}
          />
        </div>
      )}

      {/* Left icon */}
      {icons.position === 'left' && renderIcon()}

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <h3 
          className={cn(
            "font-medium truncate transition-colors duration-300",
            isHovered && activeStyle !== 'bold' && "text-primary"
          )}
          style={{ 
            fontWeight: typography.bodyWeight + 100,
            color: activeStyle === 'bold' ? colors.cardBackground : undefined,
          }}
        >
          {title}
        </h3>
        {description && (
          <p 
            className="text-sm truncate mt-0.5 transition-opacity duration-300"
            style={{ 
              color: activeStyle === 'bold' ? `${colors.cardBackground}cc` : colors.textMuted,
              opacity: isHovered ? 1 : 0.8,
            }}
          >
            {description}
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
        intensity={cards.glowIntensity || 0.5}
      >
        {cardContent}
      </GlowPulse>
    );
  }

  return cardContent;
}

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
  0% { opacity: 0; transform: scale(0.3) translateY(20px); }
  50% { transform: scale(1.05) translateY(-5px); }
  70% { transform: scale(0.95) translateY(2px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes flip-in {
  0% { opacity: 0; transform: perspective(400px) rotateX(90deg); }
  40% { transform: perspective(400px) rotateX(-10deg); }
  70% { transform: perspective(400px) rotateX(10deg); }
  100% { opacity: 1; transform: perspective(400px) rotateX(0deg); }
}

.fill-mode-forwards {
  animation-fill-mode: forwards;
}

.animate-bounce-in {
  animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-flip-in {
  animation: flip-in 0.6s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  if (!document.querySelector('[data-linkcard-v3-styles]')) {
    styleSheet.setAttribute('data-linkcard-v3-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}
