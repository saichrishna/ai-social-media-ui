# UX Design System Review — AI Social Media SaaS

**Audience:** Implementation agents (frontend).  
**Source of truth:** `ai-social-media-ui` as of inspection (Next.js 16, React 19, Tailwind v4, shadcn/Radix, TanStack Query).  
**Companion docs:** [UX_DESIGN_TOKENS.md](./UX_DESIGN_TOKENS.md), [UX_PRODUCTION_FIGMA_SPEC.md](./UX_PRODUCTION_FIGMA_SPEC.md), [BRAND_DNA_PRODUCT_SPEC.md](./BRAND_DNA_PRODUCT_SPEC.md).

---

## 1. Executive UX assessment

### What this product is today

A **single-workspace SaaS** for **Brand DNA capture** (promise + “your words”) and **AI-assisted social post creation**, with a **content library**, **per-post studio** (edit / approve / schedule), and a **month calendar**. Auth is **bootstrap user ID only** (no login UI). **Social OAuth/publishing is feature-flagged off** (`NEXT_PUBLIC_SOCIAL_PUBLISHING` defaults false).

### Honest quality snapshot

| Area | Assessment |
|------|------------|
| **Visual foundation** | **Good and recent:** unified soft-violet canvas (`.app-canvas`), glass panels (`.surface-panel`), Instrument Serif page titles, studio gradient CTAs (`variant="studio"`). |
| **Layout system** | **Partially mature:** `PageLayout`, `PageHeader`, `SectionHeader`, `StudioSectionIntro`, `BrandSelectorBar`, `FilterPillBar`, shared `EmptyState` / `ErrorState` / `LoadingState`. Not every screen uses them equally. |
| **Brand journey** | **Strongest UX:** Promise / Your words / Draft tabs, talk session (WebRTC), readiness gating, dashboard command center. |
| **Content studio (detail)** | **Functional but basic:** 3-column layout, inline edit mode, dialogs for approve/regenerate/schedule. No unsaved-changes guard, no image actions, limited status-driven actions. |
| **Lists & data UI** | **Basic:** card grids and simple link rows—no table component, no bulk actions, no search/sort. |
| **Accounts / publish** | **Placeholder:** connect button disabled; scheduling stores datetime but publishing path not exposed in UI. |
| **Component library** | **Small shadcn subset:** Button, Input, Textarea, Card, Badge, Tabs, Dialog, Sheet, Dropdown, Select, Skeleton, Avatar, Sonner toast. **Missing:** Tooltip, Popover (standalone), Checkbox/Switch/Radio (except PlatformRoom custom radios), Combobox, Drawer (Sheet used instead), DatePicker (native `input type="date/time"`), dedicated Table. |
| **Accessibility** | **Baseline:** focus rings on buttons/links, some `aria-*` on nav/calendar/generation. **Gaps:** filter tabs vs tablist semantics, `window.confirm` for delete, inconsistent live regions on save success, PageHeader wrapping complex `description` in `<p>`. |
| **Motion** | **Minimal and appropriate:** button `transition-all`, card hover shadow/translate, dialog fade (tw-animate), pipeline shimmer (reduced-motion respected), voice bar animation. No route transitions. |

### Strategic direction (preserve)

- **Do not** expose model names, tokens, or internal pipeline jargon in primary UI (pipeline step labels are user-facing metaphors only—keep them non-technical).
- **Do** keep Brand DNA → Create → Content Studio as the core loop.
- **Do not** rebuild stack (Next/Tailwind/shadcn/React Query remain).

---

## 2. Current-state assessment

### Routes (verified)

| Route | Page file | Shell |
|-------|-----------|--------|
| `/` | `src/app/(app)/page.tsx` | AppShell |
| `/create` | `src/app/(app)/create/page.tsx` | CreatePageShell |
| `/content` | `src/app/(app)/content/page.tsx` | AppShell |
| `/content/[id]` | `src/app/(app)/content/[id]/page.tsx` | AppShell |
| `/calendar` | `src/app/(app)/calendar/page.tsx` | AppShell |
| `/brands` | `src/app/(app)/brands/page.tsx` | AppShell |
| `/brands/new` | `src/app/(app)/brands/new/page.tsx` | AppShell |
| `/brands/[profileId]` | `src/app/(app)/brands/[profileId]/page.tsx` | AppShell + BrandTypographyProvider |
| `/accounts` | `src/app/(app)/accounts/page.tsx` | AppShell |
| `/settings` | `src/app/(app)/settings/page.tsx` | AppShell |
| (no route) | `SetupError` when no bootstrap user | No shell |

### Dead / unused UI (exists in repo, not mounted on routes)

- `BrandForm`, `brand-interview-panel.tsx`, `brand-voice-study-panel.tsx` — **not referenced** by current brand pages (superseded by Promise / Your words / talk flow). **Do not document as active flows** unless re-wired.

### API integration pattern (frontend)

- **TanStack Query** for reads; **useMutation** for writes.
- Errors: `USER_SAFE_ERROR_MESSAGE` from `src/lib/api/client.ts` (generic copy).
- Success: mix of **toast (Sonner)** on brand saves, **inline ErrorState** on content actions, **dialog success state** on schedule.
- **No optimistic updates** on posts/brands except query invalidation after mutations.

