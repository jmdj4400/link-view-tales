import { ThemePreset } from "@/lib/theme-presets";
import { LinkCard } from "./LinkCard";
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
  const { layout } = theme;

  const getSpacingClass = () => {
    switch (layout.spacing) {
      case 'compact': return 'gap-2';
      case 'relaxed': return 'gap-5';
      default: return 'gap-3';
    }
  };

  if (links.length === 0) {
    return (
      <div 
        className="text-center py-12 opacity-60"
        style={{ color: theme.colors.textMuted }}
      >
        <p>No links yet</p>
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
        <LinkCard
          key={link.id}
          id={link.id}
          title={link.title}
          description={link.description}
          url={link.dest_url}
          isFeatured={true}
          theme={theme}
          onClick={onLinkClick}
          index={index}
        />
      ))}

      {/* Regular links */}
      {regularLinks.map((link, index) => (
        <LinkCard
          key={link.id}
          id={link.id}
          title={link.title}
          description={link.description}
          url={link.dest_url}
          isFeatured={false}
          theme={theme}
          onClick={onLinkClick}
          index={index + featuredLinks.length}
        />
      ))}
    </nav>
  );
}
