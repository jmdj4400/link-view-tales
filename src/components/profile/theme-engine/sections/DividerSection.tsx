import { ThemePreset } from "@/lib/theme-presets";

interface DividerSectionProps {
  theme: ThemePreset;
  style?: 'line' | 'dots' | 'gradient';
}

export function DividerSection({ theme, style = 'line' }: DividerSectionProps) {
  const { colors } = theme;

  if (style === 'dots') {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.textMuted }}
          />
        ))}
      </div>
    );
  }

  if (style === 'gradient') {
    return (
      <div className="py-4">
        <div 
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="py-4">
      <div 
        className="h-px w-full opacity-30"
        style={{ backgroundColor: colors.textMuted }}
      />
    </div>
  );
}