### Global providers

`AppProviders`: Theme (next-themes), User, QueryClient, BrandSelection (localStorage selected brand), Toaster.

---

## 3. Design system (as implemented)

### 3.1 Typography

| Role | Implementation | Notes |
|------|----------------|-------|
| **App display / page title** | `--font-display` → Instrument Serif; `PageHeader` `h1`, `EmptyState` `h2`, global `h1` in `@layer base` | ~`text-3xl` / `2rem` on md+ |
| **Section (in-tab)** | `.type-section`, `.type-studio-title` | `text-lg font-semibold tracking-tight` |
| **Studio intro heading** | `StudioSectionIntro` | `font-display text-2xl md:text-3xl` |
| **UI / body** | `--font-sans` → Geist (`html { font-sans }`) | Default 14px via shadcn text-sm on controls |
| **Brand-derived** | `--brand-font-heading`, `--brand-font-body` on `[data-brand-typography]` | Only on brand detail route |
| **Mono** | Geist Mono variable loaded | Used in SetupError code snippet |
| **Labels** | `<label className="flex flex-col gap-1 text-sm">` pattern | Field name as first line of label |
| **Helper** | `text-muted-foreground`, often `text-xs` under labels | Inconsistent: sometimes `CardDescription`, sometimes inline span |
| **Captions / meta** | `text-xs text-muted-foreground` | Calendar cells, account hints |

**Gap vs Figma doc:** Figma still references “Inter Display” for studio headings; **code uses Instrument Serif + Geist**, not Inter for UI (Inter variable loaded as `--font-brand-inter` for DNA typography mapping only).

### 3.2 Color (CSS variables in `globals.css`)

| Token | Purpose | Light (summary) |
|-------|---------|-----------------|
| `--app-canvas-base` | Page background base | Violet-tinted oklch |
| `--background` / `--foreground` | shadcn semantic | Tied to canvas |
| `--card`, `--popover` | Elevated surfaces | Semi-opaque white |
| `--surface-panel` | Glass panels | White ~78% + blur |
| `--primary` | Default buttons | Near-black |
| `--secondary`, `--muted`, `--accent` | Neutral fills | Gray-violet neutrals |
| `--destructive` / `--danger` | Errors, destructive | Red |
| `--success`, `--warning` | Status pills, semantics | Green / amber oklch |
| `--border`, `--input`, `--ring` | Borders and focus | Gray ring at 50% opacity (buttons) |
| `--studio-accent-start/end` | Studio CTA gradient | Purple → blue |
| `--zone-studio-border` | Panel border | Luminous violet |
| Sidebar | `--sidebar-*` | Tinted sidebar strip |

**Editor vs studio zones:** `[data-zone="editor|studio"]` padding zeroed; **both zones share the same canvas** in v1 (zones are semantic for accents, not separate backgrounds).

### 3.3 Spacing

| Pattern | Value |
|---------|--------|
| **Shell content padding** | `p-4 md:p-6`, max width `max-w-7xl` centered |
| **PageLayout section gap** | `gap-8` between major blocks |
| **Card / panel padding** | `p-5` / `p-6` common; shadcn Card uses `--card-spacing` override on SURFACE_PANEL_CARD |
| **Form field gap** | `gap-1` within label stacks; `gap-4` in forms |
| **Grid gaps** | `gap-3` lists, `gap-8 lg:gap-10` create form |

**Implicit 8px grid** documented in UX_DESIGN_TOKENS; Tailwind spacing scale used directly (no `--space-1` CSS vars except radius derivatives).

### 3.4 Shape

| Element | Radius |
|---------|--------|
| Base `--radius` | `0.625rem` (10px) |
| `--radius-sm` … `--radius-4xl` | Scaled from base |
| `.surface-panel` | `var(--radius-xl)` |
| Buttons | `rounded-lg` |
| Device preview frame | `rounded-[2rem]` inner `rounded-2xl` |

### 3.5 Borders

- Default: `border-border` on inputs/outline buttons.
- Panels: `1px solid var(--zone-studio-border)`.
- Error inputs: `aria-invalid` styles on Button (inputs less consistently wired).
- Selected platform: inverted `border-foreground bg-foreground` (PlatformRoom).

### 3.6 Shadows

| Token | Use |
|-------|-----|
| `--shadow-panel` | `.surface-panel`, default cards |
| `--shadow-panel-hover` | Interactive cards, post rows |
| `--shadow-panel-lg` | Device preview |
| `--shadow-studio-glow` | Studio button hover/focus |
| `--shadow-sidebar` | Desktop sidebar |

---

## 4. Typography (spec for implementers)

**CURRENT:** See §3.1.

**RECOMMENDED (align code + docs, no font swap required):**

- Document **three tiers:** Display (Instrument Serif, page + empty titles), Section (Geist semibold 18px), Body (Geist 14/22).
- **Button text:** always `text-sm font-medium` (already in `buttonVariants`).
- **Line height:** keep `leading-snug` on large display; body `leading-relaxed` only in ReviewCopilot paragraphs.
- **Letter spacing:** display `-0.02em` on global `h1` only; do not add tracking elsewhere.

