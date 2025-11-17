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

interface ProfileLayoutBentoProps {
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

export function ProfileLayoutBento({ profile, links, theme, onLinkClick, animationEnabled = true }: ProfileLayoutBentoProps) {
  const getLinkGridClass = (index: number) => {
    // Create bento-style grid with featured items
    if (links.length === 1) return "col-span-2 row-span-2";
    if (links.length === 2) return "col-span-1 row-span-2";
    if (index === 0) return "col-span-2 row-span-1";
    if (index === links.length - 1 && links.length % 2 === 0) return "col-span-2";
    return "col-span-1";
  };

  const getLinkAnimationClass = () => {
    if (!animationEnabled) return "";
    switch (theme.linkAnimation) {
      case "slide": return "hover:translate-x-2";
      case "scale": return "hover:scale-[1.02]";
      case "glow": return "hover:shadow-2xl";
      default: return "hover:scale-[1.02]";
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
      
      <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className={animationEnabled ? "animate-fade-in" : ""}>
            <Avatar 
              className="h-24 w-24 mx-auto"
              style={{ border: `4px solid ${theme.primaryColor}` }}
            >
              <AvatarImage src={profile.avatar_url} alt={profile.name} />
              <AvatarFallback style={{ backgroundColor: theme.primaryColor, color: 'white' }}>
                {profile.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
            <div className={animationEnabled ? "animate-fade-in" : ""}>
              <AnimatedText animation={theme.textAnimation || 'none'}>
                <h1 
                  className="text-4xl font-bold mb-2"
                  style={{ fontFamily: theme.headingFont, color: theme.textColor }}
                >
                  {profile.name}
                </h1>
              </AnimatedText>
            <p className="text-lg opacity-70" style={{ color: theme.textColor }}>
              @{profile.handle}
            </p>
          </div>
          {profile.bio && (
            <p 
              className={`text-center max-w-2xl mx-auto leading-relaxed ${animationEnabled ? "animate-fade-in" : ""}`}
              style={{ color: theme.textColor, opacity: 0.85 }}
            >
              {profile.bio}
            </p>
          )}
        </header>

        {/* Bento Grid Links */}
        <nav 
          className="grid grid-cols-2 auto-rows-[140px] gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {links.map((link, index) => (
            <button
              key={link.id}
              onClick={() => onLinkClick(link.id, link.dest_url)}
              className={`${getLinkGridClass(index)} group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${getLinkAnimationClass()}`}
              style={{
                backgroundColor: theme.primaryColor,
                boxShadow: theme.cardStyle === "elevated" ? "0 8px 24px rgba(0,0,0,0.1)" : "none",
                border: theme.cardStyle === "outlined" ? `2px solid ${theme.accentColor}` : "none",
              }}
            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex justify-end">
                  <ExternalLink className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: 'white' }} />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold text-white text-left"
                    style={{ fontFamily: theme.bodyFont }}
                  >
                    {link.title}
                  </h3>
                </div>
              </div>
              {/* Gradient overlay on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${theme.accentColor}, transparent)` }}
              />
            </button>
          ))}
        </nav>
      </div>
    </div>
    </>
  );
}
