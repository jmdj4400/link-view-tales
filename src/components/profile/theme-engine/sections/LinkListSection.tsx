import { ThemePreset } from "@/lib/theme-presets";
import { LinkCardV3 } from "./LinkCardV3";
import { cn } from "@/lib/utils";

interface Link {
  id: string;
  title: string;
  description?: string;
  dest_url: string;
  isFeatured?: boolean;
}

interface LinkListSectionProps {
  links: Link[];
  theme: ThemePreset;
  onLinkClick?: (id: string, url: string) => void;
}

export function LinkListSection({ links, theme, onLinkClick }: LinkListSectionProps) {
  const { layout, cards } = theme;

  const getSpacingClass = () => {
    switch (layout.spacing) {
      case 'compact': return 'gap-2 md:gap-2';
      case 'relaxed': return 'gap-4 md:gap-5';
      default: return 'gap-2.5 md:gap-3';
    }
  };

  // Map theme card style to V3 card style
  const getCardStyle = (): 'default' | 'hologram' | 'liquid' | 'glass' | 'neon' | 'minimal' | 'bold' => {
    switch (cards.style) {
      case 'neon': return 'neon';
      case 'glass': return 'glass';
      case 'gradient': return 'liquid';
      case 'flat': return 'minimal';
      case 'elevated': return 'bold';
      default: return 'default';
    }
  };

  if (links.length === 0) {
    return (
      <div 
        className="text-center py-8 md:py-12 opacity-60"
        style={{ color: theme.colors.textMuted }}
      >
        <p className="text-sm md:text-base">No links yet</p>
      </div>
    );
  }

  // Separate featured links from regular links
  const featuredLinks = links.filter(link => link.isFeatured);
  const regularLinks = links.filter(link => !link.isFeatured);

  return (
    <nav 
      className={cn("flex flex-col w-full", getSpacingClass())}
      aria-label="Profile links"
    >
      {/* Featured links first */}
      {featuredLinks.map((link, index) => (
        <LinkCardV3
          key={link.id}
          id={link.id}
          title={link.title}
          description={link.description}
          url={link.dest_url}
          isFeatured={true}
          theme={theme}
          onClick={onLinkClick}
          index={index}
          cardStyle={getCardStyle()}
        />
      ))}

      {/* Regular links */}
      {regularLinks.map((link, index) => (
        <LinkCardV3
          key={link.id}
          id={link.id}
          title={link.title}
          description={link.description}
          url={link.dest_url}
          isFeatured={false}
          theme={theme}
          onClick={onLinkClick}
          index={index + featuredLinks.length}
          cardStyle={getCardStyle()}
        />
      ))}
    </nav>
  );
}