---

## 5. Color (spec for implementers)

**CURRENT:** §3.2.

**RECOMMENDED token aliases (optional CSS, map to existing):**

```css
--color-background: var(--background);
--color-surface: var(--surface-panel);
--color-surface-elevated: var(--card);
--color-primary: var(--primary);
--color-text: var(--foreground);
--color-text-muted: var(--muted-foreground);
--color-border: var(--border);
--color-focus: var(--ring);
--color-success: var(--success);
--color-warning: var(--warning);
--color-error: var(--destructive);
```

Use **studio gradient only** for primary journey CTAs (`variant="studio"`), not for every primary button on content detail (today Approve/Schedule use default `Button` — **intentional hierarchy question**; see P1).

---

## 6. Spacing (spec for implementers)

| Token name | Tailwind | Use |
|------------|----------|-----|
| page-padding | `p-4 md:p-6` | Shell inner |
| section-gap | `gap-8` | PageLayout |
| panel-padding | `p-5` or `p-6` | surface-panel interiors |
| field-gap | `gap-4` | Form sections |
| inline-gap | `gap-2` | Button groups, meta rows |

**Do not** introduce a second spacing scale; extend Tailwind consistently.

---

## 7. Components (inventory)

### Implemented and in use

- **Layout:** AppShell, AppNav, PageLayout, PageHeader, SectionHeader, StudioSectionIntro, BrandSelectorBar, FilterPillBar, CreatePageShell, UxZone (legacy wrapper — verify usage before extending)
- **Brand:** BrandHome, Promise/Words/Draft panels, Talk session view, BrandSelector, BrandStatusPill, BrandDangerZone, BrandTypographyProvider, JourneyStepper (dashboard)
- **Content:** StatusBadge, DraftGeneratingStatus, SchedulePostDialog, DevicePreview, PlatformRoom, GeneratePipeline, ReviewCopilot
- **States:** EmptyState, ErrorState, LoadingState, SetupError
- **shadcn UI:** button, input, textarea, card, badge, tabs, dialog, sheet, dropdown-menu, select, skeleton, avatar, sonner

### Implemented but not in primary routes

- BrandForm, brand-interview-panel, brand-voice-study-panel

### Not implemented (do not assume)

- Tooltip, Popover, Checkbox, Switch, Radio (shadcn), Combobox, DataTable, Drawer (except Sheet), Command palette, Notifications center, User avatar menu, Breadcrumbs, Image upload/crop UI, Rich text editor, Character counters, Form field `FormMessage` pattern (shadcn Form)

---

## 8. Component states (global rules)

| State | Current pattern |
|-------|-----------------|
| **Loading (page)** | Full-page `LoadingState` (3 skeleton bars) — **no shell** on dashboard load |
| **Loading (mutation)** | Button label change (`Saving…`, `Scheduling…`) or replace page with status panel (regenerate) |
| **Empty** | `EmptyState` in `surface-panel`, studio CTA |
| **Error** | `ErrorState` bordered card, optional Try Again |
| **Success** | Toast (brand), dialog step (schedule), navigation (create → content detail) |
| **Disabled** | `disabled:opacity-50`, draft tab disabled when not ready, approve disabled when status blocks |

---

## 9. Micro-interactions

### Button (`src/components/ui/button.tsx`)

| State | Behavior |
|-------|----------|
| DEFAULT | `rounded-lg`, variant-specific bg/border |
| HOVER | Primary `/80`; outline → `bg-muted`; studio → `opacity-95` + glow via `.btn-studio` |
| ACTIVE | `active:translate-y-px` (non-popup) |
| FOCUS | `focus-visible:ring-3 ring-ring/50`; studio uses tinted ring |
| DISABLED | `pointer-events-none opacity-50` |
| LOADING | **No built-in spinner** — callers swap label text only |
| ERROR | N/A at component level |

**RECOMMENDED:** Add optional `loading` prop with spinner + `aria-busy` for submit buttons (P2).

### Text inputs / Textarea

| State | Behavior |
|-------|----------|
| HOVER | shadcn default (minimal) |
| FOCUS | ring via global `outline-ring/50` on `*` — subtle |
| PLACEHOLDER | Used alongside visible labels on Create/brand forms (**good**) |
| VALIDATION | **Mostly missing** — HTML `required` only on some fields; no inline field errors |
| CLEAR | Not implemented |

### Cards (`SURFACE_PANEL_CARD` / `_INTERACTIVE`)

| State | Behavior |
|-------|----------|
| HOVER | Shadow hover + `-translate-y-px` on interactive variant |
| CLICK | Whole card is link on brands list |
| SELECTED | Not used |

### Dropdown (BrandSelector)

| State | Behavior |
|-------|----------|
| OPEN | Radix dropdown; checkmark on selected brand |
| KEYBOARD | Radix default |
| OUTSIDE CLICK | Closes menu |

**Duplicate selector:** Header **always** shows `BrandSelector`; several pages **also** show `BrandSelectorBar` — two selectors on same viewport (P1 UX clutter).

