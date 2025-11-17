import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ParticleEffect } from "@/components/profile/effects/ParticleEffect";
import { BackgroundEffects } from "@/components/profile/BackgroundEffects";
import { AnimatedText } from "@/components/profile/effects/AnimatedText";

interface Link {
  id: string;
  title: string;
  dest_url: string;
}

interface ProfileLayoutMinimalProps {
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

export function ProfileLayoutMinimal({ profile, links, theme, onLinkClick, animationEnabled = true }: ProfileLayoutMinimalProps) {
  const getLinkAnimationClass = () => {
    if (!animationEnabled) return "";
    switch (theme.linkAnimation) {
      case "slide": return "hover:translate-x-2";
      case "scale": return "hover:scale-105";
      case "glow": return "hover:shadow-lg";
      default: return "";
    }
  };

  return (
    <>
      <ParticleEffect type={theme.particleEffect || 'none'} color={theme.primaryColor} />
      <BackgroundEffects
        videoUrl={theme.backgroundVideoUrl}
        imageUrl={theme.backgroundImageUrl}
        color={theme.backgroundColor}
        enableParallax={theme.enableParallax}
        enableGlassmorphism={theme.enableGlassmorphism}
      />
      
      <div 
        className="min-h-screen flex items-center justify-center p-6 relative z-10"
      >
        <div className="max-w-lg w-full space-y-12">
          {/* Minimal Header */}
          <header className="text-center space-y-6">
            <div className={animationEnabled ? "animate-fade-in" : ""}>
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback style={{ backgroundColor: theme.primaryColor, color: 'white' }}>
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className={animationEnabled ? "animate-fade-in" : ""}>
              <AnimatedText animation={theme.textAnimation || 'none'}>
                <h1 
                  className="text-2xl font-bold tracking-tight"
                  style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                >
                  {profile.name}
                </h1>
              </AnimatedText>
            </div>

            {profile.bio && (
              <p 
                className={`text-sm max-w-md mx-auto leading-relaxed ${animationEnabled ? "animate-fade-in" : ""}`}
                style={{ color: theme.textColor, opacity: 0.7 }}
              >
                {profile.bio}
              </p>
            )}
          </header>

          {/* Ultra-minimal Links */}
          <nav className="space-y-1">
            {links.map((link, index) => (
              <button
                key={link.id}
                onClick={() => onLinkClick(link.id, link.dest_url)}
                className={`w-full text-left py-4 px-2 group transition-all duration-200 ${getLinkAnimationClass()}`}
                style={{
                  borderBottom: `1px solid ${theme.textColor}15`,
                  transitionDelay: animationEnabled ? `${index * 30}ms` : '0ms'
                }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="font-medium group-hover:opacity-100 transition-opacity"
                    style={{ 
                      color: theme.textColor, 
                      opacity: 0.9,
                      fontFamily: theme.bodyFont 
                    }}
                  >
                    {link.title}
                  </span>
                  <span 
                    className="text-xs opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: theme.primaryColor }}
                  >
                    →
                  </span>
                </div>
              </button>
            ))}
          </nav>

          {/* Minimal footer */}
          <footer className="text-center">
            <p 
              className="text-xs"
              style={{ color: theme.textColor, opacity: 0.4 }}
            >
              @{profile.handle}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
