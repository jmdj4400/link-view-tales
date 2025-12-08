import { ThemePreset, THEME_PRESETS } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface PresetSelectorProps {
  currentPresetId: string;
  onSelect: (preset: ThemePreset) => void;
}

export function PresetSelector({ currentPresetId, onSelect }: PresetSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Theme Presets</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {THEME_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={cn(
              "relative group rounded-xl overflow-hidden transition-all duration-300",
              "border-2 hover:scale-[1.02]",
              currentPresetId === preset.id 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Preview gradient */}
            <div 
              className="h-20 w-full"
              style={{ background: preset.preview }}
            />
            
            {/* Info */}
            <div className="p-3 bg-card">
              <p className="font-medium text-sm text-left">{preset.name}</p>
              <p className="text-xs text-muted-foreground text-left truncate">
                {preset.description}
              </p>
            </div>

            {/* Selected indicator */}
            {currentPresetId === preset.id && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Check size={14} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