### Dialog

| State | Behavior |
|-------|----------|
| BACKDROP | `bg-black/10`, blur xs, fade 100ms |
| ENTRY/EXIT | `animate-in fade-in-0` / `fade-out-0` (tw-animate) |
| FOCUS TRAP | Radix Dialog |
| ESCAPE | Radix close |

### Tabs (Brand home)

| State | Behavior |
|-------|----------|
| ACTIVE | shadcn TabsTrigger default styles inside `surface-panel` list |
| DISABLED | Draft tab `disabled={!draftReady}` |
| KEYBOARD | Radix Tabs |

**URL sync:** `?tab=` + strip `talk` on tab change — **good continuity**.

### Filter pills (Content library)

| State | Behavior |
|-------|----------|
| SELECTED | `variant="default"` vs `outline` |
| ARIA | Parent `role="tablist"`, buttons `role="tab"` — **client-side filter only** (refetches with status param) |

### Toasts (Sonner)

Used heavily on **brand** mutations; **rare on content save/approve** (silent success aside from closing edit mode).

---

## 10. Motion system

| Name | Duration / easing | Usage |
|------|-------------------|--------|
| **Fast** | `duration-100` | Dialog overlay |
| **Normal** | `transition-all` on buttons/cards | Hover |
| **Slow** | `2s linear infinite` | `.studio-shimmer` on active pipeline step |
| **Voice** | `0.85s ease-in-out` | `.animate-voice-bar` |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables shimmer + voice bar | **Implemented** |

**Not present:** page transitions, list stagger, success checkmark animations.

**RECOMMENDED:** Standardize on `transition-[box-shadow,transform,opacity] duration-150 ease-out` for interactive panels (P2).

---

## 11. Collapse / expansion behavior

| Location | Default | Trigger | Animation | Persistence |
|----------|---------|---------|-----------|-------------|
| **Sidebar (desktop)** | Expanded | Icon in sidebar header | Width `w-56` ↔ `w-16` | `localStorage` `nav_collapsed` |
| **Mobile nav** | Closed | Menu icon → Sheet | Sheet slide (Radix) | Session |
| **Brand Promise “show more”** | Collapsed optional fields | Button toggle | Instant show/hide | Session |
| **Brand Your words alternatives** | `showAlternatives` false | User action | Instant | Session |
| **Brand danger zone** | `<details>` closed | Summary click | Chevron rotate `group-open:rotate-90` | DOM default |
| **Talk session** | Full-screen overlay state in panel | Enter/exit talk | Not documented as CSS transition | — |
| **Review copilot** | Always expanded | — | — | — |
| **Calendar day cells** | All items visible | — | — | — |

**Missing collapse:** long captions in content detail (full text always shown), hashtag lists, review issues (always full list).

---

## 12. Application shell

### Desktop (md+)

- **Left sidebar:** nav links, collapsible to icon-only.
- **Main column:** `.app-canvas` mesh background, **top header** with mobile menu (hidden), **BrandSelector**, content `max-w-7xl`.
- **No top user menu**, no notifications bell.

### Mobile

- Sidebar hidden; **Sheet** from left with same `AppNav`.
- Header: menu + brand selector (truncated `max-w-64`).

### Brand selector behavior

- Persists selection in browser storage (via BrandSelectionProvider).
- Changing brand on brand detail route **navigates** to new brand id.

### Page header

- Not global — each page composes `PageHeader` inside content area (below shell header).

**RECOMMENDED:** Decide single brand context control: shell header **or** `BrandSelectorBar`, not both on dashboard/content/calendar/create (P1).

---

## 13. Screen-by-screen UX

Legend: **Implemented** | **Partial** | **Missing**

---

### Dashboard (`/`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Orient user; surface Brand DNA progress + content stats |
| **Primary goal** | Continue expertise loop (talk, promise, draft, or review content) |
| **Primary CTA** | **Write as me** → `/create` (`variant="studio"`) |
| **Secondary** | Command center quick actions, open library/calendar, brand draft tab |
| **Hierarchy** | Greeting H1 → BrandSelectorBar → Command center → optional stats/lists |
| **Layout** | `PageLayout full`, sections `gap-8` |
| **Loading** | Full page LoadingState (**no shell skeleton**) |
| **Empty** | No brands → EmptyState; brands but no posts → inline surface-panel CTA block |
| **Error** | ErrorState + retry on posts fetch |
| **Responsive** | Stats grid `sm:2 lg:4`; post rows wrap |
| **A11y** | Post lists are links; sections have `aria-label` on stats |

**Partial:** Command center hidden if brand context fails silently (`return null`).

---

### Create Content (`/create`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Generate post from brand DNA + topic |
| **Primary CTA** | **Write as me** submit |
| **Gating** | No brands → empty; not `draftReady` → EmptyState with link to brand |
| **Form** | Topic (required), optional description, PlatformRoom |
| **Generation** | Replaces form with `DraftGeneratingStatus` phases; polls then navigates to `/content/[id]` |
| **Error** | ErrorState with retry on hard failure |
| **Success** | Redirect to content detail (no toast) |

