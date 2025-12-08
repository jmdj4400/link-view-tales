import { useState } from "react";
import { ThemePreset } from "@/lib/theme-presets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PresetSelector } from "./controls/PresetSelector";
import { BackgroundControls } from "./controls/BackgroundControls";
import { ColorControls } from "./controls/ColorControls";
import { TypographyControls } from "./controls/TypographyControls";
import { ButtonCardControls } from "./controls/ButtonCardControls";
import { LayoutControls } from "./controls/LayoutControls";
import { EffectsControls } from "./controls/EffectsControls";
import { Palette, Type, Layout, Sparkles, Image, Layers } from "lucide-react";

interface ThemeCustomizationPanelProps {
  theme: ThemePreset;
  onThemeChange: (theme: ThemePreset) => void;
  onPresetSelect: (preset: ThemePreset) => void;
}

export function ThemeCustomizationPanel({ 
  theme, 
  onThemeChange,
  onPresetSelect 
}: ThemeCustomizationPanelProps) {
  const updateCategory = <K extends keyof ThemePreset>(
    category: K,
    updates: Partial<ThemePreset[K]>
  ) => {
    onThemeChange({
      ...theme,
      [category]: {
        ...(theme[category] as object),
        ...updates,
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="presets" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-6 shrink-0">
          <TabsTrigger value="presets" className="text-xs px-2">
            <Layers className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="background" className="text-xs px-2">
            <Image className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs px-2">
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="typography" className="text-xs px-2">
            <Type className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs px-2">
            <Layout className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-xs px-2">
            <Sparkles className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 mt-4">
          <TabsContent value="presets" className="m-0 p-1">
            <PresetSelector 
              currentPresetId={theme.id} 
              onSelect={onPresetSelect} 
            />
          </TabsContent>

          <TabsContent value="background" className="m-0 p-1">
            <BackgroundControls
              background={theme.background}
              onChange={(updates) => updateCategory('background', updates)}
            />
          </TabsContent>

          <TabsContent value="colors" className="m-0 p-1">
            <ColorControls
              colors={theme.colors}
              onChange={(updates) => updateCategory('colors', updates)}
            />
          </TabsContent>

          <TabsContent value="typography" className="m-0 p-1">
            <TypographyControls
              typography={theme.typography}
              onChange={(updates) => updateCategory('typography', updates)}
            />
          </TabsContent>

          <TabsContent value="layout" className="m-0 p-1 space-y-6">
            <LayoutControls
              layout={theme.layout}
              onChange={(updates) => updateCategory('layout', updates)}
            />
            <ButtonCardControls
              cards={theme.cards}
              buttons={theme.buttons}
              onCardsChange={(updates) => updateCategory('cards', updates)}
              onButtonsChange={(updates) => updateCategory('buttons', updates)}
            />
          </TabsContent>

          <TabsContent value="effects" className="m-0 p-1">
            <EffectsControls
              effects={theme.effects}
              icons={theme.icons}
              onEffectsChange={(updates) => updateCategory('effects', updates)}
              onIconsChange={(updates) => updateCategory('icons', updates)}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
