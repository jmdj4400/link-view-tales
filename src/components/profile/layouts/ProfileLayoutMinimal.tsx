import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: theme.backgroundColor }}
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
            <h1 
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              {profile.name}
            </h1>
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
              className={`w-full text-left py-4 px-2 group transition-all duration-200 ${animationEnabled ? "hover:px-4" : ""}`}
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
  );
}