**Partial:** Loading states don't use GeneratePipeline step progression tied to real backend events (static `pipelineStep` default `"write"`).

---

### Content library (`/content`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Browse posts for selected brand |
| **Primary CTA** | Write as me (header) |
| **Filters** | Client state + API `status` query param |
| **Cards** | Image (signed URL) or placeholder, headline, status, View |
| **Empty/Error/Loading** | Standard state components |

**Missing:** search, sort, pagination (loads full user list), filter URL sync.

---

### Content detail / Content Studio (`/content/[id]`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Preview, edit, approve, schedule, regenerate |
| **Primary CTA** | Contextual: **Approve** (draft), **Schedule** (approved), **Edit** |
| **Layout** | 3-col xl: DevicePreview | caption fields | ReviewCopilot |
| **Edit mode** | Swaps center column to form; image prompt exposed |
| **Regenerate** | Confirm dialog → full-page “Creating your post...” |
| **Approve** | Dialog confirm |
| **Schedule** | SchedulePostDialog |
| **Save** | No toast; exits edit on success |
| **Unsaved changes** | Cancel resets form; **no leave guard** |

**Partial:** Review panel hidden while editing. Status actions only cover `draft` and `approved` (`studio-status-actions.ts`) — other statuses hide approve/schedule.

**Basic:** Image is display-only; no regenerate-image-only, no download, no hover actions.

---

### Calendar (`/calendar`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Month view of scheduled posts (brand-filtered) |
| **Primary action** | Navigate months; click post → content detail |
| **Empty** | EmptyState when no items in month (grid may still show) |
| **Responsive** | Horizontal scroll `min-w-[40rem]` on grid |

**Missing:** week/day views, drag reschedule, timezone display on grid.

---

### Brands list (`/brands`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Pick brand; create new |
| **Primary CTA** | New brand (studio) |
| **Cards** | Name, status pill, helper line; link to detail |

**Note:** Status on list uses `deriveBrandSetupStatus(brand, [], [])` **without** words/samples — may under-report readiness until opening brand.

---

### New brand (`/brands/new`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Minimal create |
| **CTA** | Start with talk (studio) / Type instead |
| **Success** | Redirect `?tab=words&talk=1` or `?tab=promise` |

---

### Brand detail (`/brands/[profileId]`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Promise → Your words → Draft |
| **Tabs** | URL-driven; Draft locked until ready |
| **Primary CTAs** | Per tab: save promise, talk/paste, draft generate |
| **Delete** | Danger zone → `window.confirm` |

**Strongest screen in the app.** Talk session is full-flow WebRTC + review.

---

### Social accounts (`/accounts`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Manage connected accounts |
| **Primary CTA** | Connect (**disabled** unless flag) |
| **Empty** | EmptyState without action button |

**Honest:** Publishing not product-ready in UI.

---

### Settings (`/settings`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Account read-only + theme toggle |
| **Layout** | `PageLayout narrow` |
| **Missing** | Password, billing, notifications, API keys |

---

## 14. AI generation UX

### Create flow states (implemented)

1. **Pre-generation:** Form visible; submit disabled without topic.
2. **Drafting:** `DraftGeneratingStatus` `phase="drafting"` + `GeneratePipeline` ( **not** tied to real progress %).
3. **Still generating:** HTTP timeout/recoverable error → polling copy + pipeline on “review” step.
4. **Poll exhausted:** Message + link to content library + “Back to form”.
5. **Completion:** Auto-navigate to new post id.
6. **Failure:** ErrorState; user-safe message only.

### Content detail regenerate

- Confirm dialog → pending UI (“Creating your post...”) → refetch post.

### What UI must not show (currently compliant)

- Model names, token counts, raw prompts in primary UI (image prompt is editable in advanced edit — **borderline**; treat as “direction for image” copy in P1).

**RECOMMENDED:** Never show numeric progress bar; keep qualitative pipeline steps only. Optionally advance steps on timed phases **only if** labeled as illustrative (P3 — risk of feeling fake if overdone).

---

## 15. Content Studio UX (detail page specification)

### CURRENT

| Element | Behavior |
|---------|----------|
| **Image** | DevicePreview + library card; signed URL; placeholder if missing |
| **Headline/Caption/Hashtags/CTA** | Read view + edit form |
| **Platform** | Read-only in header meta |
| **Status** | StatusBadge |
| **Edit** | Toggles form; Save/Cancel |
| **Approve** | Modal; blocked for scheduled/publishing/published |
| **Schedule** | Date/time/timezone inputs; success dialog with calendar link |
| **Regenerate** | Replaces all generated content (confirmed) |

### RECOMMENDED improvements (see priorities)

- Unsaved changes prompt when leaving edit mode or route.
- Success toast or inline banner on save/approve.
- Collapse long caption with “Show more”.
- Separate **Regenerate copy** vs **Regenerate image** if backend supports (backend suggestion).
- Use `variant="studio"` only for forward journey, default for destructive/secondary actions.

---

## 16. Form standards

### CURRENT patterns

- Labels above controls (`text-sm` label wrapping control).
- Placeholders supplement labels on Create (acceptable).
- Required: native HTML `required` on some fields.
- Server errors: generic ErrorState blocks, not field-level.
- Submit: disables with pending label on some forms.

