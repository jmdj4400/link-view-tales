import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AIBackgroundGeneratorProps {
  onBackgroundGenerated: (url: string | null, gradient?: string) => void;
  currentBackground?: string;
}

// Pre-generated gradient presets based on common prompts
const AI_GRADIENT_PRESETS: Record<string, { gradient: string; name: string }> = {
  'cyberpunk': {
    gradient: 'linear-gradient(135deg, #0f0f23 0%, #1a0a2e 30%, #2d1b4e 60%, #0f0f23 100%)',
    name: 'Cyberpunk Neon',
  },
  'neon': {
    gradient: 'linear-gradient(135deg, #120458 0%, #000000 50%, #120458 100%)',
    name: 'Neon Nights',
  },
  'sunset': {
    gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    name: 'Sunset Glow',
  },
  'ocean': {
    gradient: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)',
    name: 'Ocean Depths',
  },
  'forest': {
    gradient: 'linear-gradient(135deg, #1a472a 0%, #2d5a27 50%, #4a7c23 100%)',
    name: 'Forest Mist',
  },
  'galaxy': {
    gradient: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)',
    name: 'Galaxy',
  },
  'aurora': {
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 20%, #0f3460 40%, #4ecca3 60%, #7c3aed 80%, #1a1a2e 100%)',
    name: 'Aurora Borealis',
  },
  'minimal': {
    gradient: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    name: 'Clean White',
  },
  'dark': {
    gradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
    name: 'Pure Dark',
  },
  'pastel': {
    gradient: 'linear-gradient(135deg, #fef9ef 0%, #fdf6e9 50%, #fff5f5 100%)',
    name: 'Soft Pastel',
  },
  'fire': {
    gradient: 'linear-gradient(135deg, #1a0a00 0%, #4a1500 30%, #8b2500 60%, #ff4500 100%)',
    name: 'Fire & Flames',
  },
  'ice': {
    gradient: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 30%, #80deea 60%, #4dd0e1 100%)',
    name: 'Frozen Ice',
  },
};

export function AIBackgroundGenerator({ onBackgroundGenerated, currentBackground }: AIBackgroundGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  const generateBackground = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      // Match prompt keywords to presets
      const lowerPrompt = prompt.toLowerCase();
      let matchedGradient: string | null = null;

      for (const [keyword, preset] of Object.entries(AI_GRADIENT_PRESETS)) {
        if (lowerPrompt.includes(keyword)) {
          matchedGradient = preset.gradient;
          break;
        }
      }

      // If no match, generate a custom gradient based on dominant colors in prompt
      if (!matchedGradient) {
        matchedGradient = generateCustomGradient(lowerPrompt);
      }

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGeneratedPreview(matchedGradient);
      toast.success("Background generated! Click 'Apply' to use it.");
    } catch (error) {
      toast.error("Failed to generate background. Using fallback gradient.");
      setGeneratedPreview('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCustomGradient = (prompt: string): string => {
    // Color keywords mapping
    const colorKeywords: Record<string, string> = {
      'red': '#ff6b6b',
      'blue': '#4facfe',
      'green': '#00f260',
      'purple': '#7c3aed',
      'pink': '#ff9ff3',
      'orange': '#ff9a44',
      'yellow': '#feca57',
      'teal': '#4ecca3',
      'cyan': '#00ffff',
      'magenta': '#ff00ff',
      'gold': '#f9d423',
      'silver': '#c0c0c0',
      'black': '#0a0a0a',
      'white': '#f8f9fa',
      'gray': '#6b7280',
      'grey': '#6b7280',
    };

    // Find colors mentioned in prompt
    const foundColors: string[] = [];
    for (const [keyword, color] of Object.entries(colorKeywords)) {
      if (prompt.includes(keyword)) {
        foundColors.push(color);
      }
    }

    // Default colors if none found
    if (foundColors.length === 0) {
      foundColors.push('#667eea', '#764ba2');
    } else if (foundColors.length === 1) {
      foundColors.push(adjustBrightness(foundColors[0], -30));
    }

    // Determine gradient direction based on keywords
    let angle = 135;
    if (prompt.includes('vertical') || prompt.includes('top')) angle = 180;
    if (prompt.includes('horizontal') || prompt.includes('left')) angle = 90;
    if (prompt.includes('radial') || prompt.includes('circle')) {
      return `radial-gradient(circle at center, ${foundColors.join(', ')})`;
    }

    return `linear-gradient(${angle}deg, ${foundColors.join(', ')})`;
  };

  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  const applyBackground = () => {
    if (generatedPreview) {
      onBackgroundGenerated(null, generatedPreview);
      toast.success("Background applied!");
    }
  };

  const selectPreset = (preset: typeof AI_GRADIENT_PRESETS[string]) => {
    setGeneratedPreview(preset.gradient);
    setPrompt(preset.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">AI Background Generator</Label>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="e.g., cyberpunk neon city, sunset ocean..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateBackground()}
            className="flex-1"
          />
          <Button 
            onClick={generateBackground} 
            disabled={isGenerating}
            size="icon"
            variant="secondary"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick presets */}
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(AI_GRADIENT_PRESETS).slice(0, 8).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => selectPreset(preset)}
              className="h-8 rounded-md border border-border/50 transition-all hover:scale-105 hover:border-primary"
              style={{ background: preset.gradient }}
              title={preset.name}
            />
          ))}
        </div>

        {/* Preview */}
        {generatedPreview && (
          <Card className="p-3 space-y-2">
            <div 
              className="h-24 rounded-lg"
              style={{ background: generatedPreview }}
            />
            <div className="flex gap-2">
              <Button 
                onClick={applyBackground}
                className="flex-1"
                size="sm"
              >
                Apply Background
              </Button>
              <Button
                onClick={() => generateBackground()}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
