import { ThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

interface NoteBlockSectionProps {
  content: string;
  theme: ThemePreset;
}

export function NoteBlockSection({ content, theme }: NoteBlockSectionProps) {
  const { colors, cards, typography, layout } = theme;

  const getAlignment = () => {
    switch (layout.style) {
      case 'left': return 'text-left';
      case 'asymmetric': return 'text-left md:text-center';
      default: return 'text-center';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 md:p-6",
        getAlignment()
      )}
      style={{
        backgroundColor: `${colors.cardBackground}`,
        borderRadius: `${cards.borderRadius}px`,
        borderWidth: `${cards.borderWidth}px`,
        borderColor: colors.cardBorder,
        borderStyle: 'dashed',
      }}
    >
      <p 
        className="text-sm md:text-base leading-relaxed"
        style={{
          fontFamily: typography.bodyFont,
          color: colors.textMuted,
          fontStyle: 'italic',
        }}
      >
        {content}
      </p>
    </div>
  );
}