### RECOMMENDED standards for implementers

1. **Never placeholder-only labels.**
2. **Helper text** under label, `text-xs text-muted-foreground`.
3. **Inline errors** `text-sm text-destructive` under field when API returns field errors (today API mostly doesn't — see backend section).
4. **Primary submit** bottom-right or full-width on mobile; **studio** variant for journey submits only.
5. **Cancel** always `outline`, never destructive.
6. **Dirty tracking** on brand promise and content edit forms.

---

## 17. Responsive behavior

| Screen | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| **Shell** | Sidebar + header | Same | Sheet nav; full-width content |
| **Dashboard** | 4-col stats | 2-col | 1-col stacks |
| **Create** | 2-col form | 2-col | Single column stack |
| **Content library** | 3-col grid | 2-col | 1-col |
| **Content detail** | 3-col xl | 1-col stack (preview then copy) | Same; action buttons wrap |
| **Calendar** | Full grid | Horizontal scroll | Horizontal scroll |
| **Brand tabs** | 2-col in panels | Stacks | Talk session full viewport |
| **Command center** | Multi-column quick actions | Wrap | Wrap |

**Fixed:** Shell header height `h-14`. **No bottom sheet** patterns.

---

## 18. Accessibility

### CURRENT

- Skip: no skip link.
- Focus: visible on buttons/links (`ring-3`).
- Landmarks: `nav aria-label="Primary"`, calendar `role="grid"`.
- Live regions: generation/regenerate use `role="status" aria-live="polite"`.
- Theme: user toggle in settings.
- Delete: native confirm (accessible but harsh).

### RECOMMENDED

- Fix `PageHeader` description: use `<div className="mt-1 text-sm text-muted-foreground">` when `description` is not plain text.
- Add skip to main content link in AppShell.
- Replace `window.confirm` with destructive Dialog (focus trap, explicit labels).
- Announce save success via toast + `aria-live` or focus management.
- Ensure filter tabs implement roving tabindex or use Radix Tabs consistently.
- Verify contrast on studio gradient buttons (white on purple — generally OK).

---

## 19. Component behavior catalog

Format abbreviated; only components that **exist** or are **required**.

### Button

- **Purpose:** Actions, links (`asChild`).
- **Variants:** default, outline, secondary, ghost, destructive, link, **studio**.
- **When NOT:** Studio variant on neutral settings actions.
- **Loading:** text swap only (recommended: spinner prop).

### Input / Textarea

- **Purpose:** Text entry.
- **States:** disabled, aria-invalid (button only today).
- **Missing:** field-level error styling hookup.

### Select

- **Exists in ui/select.tsx** — limited usage in app (prefer PlatformRoom custom).

### Card

- **Purpose:** Grouping; with SURFACE_PANEL_CARD for canvas consistency.
- **Interactive:** hover lift on library/brand cards.

### Badge / StatusBadge

- **Purpose:** Post status chip.
- **Variants:** mapped per status string.

### Tabs

- **Purpose:** Brand home primary navigation.
- **When NOT:** Content filters (use FilterPillBar pattern or unify with Radix Tabs).

### Dialog

- **Purpose:** Approve, regenerate, disconnect account, schedule.
- **Schedule:** two-step content (form → success).

### Sheet

- **Purpose:** Mobile navigation only.

### Dropdown Menu

- **Purpose:** Brand selector.

### Toast (Sonner)

- **Purpose:** Brand saves, talk session feedback.
- **Gap:** underused on content studio saves.

### Skeleton / LoadingState

- **Purpose:** Initial page load placeholder.
- **Gap:** not structured like final layout (P2 skeleton screens).

### EmptyState / ErrorState

- **Purpose:** Zero data and failure blocks.
- **EmptyState:** studio CTA optional.

### PageHeader / PageLayout / StudioSectionIntro

- **Purpose:** Consistent page and section hierarchy.
- **Use on all new screens.**

### BrandSelector / BrandSelectorBar

- **Purpose:** Workspace brand context.
- **Issue:** duplication with shell header selector.

### DevicePreview / PlatformRoom / GeneratePipeline / ReviewCopilot

- **Purpose:** Content create + studio metaphor UI.
- **ReviewCopilot:** not collapsible; no “AI” branding in title (good).

### Image Card (library)

- **Purpose:** Post thumbnail + meta.
- **Not** a separate component — inline in content page.

### Date/Time

- **Native** `<input type="date|time">` in schedule dialog — **no DatePicker component**.

### Components NOT in repo (do not implement unless needed)

- Combobox, Tooltip, Switch, Checkbox (standalone), Table, Drawer, Modal separate from Dialog.

---

## 20. UX principles (product)

1. **AI drafts; human approves.** Generation is never the final step.
2. **Brand DNA before blank prompts.** Create is gated on promise + material.
3. **One primary action per screen** (Write as me, Save promise, Approve, etc.).
4. **Progressive disclosure** (promise “show more”, danger zone collapsed, draft tab locked).
5. **Honest system state** — no fake percentages; polling honesty in `still_generating` copy.
6. **Preserve user work** — partial: no route-leave guard on edits (gap).
7. **Unified canvas** — avoid white “islands”; use `surface-panel`.
8. **Do not expose implementation** — no model names in UI.
9. **Destructive actions** visible but tucked (danger zone, disconnect confirm).
10. **Calm SaaS motion** — respect reduced motion.

---

## 21. Design tokens (practical set)

Already in CSS — implementers should **use these names** before adding new ones:

| Category | Tokens |
|----------|--------|
| Canvas | `--app-canvas-base`, `.app-canvas` |
| Surfaces | `--surface-panel`, `--card`, `--background` |
| Studio | `--studio-accent-start`, `--studio-accent-end`, `--zone-studio-border` |
| Shadows | `--shadow-panel`, `--shadow-panel-hover`, `--shadow-panel-lg`, `--shadow-studio-glow`, `--shadow-sidebar` |
| Typography | `--font-sans`, `--font-display`, `--brand-font-heading`, `--brand-font-body` |
| Radius | `--radius`, `--radius-xl`, Tailwind `--radius-sm`… |
| Semantic | `--success`, `--warning`, `--destructive`, `--muted-foreground` |

Tailwind `@theme inline` maps `--color-*` for shadcn compatibility.

---

## 22. P0 / P1 / P2 / P3 improvements

### P0 baseline (locked — do not regress)

**Status:** Implemented in `ai-social-media-ui` (2026-09). Treat as **non-negotiable** for any UI change. P1+ may ship incrementally; P0 must stay true on every route in §2.

| Item | Reason | Verification |
|------|--------|--------------|
| **Unify brand selector placement** | Two selectors on same page causes confusion and double API/context noise. Pick header **or** in-page bar per route class. | Only `BrandSelector` in `AppShell` header; no `BrandSelectorBar` on mounted routes. |
| **Replace `window.confirm` brand delete** | Inconsistent with Dialog pattern; poor SR experience. | Active flow: `BrandDangerZone` + Dialog on brand detail. (Dead `BrandForm` still has confirm — not routed.) |
| **PageHeader invalid HTML when `description` is ReactNode** | Wrap non-text descriptions in `<div>`, not `<p>`. | `page-header.tsx`: string → `<p>`, else `<div>`. |
| **Brands list readiness pill accuracy** | List passes empty samples/answers — status misleading vs detail page. | `deriveListBrandSetupStatus()` — never `ready_to_draft` on list without API counts. |
| **Content save/approve success feedback** | Silent success feels broken; add toast or inline confirmation. | Sonner toast on content studio save + approve. |

Agents: read `.cursor/skills/next-gen-ux/SKILL.md` laws 1–2 and 6 before adding UI. Decorative or P2 work that breaks P0 is out of scope.

### P0 — Fix immediately (correctness, trust, a11y blockers)

_Historical checklist — see **P0 baseline (locked)** above for current status._

### P1 — Important UX improvements

| Item | Reason |
|------|--------|
| **Unsaved changes guard** on content edit and promise form | Prevent data loss on navigation. |
| **LoadingState inside shell** | Dashboard/content load should keep nav visible. |
| **Field-level validation** for promise required fields before save | Reduce save-error toasts only. |
| **Content library filter URL sync** (`?status=draft`) | Shareable state, back button works. |
| **Schedule UX**: validate datetime in past; timezone helper text | Reduce scheduling errors. |
| **Status-driven actions** document all post statuses in UI | e.g. failed/published — what can user do? |
| **Remove or wire dead components** (BrandForm, voice study) | Reduce agent confusion. |
| **Approve/Schedule visual hierarchy** | Consider outline secondary vs studio primary consistently. |

### P2 — Polish

| Item | Reason |
|------|--------|
| **Skeleton layouts** matching PageHeader + cards | Perceived performance. |
| **Button loading spinner + aria-busy** | Standard SaaS pattern. |
| **Caption truncate + expand** | Long content readability. |
| **ReviewCopilot collapsible sections** | Progressive disclosure for long issue lists. |
| **Calendar empty vs grid** | Hide empty grid when EmptyState shows, or show muted grid. |
| **Harmonize ErrorState** with `surface-panel` vs bordered card | Visual consistency. |
| **Image hover** on library (subtle scale, no fake actions) | Affordance for clickable card. |

### P3 — Future enhancements

| Item | Reason |
|------|--------|
| **OAuth connect flow UI** when flag enabled | Required for real publishing. |
| **Notifications center** | When backend events exist. |
| **Search/sort/pagination** on content library | Scale. |
| **Week/day calendar**, drag reschedule | Scheduling power users. |
| **Regenerate image only** | Needs API support. |
| **Onboarding checklist** overlay | Optional; dashboard partly covers. |

---

## 23. Backend change suggestions

Only where frontend cannot complete UX without API changes.

---

### Feature: Accurate brand readiness on list endpoint

- **Why frontend cannot complete:** List page only has profile rows, not voice samples/interview counts without N+1 queries.
- **Current API:** `getUserBrandProfiles` returns profiles only.
- **Suggested API:** Include `setup_status` or `{ material_count, promise_complete }` per profile in list response.
- **Breaking change:** No (additive fields).

---

### Feature: Field-level validation errors on brand/post update

- **Why:** Inline form errors need structured messages.
- **Current API:** Success flags / generic errors.
- **Suggested API:** `{ success: false, fields: { target_audience: "..." } }`
- **Breaking change:** No.

---

### Feature: Post action matrix for all statuses

- **Why:** UI hides actions for `published`, `failed`, etc.
- **Current API:** Approve returns 400 for some statuses (documented in code comments).
- **Suggested API:** Optional `allowed_actions: string[]` on get post.
- **Breaking change:** No.

---

### Feature: Regenerate image without full post regenerate

- **Why:** Content studio image is display-only except full regenerate.
- **Current API:** `regenerateSocialPost` full post.
- **Suggested API:** `POST /posts/{id}/regenerate-image`
- **Breaking change:** No.

---

### Feature: Social OAuth connect

- **Why:** Connect button disabled; no flow.
- **Current API:** `canInvokeSocialConnect(flags)` false by default.
- **Suggested API:** OAuth start/callback endpoints (product dependent).
- **Breaking change:** N/A (new).

---

### Feature: Publishing / push to platform

- **Why:** Schedule stores time but UI copy says publishing unavailable.
- **Current API:** Unknown publish trigger from UI.
- **Suggested API:** Publish job + status webhooks for `publishing` → `published` | `failed`.
- **Breaking change:** N/A (new).

---

## 24. Implementation guidance

1. **Read first:** `globals.css`, `PageLayout`, `PageHeader`, `EmptyState`, `surface-panel-card.ts`, `brand-readiness.ts`, `studio-status-actions.ts`, `use-draft-generate-flow.ts`.
2. **New screens:** Always `AppShell` → `PageLayout` → `PageHeader` → content; use `surface-panel` for blocks.
3. **Primary journey CTA:** `Button variant="studio"`.
4. **Do not add** Tooltip/Popover libraries until a concrete screen needs them (YAGNI).
5. **Match motion** to §10; test with `prefers-reduced-motion: reduce`.
6. **Keep diffs minimal** — this codebase recently unified canvas; don't reintroduce zone-specific page backgrounds.
7. **Figma:** Update typography table to Instrument Serif + Geist when touching design docs.
8. **Verify** against running app routes listed in §2; ignore unused brand form components unless product reintroduces them.

---

## 25. Interaction → corpus → generation (agent truth)

Not every UI interaction feeds the next post. Use this when designing capture or dashboard priority.

| Interaction | Stored | Used in `draft-generate` / DNA context |
|-------------|--------|----------------------------------------|
| Promise save | `brand_profiles` | Yes |
| Talk finish & save | `corpus_items` (append per answer) | Yes (topic + recency, max 12 chunks) |
| Paste on Your words | `corpus_items` | Yes |
| Mini talk finish | `corpus_items` (`mini_talk`) | Yes — stacks, no theme overwrite |
| Studio caption save | `social_posts` (+ optional `voice_samples` on meaningful rewrite) | Yes when edit is substantial |
| Navigation / quick links | — | No (UI priority only) |
| Abandoned talk | Session row | No until finished |

**Channels** = platform rooms on Create (`PlatformRoom`), not a separate product chat. **Priority** = command center primary CTA + recent activity snapshot, not a static six-tile grid.

Capture tiers: **mini talk** (1–2 min anytime), **full talk** (onboarding / deep sitting), **paste**. After `draft_ready`, demote full talk; lead with review / write / continue recent.

---

## 26. Final recommendations

### Preserve (do not regress)

- Unified `.app-canvas` + `.surface-panel` visual system.
- Brand tab journey with URL state and talk deep links (`?talk=1`).
- Dashboard command center as DNA hub.
- Honest generation copy (polling, no fake %).
- `GeneratePipeline` as qualitative progress metaphor.
- User-safe error messaging pattern.

### Current state summary

The app is a **coherent v1** with a **strong Brand DNA vertical** and a **serviceable but basic** content library/studio. Shell and tokens are **ahead of** content-management features (accounts, publishing, advanced studio tooling). The design system is **emerging in code** (`PageLayout`, studio intro, state components) but **not yet enforced everywhere** (loading without shell, duplicate brand selector, inconsistent success feedback).

### Recommended implementation sequence for next agent

Follow `.cursor/skills/next-gen-ux/SKILL.md` (doctrine) and `.cursor/skills/developer/SKILL.md` (how to ship). Orchestrator: `.cursor/skills/orchestrator/SKILL.md`.

1. P0 fixes (selector duplication, delete dialog, PageHeader markup, list status, content success feedback).
2. P1 forms and navigation guards on content + promise.
3. P1 content library URL filters and status action clarity.
4. P2 polish (skeletons, button loading, caption expand).
5. Backend-additive improvements when API team can add list readiness + allowed_actions.

This document is intentionally grounded in **verified routes and components**. Where the product is basic or missing, implementation should **improve clarity and trust**, not add decorative complexity. Next-gen UX is **anticipation + restraint**: one brand context, one loud CTA, shell always present, honest generation, no implementation leak.
