import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import { ParticleEffect } from "@/components/profile/effects/ParticleEffect";
import { BackgroundEffects } from "@/components/profile/BackgroundEffects";
import { AnimatedText } from "@/components/profile/effects/AnimatedText";

interface Link {
  id: string;
  title: string;
  dest_url: string;
}

interface ProfileLayoutNeonProps {
  profile: {
    name: string;
    handle: string;
    bio: string;
    avatar_url: string;
  };
  links: Link[];
  theme: any;
  onLinkClick: (linkId: string, destUrl: string) => void;
  animationEnabled?: boolean;
}

export function ProfileLayoutNeon({ profile, links, theme, onLinkClick, animationEnabled = true }: ProfileLayoutNeonProps) {
  const getLinkAnimationClass = () => {
    if (!animationEnabled) return "";
    switch (theme.linkAnimation) {
      case "slide": return "hover:translate-x-2";
      case "scale": return "hover:scale-105";
      case "glow": return "hover:shadow-2xl";
      default: return "hover:-translate-y-1";
    }
  };

  return (
    <>
      <ParticleEffect type={theme.particleEffect || 'none'} color={theme.primaryColor} />
      <BackgroundEffects
        videoUrl={theme.backgroundVideoUrl}
        imageUrl={theme.backgroundImageUrl}
        enableParallax={theme.enableParallax}
        enableGlassmorphism={theme.enableGlassmorphism}
      />
      
      <div
        className="min-h-screen p-6 relative overflow-hidden z-10"
        style={{ 
          backgroundColor: theme.backgroundImageUrl || theme.backgroundVideoUrl ? 'transparent' : '#0a0a0f',
          backgroundImage: !theme.backgroundImageUrl && !theme.backgroundVideoUrl ? `
            radial-gradient(circle at 20% 20%, ${theme.primaryColor}15 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, ${theme.accentColor}15 0%, transparent 50%)
          ` : undefined
        }}
    >
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative max-w-2xl mx-auto space-y-8">
        {/* Header with glow */}
        <header className="text-center space-y-6">
          <div className={`relative inline-block ${animationEnabled ? "animate-scale-in" : ""}`}>
            <Avatar 
              className="h-32 w-32 mx-auto relative z-10"
              style={{ 
                border: `3px solid ${theme.primaryColor}`,
                boxShadow: `0 0 40px ${theme.primaryColor}50`
              }}
            >
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback style={{ backgroundColor: theme.primaryColor }}>
                {profile.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 blur-3xl -z-10"
              style={{ backgroundColor: theme.primaryColor, opacity: 0.3 }}
            />
          </div>

            <div className={animationEnabled ? "animate-fade-in" : ""}>
              <AnimatedText animation={theme.textAnimation || 'none'}>
                <h1 
                  className="text-5xl font-bold mb-2 font-mono-data"
                  style={{ 
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#fff',
                    textShadow: `0 0 20px ${theme.primaryColor}80`
                  }}
                >
                  {profile.name}
                </h1>
              </AnimatedText>
            <p 
              className="text-lg font-mono opacity-70"
              style={{ color: theme.primaryColor }}
            >
              @{profile.handle}
            </p>
          </div>

          {profile.bio && (
            <p 
              className={`text-center max-w-xl mx-auto leading-relaxed ${animationEnabled ? "animate-fade-in" : ""}`}
              style={{ color: '#a0a0a0' }}
            >
              {profile.bio}
            </p>
          )}
        </header>

        {/* Neon Links */}
        <nav className="space-y-4">
          {links.map((link, index) => (
            <button
              key={link.id}
              onClick={() => onLinkClick(link.id, link.dest_url)}
              className={`w-full group relative overflow-hidden rounded-lg p-5 transition-all duration-300 ${getLinkAnimationClass()}`}
              style={{
                backgroundColor: 'rgba(10, 10, 20, 0.8)',
                border: `2px solid ${theme.primaryColor}`,
                boxShadow: `0 0 20px ${theme.primaryColor}30`,
                backdropFilter: 'blur(10px)',
                transitionDelay: animationEnabled ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className="flex items-center justify-between relative z-10">
                <span 
                  className="text-lg font-semibold"
                  style={{ color: '#fff', fontFamily: theme.bodyFont }}
                >
                  {link.title}
                </span>
                <ExternalLink 
                  className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" 
                  style={{ color: theme.primaryColor }} 
                />
              </div>
              
              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{ backgroundColor: theme.primaryColor, opacity: 0.1 }}
              />
              
              {/* Scan line effect */}
              <div 
                className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity ${animationEnabled ? "scan-line" : ""}`}
                style={{ 
                  background: `linear-gradient(to bottom, transparent, ${theme.primaryColor}30, transparent)`
                }}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
    </>
  );
}
