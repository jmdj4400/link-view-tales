import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParticleEffect } from "@/components/profile/effects/ParticleEffect";
import { BackgroundEffects } from "@/components/profile/BackgroundEffects";
import { AnimatedText } from "@/components/profile/effects/AnimatedText";

interface ThemePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: {
    primary_color: string;
    secondary_color: string;
    background_color: string;
    text_color: string;
    accent_color: string;
    heading_font: string;
    body_font: string;
    layout_style: string;
    button_style: string;
    card_style: string;
    particle_effect?: string;
    text_animation?: string;
    link_animation?: string;
    background_video_url?: string;
    background_image_url?: string;
    enable_parallax?: boolean;
    enable_glassmorphism?: boolean;
    gradient_enabled?: boolean;
    gradient_from?: string;
    gradient_to?: string;
  };
}

export function ThemePreview({ open, onOpenChange, theme }: ThemePreviewProps) {
  const getButtonClasses = () => {
    const base = "px-6 py-3 font-medium transition-colors";
    switch (theme.button_style) {
      case "pill":
        return `${base} rounded-full`;
      case "sharp":
        return `${base} rounded-none`;
      default:
        return `${base} rounded-lg`;
    }
  };

  const getCardClasses = () => {
    const base = "p-6";
    switch (theme.card_style) {
      case "outlined":
        return `${base} border-2 rounded-lg`;
      case "flat":
        return `${base} rounded-lg`;
      default:
        return `${base} shadow-lg rounded-lg`;
    }
  };

  const getLayoutClasses = () => {
    switch (theme.layout_style) {
      case "modern":
        return "max-w-md mx-auto space-y-6";
      case "minimal":
        return "max-w-sm mx-auto space-y-8";
      case "bold":
        return "max-w-2xl mx-auto space-y-4";
      default:
        return "max-w-lg mx-auto space-y-6";
    }
  };

  const getLinkAnimationClass = () => {
    switch (theme.link_animation) {
      case "slide": return "hover:translate-x-2";
      case "scale": return "hover:scale-105";
      case "glow": return "hover:shadow-lg";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Theme Preview</DialogTitle>
        </DialogHeader>
        
        <div className="relative rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
          <ParticleEffect type={theme.particle_effect || 'none'} color={theme.primary_color} />
          <BackgroundEffects
            videoUrl={theme.background_video_url}
            imageUrl={theme.background_image_url}
            color={theme.background_color}
            enableParallax={theme.enable_parallax}
            enableGlassmorphism={theme.enable_glassmorphism}
          />
          
          <div
            className="p-8 rounded-lg relative z-10"
            style={{
              backgroundColor: theme.background_video_url || theme.background_image_url ? 'transparent' : theme.background_color,
              color: theme.text_color,
              fontFamily: theme.body_font,
            }}
          >
            <div className={getLayoutClasses()}>
              {/* Profile Header */}
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full mx-auto" style={{ backgroundColor: theme.primary_color }} />
                <AnimatedText animation={theme.text_animation || 'none'}>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: theme.heading_font, color: theme.text_color }}
                  >
                    Your Name
                  </h1>
                </AnimatedText>
              <p style={{ color: theme.text_color, opacity: 0.8 }}>
                This is how your profile will look with these theme settings.
              </p>
            </div>

              {/* Sample Links */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className={`${getCardClasses()} transition-all duration-300 ${getLinkAnimationClass()}`}
                    style={{
                    backgroundColor: theme.layout_style === "bold" ? theme.accent_color : "white",
                    borderColor: theme.card_style === "outlined" ? theme.primary_color : "transparent",
                    color: theme.layout_style === "bold" ? "white" : theme.text_color,
                  }}
                >
                  <div className="text-center font-medium">
                    Sample Link {i}
                  </div>
                </Card>
              ))}
            </div>

            {/* Sample Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                className={getButtonClasses()}
                style={{
                  backgroundColor: theme.primary_color,
                  color: "white",
                }}
              >
                Primary Button
              </button>
              <button
                className={getButtonClasses()}
                style={{
                  backgroundColor: theme.secondary_color,
                  color: "white",
                }}
              >
                Secondary Button
              </button>
            </div>

            {/* Effects Info */}
            <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <p className="text-sm text-center" style={{ color: theme.text_color, opacity: 0.7 }}>
                {theme.particle_effect && theme.particle_effect !== 'none' && `✨ ${theme.particle_effect} particles active • `}
                {theme.text_animation && theme.text_animation !== 'none' && `📝 ${theme.text_animation} text animation • `}
                {theme.link_animation && theme.link_animation !== 'none' && `🔗 ${theme.link_animation} link animation • `}
                {theme.background_video_url && `🎥 Video background • `}
                {theme.background_image_url && `🖼️ Image background • `}
                {theme.enable_parallax && `🌊 Parallax enabled • `}
                {theme.enable_glassmorphism && `🪟 Glassmorphism enabled`}
                {!theme.particle_effect && !theme.text_animation && !theme.link_animation && 
                 !theme.background_video_url && !theme.background_image_url && 
                 !theme.enable_parallax && !theme.enable_glassmorphism && 
                 'No special effects active'}
              </p>
            </div>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
}

