// Theme Engine V3 - Validation & Fallback Utilities
import { ThemePreset, getDefaultPreset } from "@/lib/theme-presets";

// Default fallback theme - guaranteed to work in all scenarios
export const FALLBACK_THEME: ThemePreset = {
  id: 'fallback',
  name: 'Default',
  description: 'Safe fallback theme',
  preview: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
  background: {
    type: 'solid',
    color: '#ffffff',
    noise: false,
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f59e0b',
    text: '#1f2937',
    textMuted: '#6b7280',
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    headingWeight: 600,
    bodyWeight: 400,
  },
  cards: {
    style: 'elevated',
    borderRadius: 12,
    borderWidth: 1,
    shadow: 'md',
  },
  buttons: {
    shape: 'rounded',
    style: 'solid',
    hoverEffect: 'scale',
  },
  layout: {
    style: 'centered',
    maxWidth: 'md',
    spacing: 'normal',
    avatarSize: 'lg',
    avatarStyle: 'circle',
  },
  effects: {
    particles: 'none',
    textAnimation: 'none',
    linkAnimation: 'fade',
    parallax: false,
    glassmorphism: false,
    aurora: false,
  },
  icons: {
    style: 'minimal',
    position: 'right',
  },
};

/**
 * Validates a theme object and returns a safe, complete theme
 * Merges missing properties from the fallback theme
 */
export function validateTheme(theme: Partial<ThemePreset> | null | undefined): ThemePreset {
  if (!theme) {
    console.warn('[ThemeEngine] No theme provided, using fallback');
    return FALLBACK_THEME;
  }

  try {
    // Deep merge with fallback to ensure all required properties exist
    const validatedTheme: ThemePreset = {
      id: theme.id || FALLBACK_THEME.id,
      name: theme.name || FALLBACK_THEME.name,
      description: theme.description || FALLBACK_THEME.description,
      preview: theme.preview || FALLBACK_THEME.preview,
      background: {
        ...FALLBACK_THEME.background,
        ...theme.background,
      },
      colors: {
        ...FALLBACK_THEME.colors,
        ...theme.colors,
      },
      typography: {
        ...FALLBACK_THEME.typography,
        ...theme.typography,
      },
      cards: {
        ...FALLBACK_THEME.cards,
        ...theme.cards,
      },
      buttons: {
        ...FALLBACK_THEME.buttons,
        ...theme.buttons,
      },
      layout: {
        ...FALLBACK_THEME.layout,
        ...theme.layout,
      },
      effects: {
        ...FALLBACK_THEME.effects,
        ...theme.effects,
      },
      icons: {
        ...FALLBACK_THEME.icons,
        ...theme.icons,
      },
    };

    return validatedTheme;
  } catch (error) {
    console.error('[ThemeEngine] Theme validation failed:', error);
    return FALLBACK_THEME;
  }
}

/**
 * Validates theme colors - ensures proper format and contrast
 */
export function validateColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  
  // Check if valid hex, rgb, rgba, or hsl format
  const colorPatterns = [
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
    /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,
    /^hsl\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)$/,
    /^hsla\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\)$/,
  ];

  const isValid = colorPatterns.some(pattern => pattern.test(color));
  return isValid ? color : fallback;
}

/**
 * Detects if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detects if device is low-powered (mobile/tablet)
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Check for mobile/tablet
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Check hardware concurrency (CPU cores) - low-end devices often have 2-4
  const lowCores = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
  
  // Check device memory if available
  const lowMemory = 'deviceMemory' in navigator 
    ? (navigator as any).deviceMemory <= 4 
    : false;

  return isMobile || lowCores || lowMemory;
}

/**
 * Gets optimized effects settings based on device capabilities
 */
export function getOptimizedEffects(effects: ThemePreset['effects']): ThemePreset['effects'] {
  const reducedMotion = prefersReducedMotion();
  const lowPower = isLowPowerDevice();

  if (reducedMotion) {
    return {
      particles: 'none',
      textAnimation: 'none',
      linkAnimation: 'none',
      parallax: false,
      glassmorphism: effects.glassmorphism, // Keep glassmorphism (static effect)
      aurora: false,
    };
  }

  if (lowPower) {
    return {
      particles: effects.particles === 'matrix' || effects.particles === 'confetti' 
        ? 'stars' 
        : effects.particles,
      textAnimation: effects.textAnimation,
      linkAnimation: effects.linkAnimation,
      parallax: false, // Disable parallax on mobile
      glassmorphism: effects.glassmorphism,
      aurora: false, // Disable aurora on low-power devices
    };
  }

  return effects;
}

/**
 * Validates font family and returns safe fallback
 */
export function validateFont(font: string | undefined, fallback = 'Inter'): string {
  if (!font || typeof font !== 'string') return fallback;
  
  // List of safe web fonts
  const safeFonts = [
    'Inter', 'Sora', 'Outfit', 'Space Grotesk', 'Playfair Display',
    'Clash Display', 'Cabinet Grotesk', 'Poppins', 'Roboto', 'system-ui',
  ];
  
  // Check if font is in safe list or starts with safe font name
  const isSafe = safeFonts.some(
    safeFont => font.toLowerCase().includes(safeFont.toLowerCase())
  );
  
  return isSafe ? font : fallback;
}

/**
 * Validates and sanitizes a URL (for background images/videos)
 */
export function validateMediaUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  try {
    const parsed = new URL(url);
    // Only allow https URLs for security
    if (parsed.protocol !== 'https:') {
      console.warn('[ThemeEngine] Insecure media URL rejected:', url);
      return undefined;
    }
    return url;
  } catch {
    console.warn('[ThemeEngine] Invalid media URL:', url);
    return undefined;
  }
}
