// LinkPeek Theme Engine V2 - Premium Theme Presets

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string; // CSS gradient for preview thumbnail
  
  // Background
  background: {
    type: 'solid' | 'gradient' | 'image' | 'video';
    color?: string;
    gradientFrom?: string;
    gradientTo?: string;
    gradientAngle?: number;
    imageUrl?: string;
    videoUrl?: string;
    overlay?: string;
    blur?: number;
    noise?: boolean;
    noiseOpacity?: number;
  };
  
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    cardBackground: string;
    cardBorder: string;
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    bodyWeight: number;
  };
  
  // Cards/Buttons
  cards: {
    style: 'elevated' | 'outlined' | 'flat' | 'glass' | 'neon' | 'gradient';
    borderRadius: number;
    borderWidth: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'glow';
    glowColor?: string;
    glowIntensity?: number;
  };
  
  buttons: {
    shape: 'rounded' | 'pill' | 'sharp';
    style: 'solid' | 'outline' | 'ghost' | 'gradient';
    hoverEffect: 'none' | 'scale' | 'glow' | 'tilt' | 'slide';
  };
  
  // Layout
  layout: {
    style: 'centered' | 'left' | 'asymmetric';
    maxWidth: 'sm' | 'md' | 'lg';
    spacing: 'compact' | 'normal' | 'relaxed';
    avatarSize: 'sm' | 'md' | 'lg' | 'xl';
    avatarStyle: 'circle' | 'rounded' | 'square';
  };
  
  // Effects
  effects: {
    particles: 'none' | 'snow' | 'stars' | 'fireflies' | 'bubbles' | 'confetti' | 'matrix';
    textAnimation: 'none' | 'gradient' | 'glow' | 'wave' | 'glitch' | 'typewriter';
    linkAnimation: 'none' | 'fade' | 'slide' | 'scale' | 'bounce' | 'flip' | 'glow';
    parallax: boolean;
    glassmorphism: boolean;
    aurora: boolean;
  };
  
  // Icon style for links
  icons: {
    style: 'outlined' | 'filled' | 'minimal' | 'none';
    position: 'left' | 'right' | 'none';
  };
}

export const CURATED_FONTS = [
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Sora', value: 'Sora' },
  { name: 'Outfit', value: 'Outfit' },
  { name: 'Clash Display', value: 'Clash Display' },
  { name: 'Cabinet Grotesk', value: 'Cabinet Grotesk' },
];

// ============= 6 PREMIUM THEME PRESETS =============

