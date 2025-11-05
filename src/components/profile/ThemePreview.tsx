import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Theme Preview</DialogTitle>
        </DialogHeader>
        
        <div
          className="p-8 rounded-lg"
          style={{
            backgroundColor: theme.background_color,
            color: theme.text_color,
            fontFamily: theme.body_font,
          }}
        >
          <div className={getLayoutClasses()}>
            {/* Profile Header */}
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full mx-auto" style={{ backgroundColor: theme.primary_color }} />
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: theme.heading_font, color: theme.text_color }}
              >
                Your Name
              </h1>
              <p style={{ color: theme.text_color, opacity: 0.8 }}>
                This is how your profile will look with these theme settings.
              </p>
            </div>

            {/* Sample Links */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className={getCardClasses()}
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
                Secondary
              </button>
            </div>

            {/* Accent Elements */}
            <div className="flex gap-2 justify-center">
              <div
                className="w-12 h-1 rounded"
                style={{ backgroundColor: theme.accent_color }}
              />
              <div
                className="w-12 h-1 rounded"
                style={{ backgroundColor: theme.primary_color }}
              />
              <div
                className="w-12 h-1 rounded"
                style={{ backgroundColor: theme.secondary_color }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
