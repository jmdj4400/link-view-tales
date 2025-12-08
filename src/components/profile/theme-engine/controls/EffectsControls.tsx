import { ThemePreset } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EffectsControlsProps {
  effects: ThemePreset['effects'];
  icons: ThemePreset['icons'];
  onEffectsChange: (updates: Partial<ThemePreset['effects']>) => void;
  onIconsChange: (updates: Partial<ThemePreset['icons']>) => void;
}

export function EffectsControls({ 
  effects, 
  icons,
  onEffectsChange,
  onIconsChange
}: EffectsControlsProps) {
  return (
    <div className="space-y-6">
      {/* Particle Effects */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Visual Effects</h3>
        
        <div className="space-y-2">
          <Label>Particles</Label>
          <Select 
            value={effects.particles} 
            onValueChange={(value: ThemePreset['effects']['particles']) => 
              onEffectsChange({ particles: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="snow">Snow</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="fireflies">Fireflies</SelectItem>
              <SelectItem value="bubbles">Bubbles</SelectItem>
              <SelectItem value="confetti">Confetti</SelectItem>
              <SelectItem value="matrix">Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Text Animation</Label>
          <Select 
            value={effects.textAnimation} 
            onValueChange={(value: ThemePreset['effects']['textAnimation']) => 
              onEffectsChange({ textAnimation: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="gradient">Gradient Flow</SelectItem>
              <SelectItem value="glow">Glow Pulse</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="glitch">Glitch</SelectItem>
              <SelectItem value="typewriter">Typewriter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Link Animation</Label>
          <Select 
            value={effects.linkAnimation} 
            onValueChange={(value: ThemePreset['effects']['linkAnimation']) => 
              onEffectsChange({ linkAnimation: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade In</SelectItem>
              <SelectItem value="slide">Slide In</SelectItem>
              <SelectItem value="scale">Scale In</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="flip">Flip</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label>Aurora Background</Label>
          <Switch
            checked={effects.aurora}
            onCheckedChange={(checked) => onEffectsChange({ aurora: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Glassmorphism</Label>
          <Switch
            checked={effects.glassmorphism}
            onCheckedChange={(checked) => onEffectsChange({ glassmorphism: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Parallax</Label>
          <Switch
            checked={effects.parallax}
            onCheckedChange={(checked) => onEffectsChange({ parallax: checked })}
          />
        </div>
      </div>

      {/* Icon Style */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Link Icons</h3>
        
        <div className="space-y-2">
          <Label>Icon Style</Label>
          <Select 
            value={icons.style} 
            onValueChange={(value: ThemePreset['icons']['style']) => 
              onIconsChange({ style: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="outlined">Outlined</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="minimal">Minimal Arrow</SelectItem>
              <SelectItem value="none">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Icon Position</Label>
          <Select 
            value={icons.position} 
            onValueChange={(value: ThemePreset['icons']['position']) => 
              onIconsChange({ position: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
