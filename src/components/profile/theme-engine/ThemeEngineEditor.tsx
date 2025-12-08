import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemePreset, THEME_PRESETS, getDefaultPreset } from "@/lib/theme-presets";
import { ThemeRenderer } from "./ThemeRenderer";
import { ThemeCustomizationPanel } from "./ThemeCustomizationPanel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, Eye, EyeOff, Smartphone, Monitor, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Sample links for preview
const SAMPLE_LINKS = [
  { id: '1', title: 'My Website', description: 'Check out my portfolio', dest_url: '#', isFeatured: true },
  { id: '2', title: 'YouTube Channel', description: 'Subscribe for more content', dest_url: '#' },
  { id: '3', title: 'Twitter / X', dest_url: '#' },
  { id: '4', title: 'Latest Project', dest_url: '#' },
];

export function ThemeEngineEditor() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemePreset>(getDefaultPreset());
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile-for-theme-engine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user links for preview
  const { data: userLinks = [] } = useQuery({
    queryKey: ["links-for-theme-engine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("links")
        .select("id, title, dest_url")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("position", { ascending: true })
        .limit(5);
      
      if (error) return [];
      return data || [];
    },
  });

  // Convert stored profile theme to ThemePreset format
  useEffect(() => {
    if (profile) {
      // Find matching preset or use custom theme
      const matchingPreset = THEME_PRESETS.find(p => p.id === profile.profile_layout);
      if (matchingPreset) {
        // Start with preset and override with stored colors
        setTheme({
          ...matchingPreset,
          colors: {
            ...matchingPreset.colors,
            primary: profile.primary_color || matchingPreset.colors.primary,
            secondary: profile.secondary_color || matchingPreset.colors.secondary,
            accent: profile.accent_color || matchingPreset.colors.accent,
            text: profile.text_color || matchingPreset.colors.text,
          },
          typography: {
            ...matchingPreset.typography,
            headingFont: profile.heading_font || matchingPreset.typography.headingFont,
            bodyFont: profile.body_font || matchingPreset.typography.bodyFont,
          },
          effects: {
            ...matchingPreset.effects,
            particles: (profile.particle_effect as any) || matchingPreset.effects.particles,
            textAnimation: (profile.text_animation as any) || matchingPreset.effects.textAnimation,
            linkAnimation: (profile.link_animation as any) || matchingPreset.effects.linkAnimation,
            glassmorphism: profile.enable_glassmorphism || matchingPreset.effects.glassmorphism,
            parallax: profile.enable_parallax || matchingPreset.effects.parallax,
          },
        });
      }
    }
  }, [profile]);

  // Save theme mutation
  const saveMutation = useMutation({
    mutationFn: async (themeData: ThemePreset) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert ThemePreset to profile columns
      const profileUpdate = {
        profile_layout: themeData.id,
        primary_color: themeData.colors.primary,
        secondary_color: themeData.colors.secondary,
        accent_color: themeData.colors.accent,
        text_color: themeData.colors.text,
        background_color: themeData.background.color || themeData.background.gradientFrom,
        heading_font: themeData.typography.headingFont,
        body_font: themeData.typography.bodyFont,
        button_style: themeData.buttons.shape,
        card_style: themeData.cards.style,
        card_border_width: themeData.cards.borderWidth,
        particle_effect: themeData.effects.particles,
        text_animation: themeData.effects.textAnimation,
        link_animation: themeData.effects.linkAnimation,
        enable_glassmorphism: themeData.effects.glassmorphism,
        enable_parallax: themeData.effects.parallax,
        gradient_enabled: themeData.background.type === 'gradient',
        gradient_from: themeData.background.gradientFrom,
        gradient_to: themeData.background.gradientTo,
        background_video_url: themeData.background.videoUrl,
        background_image_url: themeData.background.imageUrl,
        animation_enabled: themeData.effects.textAnimation !== 'none' || themeData.effects.linkAnimation !== 'none',
      };

      const { error } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-for-theme-engine"] });
      toast.success("Theme saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save theme");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(theme);
  };

  const handleReset = () => {
    setTheme(getDefaultPreset());
    toast.info("Theme reset to default");
  };

  const previewProfile = {
    name: profile?.name || "Your Name",
    handle: profile?.handle || "yourhandle",
    bio: profile?.bio || "Your bio goes here",
    avatar_url: profile?.avatar_url,
  };

  const previewLinks = userLinks.length > 0 
    ? userLinks.map(l => ({ ...l, description: undefined, isFeatured: false }))
    : SAMPLE_LINKS;

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Theme Engine</h2>
          <p className="text-muted-foreground text-sm">Customize your public profile appearance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {saveMutation.isPending ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Controls Panel */}
        <Card className={cn(
          "p-4 overflow-hidden",
          showPreview ? "w-1/3" : "w-full max-w-xl mx-auto"
        )}>
          <ThemeCustomizationPanel
            theme={theme}
            onThemeChange={setTheme}
            onPresetSelect={setTheme}
          />
        </Card>

        {/* Preview Panel */}
        {showPreview && (
          <Card className="flex-1 overflow-hidden flex flex-col">
            {/* Device toggle */}
            <div className="flex items-center justify-center gap-2 p-3 border-b shrink-0">
              <Button
                variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
              <Button
                variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewDevice('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
            </div>

            {/* Preview iframe-like container */}
            <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center overflow-auto">
              <div 
                className={cn(
                  "bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300",
                  previewDevice === 'mobile' 
                    ? "w-[375px] h-[667px]" 
                    : "w-full max-w-4xl h-full"
                )}
                style={{
                  transform: previewDevice === 'mobile' ? 'scale(0.85)' : 'scale(1)',
                  transformOrigin: 'center center',
                }}
              >
                <div className="w-full h-full overflow-auto">
                  <ThemeRenderer
                    profile={previewProfile}
                    links={previewLinks}
                    theme={theme}
                    onLinkClick={() => {}}
                    showFooter={false}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
