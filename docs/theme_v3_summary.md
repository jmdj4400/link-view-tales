# LinkPeek Theme Engine V3 Summary

## Overview
Theme Engine V3 is the most advanced customizable theme system for link-in-bio pages, featuring modular sections, 3D effects, AI-generated backgrounds, and premium visual effects.

## Features Implemented

### 1. Enhanced Particle Effects (`ParticleEffectV3`)
- **Snow** - Gentle falling snowflakes
- **Stars** - Twinkling star field
- **Fireflies** - Glowing floating orbs
- **Bubbles** - Rising transparent bubbles
- **Confetti** - Colorful falling shapes with physics
- **Matrix** - Digital rain effect with Japanese characters

### 2. 3D Tilt Effect (`Tilt3DWrapper`)
- Mouse-following 3D perspective rotation
- Optional glare effect overlay
- Configurable intensity
- Smooth transitions

### 3. Parallax Background (`ParallaxBackground`)
- Mouse-following parallax movement
- Scroll-based parallax option
- Configurable intensity

### 4. Advanced Link Card Styles (`LinkCardV3`)
- **Hologram** - Animated gradient with scanline effect
- **Liquid** - Mouse-following gradient shine
- **Glass** - Glassmorphism with blur
- **Neon** - Glowing borders and shadows
- **Minimal** - Clean underline style
- **Bold** - Solid color with shadow

### 5. AI Background Generator
- Prompt-based gradient generation
- 12 preset gradient options
- Keyword-to-color mapping
- One-click application

### 6. Modular Section Architecture
Sections can be reordered via config:
```json
[
  { "type": "hero", "visible": true },
  { "type": "socials", "visible": true },
  { "type": "divider", "visible": true },
  { "type": "links", "visible": true },
  { "type": "note", "visible": false }
]
```

## Theme Presets (6 Premium Themes)

| Preset | Style | Card Type | Particles | Effects |
|--------|-------|-----------|-----------|---------|
| **Cyber Neon** | Dark gradient, neon glow | Hologram | Matrix | 3D Tilt, Glow Pulse |
| **Liquid Gradient** | Soft flowing gradients | Liquid | Bubbles | Parallax |
| **Glass Aurora** | Glassmorphism panels | Glass | Stars | Aurora, 3D Tilt |
| **Minimal Pro** | Clean white/black | Minimal | None | None |
| **Creator Pop** | Colorful, playful | Bold | Confetti | None |
| **Editorial** | Magazine layout | Outlined | None | None |

## JSON Theme Files
Presets are stored in `/public/themes/*.json`:
- `cyber-neon.json`
- `liquid-gradient.json`
- `glass-aurora.json`
- `minimal-pro.json`
- `creator-pop.json`
- `editorial.json`

## Theme Schema (Zod Validation)
Located in `src/lib/theme-schema.ts`:
```typescript
import { ThemePresetSchema, validateThemePreset } from "@/lib/theme-schema";

// Validate a theme preset
const validatedTheme = validateThemePreset(themeData);
```

## File Structure
```
src/components/profile/theme-engine/
├── ThemeRendererV3.tsx        # Main V3 renderer
├── ThemeEngineEditor.tsx      # Editor with live preview
├── ThemeCustomizationPanel.tsx
├── controls/
│   ├── AIBackgroundGenerator.tsx  # AI background tool
│   ├── BackgroundControls.tsx
│   ├── ButtonCardControls.tsx     # V3 card styles
│   ├── ColorControls.tsx
│   ├── EffectsControls.tsx
│   ├── PresetSelector.tsx
│   └── ...
├── effects/
│   ├── ParticleEffectV3.tsx   # Enhanced particles
│   ├── Tilt3DWrapper.tsx      # 3D tilt effect
│   ├── ParallaxBackground.tsx # Parallax effect
│   ├── GlowPulse.tsx          # Glow animation
│   ├── AuroraBackground.tsx   # Aurora effect
│   └── NoiseOverlay.tsx       # Noise texture
└── sections/
    ├── LinkCardV3.tsx         # Advanced card styles
    ├── HeroSection.tsx
    ├── LinkListSection.tsx
    ├── SocialIconsSection.tsx
    ├── DividerSection.tsx
    └── NoteBlockSection.tsx

public/themes/
├── cyber-neon.json
├── liquid-gradient.json
├── glass-aurora.json
├── minimal-pro.json
├── creator-pop.json
└── editorial.json

src/lib/
├── theme-presets.ts           # Preset definitions
└── theme-schema.ts            # Zod validation schema
```

## Adding New Themes
1. Create a new JSON file in `/public/themes/`
2. Follow the `ThemePresetSchema` structure
3. Add the preset to `THEME_PRESETS` array in `src/lib/theme-presets.ts`
4. Theme will automatically appear in preset selector

## Adding New Effects
1. Create effect component in `effects/` folder
2. Add toggle in `EffectsControls.tsx`
3. Render conditionally in `ThemeRendererV3.tsx`
4. Update `EffectsSchema` in `theme-schema.ts`

## Adding New Section Types
1. Create section component in `sections/` folder
2. Add case in `renderSection()` switch in `ThemeRendererV3.tsx`
3. Update `SectionSchema` enum in `theme-schema.ts`

## Usage Example
```tsx
import { ThemeRendererV3 } from "@/components/profile/theme-engine/ThemeRendererV3";
import { getPresetById } from "@/lib/theme-presets";

const theme = getPresetById("cyber-neon");

<ThemeRendererV3
  profile={{ name: "Creator", handle: "creator", bio: "Hello!" }}
  links={userLinks}
  socials={userSocials}
  theme={theme}
/>
```
