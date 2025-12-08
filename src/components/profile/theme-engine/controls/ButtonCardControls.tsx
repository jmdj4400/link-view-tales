import { ThemePreset } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ButtonCardControlsProps {
  cards: ThemePreset['cards'];
  buttons: ThemePreset['buttons'];
  onCardsChange: (updates: Partial<ThemePreset['cards']>) => void;
  onButtonsChange: (updates: Partial<ThemePreset['buttons']>) => void;
}

export function ButtonCardControls({ 
  cards, 
  buttons, 
  onCardsChange, 
  onButtonsChange 
}: ButtonCardControlsProps) {
  return (
    <div className="space-y-6">
      {/* Card Style */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Card Style</h3>
        
        <div className="space-y-2">
          <Label>Style</Label>
          <Select 
            value={cards.style} 
            onValueChange={(value: ThemePreset['cards']['style']) => 
              onCardsChange({ style: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elevated">Elevated (Shadow)</SelectItem>
              <SelectItem value="outlined">Outlined (Border)</SelectItem>
              <SelectItem value="flat">Flat</SelectItem>
              <SelectItem value="glass">Glassmorphism</SelectItem>
              <SelectItem value="neon">Neon Glow</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="hologram">Hologram (V3)</SelectItem>
              <SelectItem value="liquid">Liquid Gradient (V3)</SelectItem>
              <SelectItem value="minimal">Minimal Outline (V3)</SelectItem>
              <SelectItem value="bold">Bold Block (V3)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Border Radius: {cards.borderRadius}px</Label>
          <Slider
            value={[cards.borderRadius]}
            onValueChange={([value]) => onCardsChange({ borderRadius: value })}
            min={0}
            max={32}
            step={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Border Width: {cards.borderWidth}px</Label>
          <Slider
            value={[cards.borderWidth]}
            onValueChange={([value]) => onCardsChange({ borderWidth: value })}
            min={0}
            max={4}
            step={1}
          />
        </div>

        {cards.style === 'neon' && (
          <>
            <div className="space-y-2">
              <Label>Glow Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={cards.glowColor || '#00ffff'}
                  onChange={(e) => onCardsChange({ glowColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={cards.glowColor || '#00ffff'}
                  onChange={(e) => onCardsChange({ glowColor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Glow Intensity: {((cards.glowIntensity || 0.4) * 100).toFixed(0)}%</Label>
              <Slider
                value={[(cards.glowIntensity || 0.4) * 100]}
                onValueChange={([value]) => onCardsChange({ glowIntensity: value / 100 })}
                min={10}
                max={100}
                step={10}
              />
            </div>
          </>
        )}
      </div>

      {/* Button Style */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Button Style</h3>
        
        <div className="space-y-2">
          <Label>Shape</Label>
          <Select 
            value={buttons.shape} 
            onValueChange={(value: ThemePreset['buttons']['shape']) => 
              onButtonsChange({ shape: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="pill">Pill</SelectItem>
              <SelectItem value="sharp">Sharp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Hover Effect</Label>
          <Select 
            value={buttons.hoverEffect} 
            onValueChange={(value: ThemePreset['buttons']['hoverEffect']) => 
              onButtonsChange({ hoverEffect: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="scale">Scale Up</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
              <SelectItem value="tilt">3D Tilt</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
