# UX design tokens — Editor vs Studio

Use with shadcn + Tailwind v4 ([`src/app/globals.css`](../src/app/globals.css)). Import this page into Figma **01_Tokens** as style definitions.

**v1 unified canvas:** The main app column uses `.app-canvas` (soft violet mesh + `--app-canvas-base`) on all routes. Content blocks use `.surface-panel`. Editor vs studio zones are **accent semantics** (CTAs, pipeline, focus)—not separate page backgrounds.

## Grid and spacing

| Token | Value | Use |
|-------|-------|-----|
| `grid-base` | 8px | All padding/margins are multiples of 8 |
| `page-padding-desktop` | 24px (`p-6`) | App shell content |
| `page-padding-mobile` | 16px (`p-4`) | Mobile |
| `card-padding` | 24px | Editor cards |
| `studio-card-padding` | 20px | Glass cards |
| `field-gap` | 16px | Between form fields |
| `section-gap` | 32px | Between major sections |
| `max-width-editor` | 672px (`max-w-2xl`) | Promise, Words |
| `max-width-studio` | 1152px (`max-w-6xl`) | Draft studio |

## Typography (Figma text styles)

| Style | Font | Size / line | Weight | Zone |
|-------|------|-------------|--------|------|
| `Display/Studio` | Inter Display or Geist | 28 / 34 | 600 | Studio headings only |
| `Heading/Page` | Inter | 24 / 32 | 600 | Page titles |
| `Heading/Section` | Inter | 18 / 28 | 600 | Section |
| `Body/Default` | Inter | 14 / 22 | 400 | Body |
| `Body/Helper` | Inter | 13 / 20 | 400 | Helper under labels |
| `Label/Field` | Inter | 14 / 20 | 500 | Field labels |
| `Caption` | Inter | 12 / 18 | 400 | Meta, timestamps |

**App chrome (implemented):** `--font-display` = Instrument Serif (page titles via `PageHeader`). `--font-sans` = Geist (UI). Brand routes additionally set `--brand-font-heading` / `--brand-font-body` from DNA (see `derive-brand-typography.ts`).

## Elevation (shadows)

| Token | Use |
|-------|-----|
| `--shadow-panel` | Default `.surface-panel` (two-layer, violet-tinted oklch) |
| `--shadow-panel-hover` | Interactive cards and list rows |
| `--shadow-panel-lg` | Device preview frame |
| `--shadow-studio-glow` | Studio CTA hover/focus |
| `--shadow-sidebar` | Sidebar edge on main canvas |

Figma: simulate with two drops — tight 1–2px + soft 24px blur at ~280 hue, 8–18% opacity.

## Editor zone (`data-zone="editor"`)

Calm, paper-like. No glow.

| CSS variable | Light (oklch) | Figma paint |
|--------------|---------------|-------------|
| `--zone-editor-bg` | `0.985 0.004 85` | Warm off-white |
| `--zone-editor-card` | `1 0 0` | White |
| `--zone-editor-border` | `0.922 0 0` | 1px border |
| `--zone-editor-muted` | `0.556 0 0` | Helper text |

**Figma effects:** None on cards. Shadow: none.

**Motion:** 150ms ease opacity on save toast only.

## Studio zone (`data-zone="studio"`)

Generative accent used sparingly (CTA, active pipeline step, focus ring).

| CSS variable | Light (oklch) | Figma paint |
|--------------|---------------|-------------|
| `--zone-studio-bg` | `0.97 0.02 280` | Soft violet tint base |
| `--zone-studio-mesh-1` | `0.92 0.06 300` | Mesh corner A |
| `--zone-studio-mesh-2` | `0.94 0.05 200` | Mesh corner B |
| `--zone-studio-surface` | `1 0 0 / 72%` | Glass fill |
| `--zone-studio-border` | `0.85 0.08 280 / 35%` | Luminous border |
| `--studio-accent-start` | `0.55 0.22 300` | Gradient start |
| `--studio-accent-end` | `0.65 0.15 220` | Gradient end |
| `--studio-accent-foreground` | `0.985 0 0` | Text on gradient button |

**Figma effects:** Background linear mesh (2 stops, 15% opacity). Card: background blur 12px simulation + 1px stroke.

**Motion:** Pipeline shimmer 2s linear infinite; step complete 200ms scale; `prefers-reduced-motion`: static.

## Shared semantic (unchanged)

Use existing `--success`, `--warning`, `--danger`, `--primary` for non-studio actions in editor zone.

## Dark mode (token page only for v1)

Mirror editor/studio with `--background` dark base; studio mesh at 8% opacity; glass `--card` at 80% opacity.

## shadcn mapping

| Figma component | shadcn / custom |
|-----------------|-----------------|
| Primary button (editor) | `Button` default |
| Primary button (studio) | `Button` + `variant="studio"` (custom) |
| Input | `Input` |
| Card editor | `Card` flat |
| Card studio | `Card` + `className="studio-glass"` |

Implementation lives in [`globals.css`](../src/app/globals.css) under `[data-zone="editor"]` and `[data-zone="studio"]`.

## Screen patterns (implemented)

All routes share `.app-canvas` in the shell. Page bodies compose these building blocks so list, studio, and brand flows feel the same.

| Pattern | Component | When to use |
|---------|-----------|-------------|
| Page shell | `PageLayout` (`full` = dashboard/content/calendar; `studio` = brands, create, accounts, content detail; `narrow` = settings) | Every `(app)` page |
| Title row | `PageHeader` | Page title, optional description/actions (not duplicated inside tabs) |
| In-page section lead | `StudioSectionIntro` | Brand tabs, new brand form, long forms — display heading + one paragraph |
| Brand context | `BrandSelectorBar` | Dashboard, content, calendar, create (via `CreatePageShell`) |
| Filters | `FilterPillBar` | Content library status tabs |
| Empty / blocked | `EmptyState` | No brands, no posts, draft locked — `surface-panel`, display title, primary `variant="studio"` |
| Cards | `SURFACE_PANEL_CARD` + `.surface-panel` | Forms and settings cards on the unified canvas |
| Primary journey CTA | `Button variant="studio"` | Next step: talk, create, open brand |

Brand journey: `/brands/[id]?tab=promise|words|draft`; auto-open talk with `&talk=1`. Tab subtitle copy comes from `brandTabStatusDescription`.
