import { createContext, useContext, useState, ReactNode } from "react";
import { ThemePreset, THEME_PRESETS, getPresetById, getDefaultPreset } from "@/lib/theme-presets";

interface ThemeEngineContextType {
  currentTheme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
  applyPreset: (presetId: string) => void;
  updateThemeProperty: <K extends keyof ThemePreset>(
    category: K,
    updates: Partial<ThemePreset[K]>
  ) => void;
  presets: ThemePreset[];
}

const ThemeEngineContext = createContext<ThemeEngineContextType | undefined>(undefined);

export function ThemeEngineProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: ThemePreset }) {
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>(initialTheme || getDefaultPreset());

  const setTheme = (theme: ThemePreset) => {
    setCurrentTheme(theme);
  };

  const applyPreset = (presetId: string) => {
    const preset = getPresetById(presetId);
    if (preset) {
      setCurrentTheme(preset);
    }
  };

  const updateThemeProperty = <K extends keyof ThemePreset>(
    category: K,
    updates: Partial<ThemePreset[K]>
  ) => {
    setCurrentTheme(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        ...updates,
      },
    }));
  };

  return (
    <ThemeEngineContext.Provider
      value={{
        currentTheme,
        setTheme,
        applyPreset,
        updateThemeProperty,
        presets: THEME_PRESETS,
      }}
    >
      {children}
    </ThemeEngineContext.Provider>
  );
}

export function useThemeEngine() {
  const context = useContext(ThemeEngineContext);
  if (!context) {
    throw new Error("useThemeEngine must be used within ThemeEngineProvider");
  }
  return context;
}
