import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, QrCode } from "lucide-react";

interface Profile {
  name: string;
  handle: string;
  bio: string;
  avatar_url: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
  accent_color?: string;
  heading_font?: string;
  body_font?: string;
  layout_style?: string;
  button_style?: string;
  card_style?: string;
}

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
}

interface PublicProfilePreviewProps {
  profile: Profile;
  links: Link[];
}

export function PublicProfilePreview({ profile, links }: PublicProfilePreviewProps) {
  const theme = {
    primaryColor: profile.primary_color || "#3b82f6",
    secondaryColor: profile.secondary_color || "#8b5cf6",
    backgroundColor: profile.background_color || "#ffffff",
    textColor: profile.text_color || "#000000",
    accentColor: profile.accent_color || "#10b981",
    headingFont: profile.heading_font || "Inter",
    bodyFont: profile.body_font || "Inter",
    layoutStyle: profile.layout_style || "classic",
    buttonStyle: profile.button_style || "rounded",
    cardStyle: profile.card_style || "elevated",
  };

  const getButtonClasses = () => {
    const base = "w-full h-auto py-4 justify-between transition-all cursor-default";
    const shadow = theme.cardStyle === "elevated" ? "hover:shadow-md" : "";
    switch (theme.buttonStyle) {
      case "pill":
        return `${base} ${shadow} rounded-full`;
      case "sharp":
        return `${base} ${shadow} rounded-none`;
      default:
        return `${base} ${shadow} rounded-lg`;
    }
  };

  const getContainerClasses = () => {
    switch (theme.layoutStyle) {
      case "modern":
        return "w-full max-w-md space-y-8";
      case "minimal":
        return "w-full max-w-sm space-y-10";
      case "bold":
        return "w-full max-w-2xl space-y-6";
      default:
        return "w-full max-w-lg space-y-8";
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.bodyFont,
      }}
    >
      <div className={getContainerClasses()}>
        <div className="text-center space-y-4">
          <Avatar 
            className="h-24 w-24 mx-auto"
            style={{ borderColor: theme.primaryColor, borderWidth: '3px' }}
          >
            <AvatarImage 
              src={profile.avatar_url} 
              alt={`${profile.name}'s profile picture`}
            />
            <AvatarFallback 
              className="text-xl"
              style={{ backgroundColor: theme.primaryColor, color: 'white' }}
            >
              {profile.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: theme.headingFont, color: theme.textColor }}
            >
              {profile.name}
            </h1>
            <p style={{ color: theme.textColor, opacity: 0.7 }}>@{profile.handle}</p>
          </div>
          {profile.bio && (
            <p 
              className="text-center max-w-sm mx-auto"
              style={{ color: theme.textColor, opacity: 0.8 }}
            >
              {profile.bio}
            </p>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 cursor-default"
            style={{
              borderColor: theme.accentColor,
              color: theme.accentColor,
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Share QR Code
          </Button>
        </div>

        <div className="space-y-3">
          {links.length === 0 ? (
            <p 
              className="text-center py-8"
              style={{ color: theme.textColor, opacity: 0.7 }}
            >
              No links yet
            </p>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                className={getButtonClasses()}
                style={{
                  backgroundColor: theme.layoutStyle === "bold" ? theme.primaryColor : "white",
                  color: theme.layoutStyle === "bold" ? "white" : theme.textColor,
                  borderWidth: theme.cardStyle === "outlined" ? "2px" : "1px",
                  borderColor: theme.primaryColor,
                  fontFamily: theme.bodyFont,
                }}
              >
                <span className="font-medium">{link.title}</span>
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            ))
          )}
        </div>

        <div className="text-center pt-6">
          <span 
            className="text-sm"
            style={{ 
              color: theme.textColor, 
              opacity: 0.6,
            }}
          >
            Create your own with LinkPeek
          </span>
        </div>
      </div>
    </div>
  );
}
