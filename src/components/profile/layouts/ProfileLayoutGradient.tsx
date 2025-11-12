import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

interface Link {
  id: string;
  title: string;
  dest_url: string;
}

interface ProfileLayoutGradientProps {
  profile: {
    name: string;
    handle: string;
    bio: string;
    avatar_url: string;
  };
  links: Link[];
  theme: any;
  onLinkClick: (linkId: string, destUrl: string) => void;
  gradientFrom?: string;
  gradientTo?: string;
  animationEnabled?: boolean;
}

export function ProfileLayoutGradient({ 
  profile, 
  links, 
  theme, 
  onLinkClick, 
  gradientFrom, 
  gradientTo,
  animationEnabled = true 
}: ProfileLayoutGradientProps) {
  const gradient = `linear-gradient(135deg, ${gradientFrom || theme.primaryColor}, ${gradientTo || theme.secondaryColor})`;

  return (
    <div 
      className="min-h-screen p-6"
      style={{ 
        background: gradient,
        position: 'relative'
      }}
    >
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-90" style={{ background: theme.backgroundColor }} />
      
      <div className="relative max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-6 pt-8">
          <div className={`relative ${animationEnabled ? "animate-scale-in" : ""}`}>
            <div className="relative inline-block">
              <Avatar 
                className="h-28 w-28 mx-auto ring-4 ring-white/20"
              >
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback 
                  style={{ 
                    background: gradient,
                    color: 'white'
                  }}
                >
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Gradient glow */}
              <div 
                className="absolute inset-0 rounded-full blur-2xl -z-10 opacity-60"
                style={{ background: gradient }}
              />
            </div>
          </div>

          <div className={animationEnabled ? "animate-fade-in" : ""}>
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              {profile.name}
            </h1>
            <p 
              className="text-lg"
              style={{ 
                color: theme.textColor, 
                opacity: 0.7,
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              @{profile.handle}
            </p>
          </div>

          {profile.bio && (
            <p 
              className={`text-center max-w-xl mx-auto leading-relaxed ${animationEnabled ? "animate-fade-in" : ""}`}
              style={{ color: theme.textColor, opacity: 0.85 }}
            >
              {profile.bio}
            </p>
          )}
        </header>

        {/* Gradient Links */}
        <nav className="space-y-4">
          {links.map((link, index) => (
            <button
              key={link.id}
              onClick={() => onLinkClick(link.id, link.dest_url)}
              className={`w-full group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${animationEnabled ? "hover:scale-[1.02]" : ""}`}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transitionDelay: animationEnabled ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className="flex items-center justify-between relative z-10">
                <span 
                  className="text-lg font-semibold"
                  style={{ color: theme.textColor, fontFamily: theme.bodyFont }}
                >
                  {link.title}
                </span>
                <ExternalLink 
                  className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity" 
                  style={{ color: theme.textColor }} 
                />
              </div>
              
              {/* Gradient border on hover */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity p-[2px]"
                style={{ background: gradient }}
              >
                <div 
                  className="w-full h-full rounded-2xl"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
