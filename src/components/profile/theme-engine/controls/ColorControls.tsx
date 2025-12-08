import { ThemePreset } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorControlsProps {
  colors: ThemePreset['colors'];
  onChange: (updates: Partial<ThemePreset['colors']>) => void;
}

const COLOR_FIELDS: { key: keyof ThemePreset['colors']; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'text', label: 'Text' },
  { key: 'textMuted', label: 'Text Muted' },
  { key: 'cardBackground', label: 'Card Background' },
  { key: 'cardBorder', label: 'Card Border' },
];

export function ColorControls({ colors, onChange }: ColorControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Colors</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={colors[key].startsWith('rgba') ? '#ffffff' : colors[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                className="w-10 h-9 p-1 cursor-pointer"
              />
              <Input
                value={colors[key]}
                onChange={(e) => onChange({ [key]: e.target.value })}
                className="flex-1 h-9 text-xs"
                placeholder="#000000"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
