import { ThemePreset } from "@/lib/theme-presets";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LayoutControlsProps {
  layout: ThemePreset['layout'];
  onChange: (updates: Partial<ThemePreset['layout']>) => void;
}

export function LayoutControls({ layout, onChange }: LayoutControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">Layout</h3>
      
      <div className="space-y-2">
        <Label>Alignment</Label>
        <Select 
          value={layout.style} 
          onValueChange={(value: ThemePreset['layout']['style']) => 
            onChange({ style: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centered">Centered</SelectItem>
            <SelectItem value="left">Left-aligned</SelectItem>
            <SelectItem value="asymmetric">Asymmetric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Max Width</Label>
        <Select 
          value={layout.maxWidth} 
          onValueChange={(value: ThemePreset['layout']['maxWidth']) => 
            onChange({ maxWidth: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small (384px)</SelectItem>
            <SelectItem value="md">Medium (448px)</SelectItem>
            <SelectItem value="lg">Large (672px)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Spacing</Label>
        <Select 
          value={layout.spacing} 
          onValueChange={(value: ThemePreset['layout']['spacing']) => 
            onChange({ spacing: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="relaxed">Relaxed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Avatar Size</Label>
        <Select 
          value={layout.avatarSize} 
          onValueChange={(value: ThemePreset['layout']['avatarSize']) => 
            onChange({ avatarSize: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Avatar Style</Label>
        <Select 
          value={layout.avatarStyle} 
          onValueChange={(value: ThemePreset['layout']['avatarStyle']) => 
            onChange({ avatarStyle: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="rounded">Rounded Square</SelectItem>
            <SelectItem value="square">Square</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
