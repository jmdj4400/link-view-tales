import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Github, 
  Facebook,
  Mail,
  Globe
} from "lucide-react";

interface SocialLink {
  platform: string;
  url: string;
}

interface SocialIconsSectionProps {
  socials: SocialLink[];
  theme: ThemePreset;
}

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  facebook: Facebook,
  email: Mail,
  website: Globe,
};

export function SocialIconsSection({ socials, theme }: SocialIconsSectionProps) {
  const { colors, cards, layout } = theme;

  if (socials.length === 0) return null;

  const getAlignment = () => {
    switch (layout.style) {
      case 'left': return 'justify-start';
      case 'asymmetric': return 'justify-start md:justify-center';
      default: return 'justify-center';
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-3", getAlignment())}>
      {socials.map((social) => {
        const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Globe;
        
        return (
          <a
            key={social.platform}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              "hover:scale-110 hover:shadow-lg"
            )}
            style={{
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              borderWidth: `${cards.borderWidth}px`,
              borderStyle: 'solid',
              color: colors.text,
            }}
            aria-label={`Visit ${social.platform}`}
          >
            <Icon size={20} />
          </a>
        );
      })}
    </div>
  );
}
