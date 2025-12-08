import { ThemePreset } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AIBackgroundGenerator } from "./AIBackgroundGenerator";

interface BackgroundControlsProps {
  background: ThemePreset['background'];
  onChange: (updates: Partial<ThemePreset['background']>) => void;
}

export function BackgroundControls({ background, onChange }: BackgroundControlsProps) {
  const handleAIBackgroundGenerated = (url: string | null, gradient?: string) => {
    if (gradient) {
      // Parse gradient to extract colors
      const gradientMatch = gradient.match(/linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/);
      if (gradientMatch) {
        const [, angle, from, to] = gradientMatch;
        onChange({
          type: 'gradient',
          gradientAngle: parseInt(angle),
          gradientFrom: from.trim().split(' ')[0],
          gradientTo: to.trim().split(' ')[0],
        });
      } else {
        // Fallback for complex gradients - use as image
        onChange({ type: 'gradient', gradientFrom: '#667eea', gradientTo: '#764ba2' });
      }
    } else if (url) {
      onChange({ type: 'image', imageUrl: url });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Background</h3>
      
      {/* AI Background Generator */}
      <AIBackgroundGenerator 
        onBackgroundGenerated={handleAIBackgroundGenerated}
        currentBackground={background.imageUrl || background.gradientFrom}
      />

      <Separator className="my-4" />
      
      {/* Background Type */}
      <div className="space-y-2">
        <Label>Type</Label>
        <Select 
          value={background.type} 
          onValueChange={(value: 'solid' | 'gradient' | 'image' | 'video') => 
            onChange({ type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid Color</SelectItem>
            <SelectItem value="gradient">Gradient</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Solid Color */}
      {background.type === 'solid' && (
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={background.color || '#ffffff'}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-16 h-10 p-1"
            />
            <Input
              value={background.color || '#ffffff'}
              onChange={(e) => onChange({ color: e.target.value })}
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {background.type === 'gradient' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={background.gradientFrom || '#667eea'}
                  onChange={(e) => onChange({ gradientFrom: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={background.gradientFrom || '#667eea'}
                  onChange={(e) => onChange({ gradientFrom: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={background.gradientTo || '#764ba2'}
                  onChange={(e) => onChange({ gradientTo: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={background.gradientTo || '#764ba2'}
                  onChange={(e) => onChange({ gradientTo: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Angle: {background.gradientAngle || 135}°</Label>
            <Slider
              value={[background.gradientAngle || 135]}
              onValueChange={([value]) => onChange({ gradientAngle: value })}
              min={0}
              max={360}
              step={15}
            />
          </div>
        </>
      )}

      {/* Image URL */}
      {background.type === 'image' && (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={background.imageUrl || ''}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Video URL */}
      {background.type === 'video' && (
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input
            value={background.videoUrl || ''}
            onChange={(e) => onChange({ videoUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      )}

      {/* Overlay for image/video */}
      {(background.type === 'image' || background.type === 'video') && (
        <div className="space-y-2">
          <Label>Overlay Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={background.overlay?.replace(/[^#\w]/g, '') || '#000000'}
              onChange={(e) => onChange({ overlay: `${e.target.value}80` })}
              className="w-12 h-10 p-1"
            />
            <Input
              value={background.overlay || 'rgba(0,0,0,0.5)'}
              onChange={(e) => onChange({ overlay: e.target.value })}
              placeholder="rgba(0,0,0,0.5)"
            />
          </div>
        </div>
      )}

      {/* Noise Toggle */}
      <div className="flex items-center justify-between">
        <Label>Noise Texture</Label>
        <Switch
          checked={background.noise || false}
          onCheckedChange={(checked) => onChange({ noise: checked })}
        />
      </div>

      {background.noise && (
        <div className="space-y-2">
          <Label>Noise Opacity: {((background.noiseOpacity || 0.03) * 100).toFixed(1)}%</Label>
          <Slider
            value={[(background.noiseOpacity || 0.03) * 100]}
            onValueChange={([value]) => onChange({ noiseOpacity: value / 100 })}
            min={1}
            max={10}
            step={0.5}
          />
        </div>
      )}
    </div>
  );
}
