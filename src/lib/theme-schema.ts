import { z } from "zod";

// ============= THEME ENGINE V3 SCHEMA =============

export const BackgroundSchema = z.object({
  type: z.enum(['solid', 'gradient', 'image', 'video']),
  color: z.string().optional(),
  gradientFrom: z.string().optional(),
  gradientTo: z.string().optional(),
  gradientAngle: z.number().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  overlay: z.string().optional(),
  blur: z.number().optional(),
  noise: z.boolean().optional(),
  noiseOpacity: z.number().optional(),
});

export const ColorsSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  text: z.string(),
  textMuted: z.string(),
  cardBackground: z.string(),
  cardBorder: z.string(),
});

export const TypographySchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  headingWeight: z.number(),
  bodyWeight: z.number(),
});

export const CardsSchema = z.object({
  style: z.enum(['elevated', 'outlined', 'flat', 'glass', 'neon', 'gradient', 'hologram', 'liquid', 'minimal', 'bold']),
  borderRadius: z.number(),
  borderWidth: z.number(),
  shadow: z.enum(['none', 'sm', 'md', 'lg', 'glow']),
  glowColor: z.string().optional(),
  glowIntensity: z.number().optional(),
});

export const ButtonsSchema = z.object({
  shape: z.enum(['rounded', 'pill', 'sharp']),
  style: z.enum(['solid', 'outline', 'ghost', 'gradient']),
  hoverEffect: z.enum(['none', 'scale', 'glow', 'tilt', 'slide']),
});

export const LayoutSchema = z.object({
  style: z.enum(['centered', 'left', 'asymmetric']),
  maxWidth: z.enum(['sm', 'md', 'lg']),
  spacing: z.enum(['compact', 'normal', 'relaxed']),
  avatarSize: z.enum(['sm', 'md', 'lg', 'xl']),
  avatarStyle: z.enum(['circle', 'rounded', 'square']),
});

export const EffectsSchema = z.object({
  particles: z.enum(['none', 'snow', 'stars', 'fireflies', 'bubbles', 'confetti', 'matrix']),
  textAnimation: z.enum(['none', 'gradient', 'glow', 'wave', 'glitch', 'typewriter']),
  linkAnimation: z.enum(['none', 'fade', 'slide', 'scale', 'bounce', 'flip', 'glow']),
  parallax: z.boolean(),
  glassmorphism: z.boolean(),
  aurora: z.boolean(),
  tilt3D: z.boolean().optional(),
  glowPulse: z.boolean().optional(),
});

export const IconsSchema = z.object({
  style: z.enum(['outlined', 'filled', 'minimal', 'none']),
  position: z.enum(['left', 'right', 'none']),
});

export const SectionSchema = z.object({
  type: z.enum(['hero', 'links', 'socials', 'featured', 'note', 'divider']),
  config: z.record(z.unknown()).optional(),
  visible: z.boolean().optional(),
});

export const ThemePresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  preview: z.string(),
  background: BackgroundSchema,
  colors: ColorsSchema,
  typography: TypographySchema,
  cards: CardsSchema,
  buttons: ButtonsSchema,
  layout: LayoutSchema,
  effects: EffectsSchema,
  icons: IconsSchema,
  sections: z.array(SectionSchema).optional(),
});

// Export types
export type Background = z.infer<typeof BackgroundSchema>;
export type Colors = z.infer<typeof ColorsSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type Cards = z.infer<typeof CardsSchema>;
export type Buttons = z.infer<typeof ButtonsSchema>;
export type Layout = z.infer<typeof LayoutSchema>;
export type Effects = z.infer<typeof EffectsSchema>;
export type Icons = z.infer<typeof IconsSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type ThemePresetV3 = z.infer<typeof ThemePresetSchema>;

// Validation helper
export function validateThemePreset(data: unknown): ThemePresetV3 | null {
  const result = ThemePresetSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error("Theme validation errors:", result.error.errors);
  return null;
}

// Default sections order
export const DEFAULT_SECTIONS: Section[] = [
  { type: 'hero', visible: true },
  { type: 'socials', visible: true },
  { type: 'divider', visible: true },
  { type: 'links', visible: true },
  { type: 'note', visible: false },
];
