import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Palette, Type, Layout, Save, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ThemePreview } from "./ThemePreview";

interface ThemeData {
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
  background_pattern: string | null;
  background_image_url: string | null;
}

const FONT_OPTIONS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", 
  "Poppins", "Playfair Display", "Merriweather", "Raleway", "Nunito"
];

const LAYOUT_STYLES = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "pill", label: "Pill" },
];

const CARD_STYLES = [
  { value: "elevated", label: "Elevated (Shadow)" },
  { value: "outlined", label: "Outlined (Border)" },
  { value: "flat", label: "Flat" },
];

export function ThemeCustomizer() {
  const queryClient = useQueryClient();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  
  const [theme, setTheme] = useState<ThemeData>({
    primary_color: "#3b82f6",
    secondary_color: "#8b5cf6",
    background_color: "#ffffff",
    text_color: "#000000",
    accent_color: "#10b981",
    heading_font: "Inter",
    body_font: "Inter",
    layout_style: "classic",
    button_style: "rounded",
    card_style: "elevated",
    background_pattern: null,
    background_image_url: null,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-theme"],
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

  const { data: savedPresets = [] } = useQuery({
    queryKey: ["theme-presets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("theme_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setTheme({
        primary_color: profile.primary_color || "#3b82f6",
        secondary_color: profile.secondary_color || "#8b5cf6",
        background_color: profile.background_color || "#ffffff",
        text_color: profile.text_color || "#000000",
        accent_color: profile.accent_color || "#10b981",
        heading_font: profile.heading_font || "Inter",
        body_font: profile.body_font || "Inter",
        layout_style: profile.layout_style || "classic",
        button_style: profile.button_style || "rounded",
        card_style: profile.card_style || "elevated",
        background_pattern: profile.background_pattern,
        background_image_url: profile.background_image_url,
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (themeData: ThemeData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(themeData)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-theme"] });
      toast.success("Theme updated successfully");
    },
    onError: () => toast.error("Failed to update theme"),
  });

  const savePresetMutation = useMutation({
    mutationFn: async ({ name, themeData }: { name: string; themeData: ThemeData }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("theme_presets").insert({
        user_id: user.id,
        name,
        ...themeData,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-presets"] });
      toast.success("Theme preset saved");
      setSaveDialogOpen(false);
      setPresetName("");
    },
    onError: () => toast.error("Failed to save preset"),
  });

  const loadPresetMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const preset = savedPresets.find(p => p.id === presetId);
      if (!preset) throw new Error("Preset not found");

      const themeData: ThemeData = {
        primary_color: preset.primary_color,
        secondary_color: preset.secondary_color,
        background_color: preset.background_color,
        text_color: preset.text_color,
        accent_color: preset.accent_color,
        heading_font: preset.heading_font,
        body_font: preset.body_font,
        layout_style: preset.layout_style,
        button_style: preset.button_style,
        card_style: preset.card_style,
        background_pattern: preset.background_pattern,
        background_image_url: preset.background_image_url,
      };

      setTheme(themeData);
      return updateProfileMutation.mutateAsync(themeData);
    },
    onSuccess: () => toast.success("Preset loaded"),
    onError: () => toast.error("Failed to load preset"),
  });

  const deletePresetMutation = useMutation({
    mutationFn: async (presetId: string) => {
      const { error } = await supabase
        .from("theme_presets")
        .delete()
        .eq("id", presetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-presets"] });
      toast.success("Preset deleted");
    },
    onError: () => toast.error("Failed to delete preset"),
  });

  const handleSaveTheme = () => {
    updateProfileMutation.mutate(theme);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("Please enter a preset name");
      return;
    }
    savePresetMutation.mutate({ name: presetName, themeData: theme });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Theme Customization</h2>
          <p className="text-muted-foreground">Customize your profile's appearance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSaveTheme}>
            <Save className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Layout className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="presets">
            <Save className="h-4 w-4 mr-2" />
            Saved Presets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Choose your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                { key: "primary_color", label: "Primary Color" },
                { key: "secondary_color", label: "Secondary Color" },
                { key: "background_color", label: "Background Color" },
                { key: "text_color", label: "Text Color" },
                { key: "accent_color", label: "Accent Color" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={theme[key as keyof ThemeData] as string}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={theme[key as keyof ThemeData] as string}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Select fonts for your profile</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="heading-font">Heading Font</Label>
                <Select
                  value={theme.heading_font}
                  onValueChange={(value) => setTheme({ ...theme, heading_font: value })}
                >
                  <SelectTrigger id="heading-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <Select
                  value={theme.body_font}
                  onValueChange={(value) => setTheme({ ...theme, body_font: value })}
                >
                  <SelectTrigger id="body-font">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout & Style</CardTitle>
              <CardDescription>Choose your layout preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="layout-style">Layout Style</Label>
                <Select
                  value={theme.layout_style}
                  onValueChange={(value) => setTheme({ ...theme, layout_style: value })}
                >
                  <SelectTrigger id="layout-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="button-style">Button Style</Label>
                <Select
                  value={theme.button_style}
                  onValueChange={(value) => setTheme({ ...theme, button_style: value })}
                >
                  <SelectTrigger id="button-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUTTON_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-style">Card Style</Label>
                <Select
                  value={theme.card_style}
                  onValueChange={(value) => setTheme({ ...theme, card_style: value })}
                >
                  <SelectTrigger id="card-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Saved Presets</span>
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Save Current as Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Theme Preset</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="preset-name">Preset Name</Label>
                        <Input
                          id="preset-name"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="My Brand Theme"
                        />
                      </div>
                      <Button onClick={handleSavePreset} className="w-full">
                        Save Preset
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Load or delete your saved themes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {savedPresets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved presets yet. Create one to save your current theme.
                </p>
              ) : (
                savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: preset.primary_color }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: preset.secondary_color }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: preset.accent_color }}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.layout_style} • {preset.heading_font}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadPresetMutation.mutate(preset.id)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deletePresetMutation.mutate(preset.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ThemePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        theme={theme}
      />
    </div>
  );
}
