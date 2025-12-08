import { ThemePreset, CURATED_FONTS } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TypographyControlsProps {
  typography: ThemePreset['typography'];
  onChange: (updates: Partial<ThemePreset['typography']>) => void;
}

export function TypographyControls({ typography, onChange }: TypographyControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Typography</h3>
      
      <div className="space-y-2">
        <Label>Heading Font</Label>
        <Select 
          value={typography.headingFont} 
          onValueChange={(value) => onChange({ headingFont: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURATED_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
            {/* Additional popular fonts */}
            <SelectItem value="Playfair Display">
              <span style={{ fontFamily: 'Playfair Display' }}>Playfair Display</span>
            </SelectItem>
            <SelectItem value="Poppins">
              <span style={{ fontFamily: 'Poppins' }}>Poppins</span>
            </SelectItem>
            <SelectItem value="Montserrat">
              <span style={{ fontFamily: 'Montserrat' }}>Montserrat</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Body Font</Label>
        <Select 
          value={typography.bodyFont} 
          onValueChange={(value) => onChange({ bodyFont: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURATED_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
            <SelectItem value="Roboto">
              <span style={{ fontFamily: 'Roboto' }}>Roboto</span>
            </SelectItem>
            <SelectItem value="Open Sans">
              <span style={{ fontFamily: 'Open Sans' }}>Open Sans</span>
            </SelectItem>
            <SelectItem value="Lato">
              <span style={{ fontFamily: 'Lato' }}>Lato</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Heading Weight</Label>
        <Select 
          value={String(typography.headingWeight)} 
          onValueChange={(value) => onChange({ headingWeight: Number(value) })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="400">Regular (400)</SelectItem>
            <SelectItem value="500">Medium (500)</SelectItem>
            <SelectItem value="600">Semi-Bold (600)</SelectItem>
            <SelectItem value="700">Bold (700)</SelectItem>
            <SelectItem value="800">Extra-Bold (800)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