export const THEME_PRESETS: ThemePreset[] = [
  // 1. CYBER NEON
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: 'Dark gradient with neon glow and glass cards',
    preview: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1a 100%)',
    background: {
      type: 'gradient',
      gradientFrom: '#0f0f23',
      gradientTo: '#1a1a3e',
      gradientAngle: 135,
      noise: true,
      noiseOpacity: 0.03,
    },
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#39ff14',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.7)',
      cardBackground: 'rgba(255,255,255,0.05)',
      cardBorder: 'rgba(0,255,255,0.3)',
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    cards: {
      style: 'neon',
      borderRadius: 16,
      borderWidth: 1,
      shadow: 'glow',
      glowColor: '#00ffff',
      glowIntensity: 0.4,
    },
    buttons: {
      shape: 'rounded',
      style: 'outline',
      hoverEffect: 'glow',
    },
    layout: {
      style: 'centered',
      maxWidth: 'md',
      spacing: 'normal',
      avatarSize: 'lg',
      avatarStyle: 'circle',
    },
    effects: {
      particles: 'matrix',
      textAnimation: 'glow',
      linkAnimation: 'glow',
      parallax: false,
      glassmorphism: true,
      aurora: false,
    },
    icons: {
      style: 'outlined',
      position: 'right',
    },
  },

  // 2. LIQUID GRADIENT
  {
    id: 'liquid-gradient',
    name: 'Liquid Gradient',
    description: 'Soft flowing gradients with round cards',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    background: {
      type: 'gradient',
      gradientFrom: '#667eea',
      gradientTo: '#764ba2',
      gradientAngle: 135,
      noise: false,
    },
    colors: {
      primary: '#ffffff',
      secondary: '#f8f0fc',
      accent: '#ffd43b',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.85)',
      cardBackground: 'rgba(255,255,255,0.15)',
      cardBorder: 'rgba(255,255,255,0.25)',
    },
    typography: {
      headingFont: 'Sora',
      bodyFont: 'Inter',
      headingWeight: 600,
      bodyWeight: 400,
    },
    cards: {
      style: 'glass',
      borderRadius: 24,
      borderWidth: 1,
      shadow: 'lg',
    },
    buttons: {
      shape: 'pill',
      style: 'solid',
      hoverEffect: 'scale',
    },
    layout: {
      style: 'centered',
      maxWidth: 'sm',
      spacing: 'relaxed',
      avatarSize: 'xl',
      avatarStyle: 'circle',
    },
    effects: {
      particles: 'bubbles',
      textAnimation: 'gradient',
      linkAnimation: 'scale',
      parallax: true,
      glassmorphism: true,
      aurora: false,
    },
    icons: {
      style: 'minimal',
      position: 'left',
    },
  },

  // 3. GLASS AURORA
  {
    id: 'glass-aurora',
    name: 'Glass Aurora',
    description: 'Blur panels with aurora animation',
    preview: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    background: {
      type: 'gradient',
      gradientFrom: '#1a1a2e',
      gradientTo: '#0f3460',
      gradientAngle: 135,
      noise: true,
      noiseOpacity: 0.02,
    },
    colors: {
      primary: '#4ecca3',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.75)',
      cardBackground: 'rgba(255,255,255,0.08)',
      cardBorder: 'rgba(78,204,163,0.3)',
    },
    typography: {
      headingFont: 'Outfit',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    cards: {
      style: 'glass',
      borderRadius: 20,
      borderWidth: 1,
      shadow: 'md',
    },
    buttons: {
      shape: 'rounded',
      style: 'ghost',
      hoverEffect: 'tilt',
    },
    layout: {
      style: 'centered',
      maxWidth: 'md',
      spacing: 'normal',
      avatarSize: 'lg',
      avatarStyle: 'rounded',
    },
    effects: {
      particles: 'stars',
      textAnimation: 'wave',
      linkAnimation: 'slide',
      parallax: true,
      glassmorphism: true,
      aurora: true,
    },
    icons: {
      style: 'filled',
      position: 'left',
    },
  },

  // 4. MINIMAL PRO
  {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    description: 'Clean white/black with sharp edges',
    preview: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
    background: {
      type: 'solid',
      color: '#ffffff',
      noise: false,
    },
    colors: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#3b82f6',
      text: '#111827',
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
      style: 'outlined',
      borderRadius: 8,
      borderWidth: 1,
      shadow: 'none',
    },
    buttons: {
      shape: 'sharp',
      style: 'outline',
      hoverEffect: 'none',
    },
    layout: {
      style: 'left',
      maxWidth: 'sm',
      spacing: 'compact',
      avatarSize: 'md',
      avatarStyle: 'square',
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
  },

  // 5. CREATOR POP
  {
    id: 'creator-pop',
    name: 'Creator Pop',
    description: 'Colorful and playful design',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
    background: {
      type: 'gradient',
      gradientFrom: '#fff5f5',
      gradientTo: '#fef3c7',
      gradientAngle: 180,
      noise: false,
    },
    colors: {
      primary: '#ff6b6b',
      secondary: '#feca57',
      accent: '#48dbfb',
      text: '#2d3436',
      textMuted: '#636e72',
      cardBackground: '#ffffff',
      cardBorder: '#ff6b6b',
    },
    typography: {
      headingFont: 'Space Grotesk',
      bodyFont: 'Inter',
      headingWeight: 800,
      bodyWeight: 500,
    },
    cards: {
      style: 'elevated',
      borderRadius: 20,
      borderWidth: 3,
      shadow: 'lg',
    },
    buttons: {
      shape: 'pill',
      style: 'solid',
      hoverEffect: 'scale',
    },
    layout: {
      style: 'centered',
      maxWidth: 'md',
      spacing: 'relaxed',
      avatarSize: 'xl',
      avatarStyle: 'circle',
    },
    effects: {
      particles: 'confetti',
      textAnimation: 'wave',
      linkAnimation: 'bounce',
      parallax: false,
      glassmorphism: false,
      aurora: false,
    },
    icons: {
      style: 'filled',
      position: 'left',
    },
  },

  // 6. EDITORIAL
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Big typography with pastel backgrounds',
    preview: 'linear-gradient(180deg, #fef9ef 0%, #fdf6e9 100%)',
    background: {
      type: 'solid',
      color: '#fef9ef',
      noise: true,
      noiseOpacity: 0.015,
    },
    colors: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      accent: '#e07a5f',
      text: '#1a1a1a',
      textMuted: '#666666',
      cardBackground: '#ffffff',
      cardBorder: '#1a1a1a',
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Inter',
      headingWeight: 700,
      bodyWeight: 400,
    },
    cards: {
      style: 'outlined',
      borderRadius: 0,
      borderWidth: 2,
      shadow: 'none',
    },
    buttons: {
      shape: 'sharp',
      style: 'outline',
      hoverEffect: 'slide',
    },
    layout: {
      style: 'asymmetric',
      maxWidth: 'lg',
      spacing: 'relaxed',
      avatarSize: 'lg',
      avatarStyle: 'square',
    },
    effects: {
      particles: 'none',
      textAnimation: 'none',
      linkAnimation: 'slide',
      parallax: false,
      glassmorphism: false,
      aurora: false,
    },
    icons: {
      style: 'none',
      position: 'none',
    },
  },
];

export const getPresetById = (id: string): ThemePreset | undefined => {
  return THEME_PRESETS.find(preset => preset.id === id);
};

export const getDefaultPreset = (): ThemePreset => {
  return THEME_PRESETS[0];
};

// Export presets as object for easy lookup by id
export const themePresets: Record<string, ThemePreset> = THEME_PRESETS.reduce((acc, preset) => {
  acc[preset.id] = preset;
  return acc;
}, {} as Record<string, ThemePreset>);
