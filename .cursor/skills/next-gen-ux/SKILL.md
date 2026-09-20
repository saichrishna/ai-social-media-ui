---
name: next-gen-ux
description: Next-gen UX doctrine for the AI Social Media UI — invisible system depth, one obvious next step, spatial continuity. Use when planning or implementing screens, navigation, layout, components, motion, copy, or accessibility in ai-social-media-ui.
---

# Next-gen UX (develop against this)

Read this **before** any UI plan or implementation. Then read `docs/UX_DESIGN_SYSTEM_REVIEW.md` for verified routes, tokens, and P0–P3. Companion: [screen-contracts.md](screen-contracts.md).

## The paradox (non-negotiable)

The product must feel **impossible to reverse-engineer as software** — users should not reconstruct pipelines, statuses, or APIs — and **trivial to move through**. They should only hold a simple story: who I am on the feed, what to do now, is this post me.

Next-gen is **anticipation + restraint**, not more glass, motion, widgets, or AI chrome.

If a stranger could have generated the post, we failed. If the user has to *operate an AI tool*, we failed. They should feel: **this still sounds like me, and I always know the one next click.**

## User never has to think about

- Models, tokens, agents, prompts, pipelines, ComfyUI, Ollama
- Two places to pick a brand
- A status state machine (`draft` / `approved` / `scheduled` / …) as homework
- Where the “real” page went during loading (shell must stay)
- Whether save worked (silent success is a bug)
- Whether leaving the screen destroys work

## User only has to feel

1. **Who I am on the feed** (one brand context, always visible in chrome)
2. **What now?** (one primary action per screen, computed from real state)
3. **Is this me?** (studio: preview + words + approve/fix)
4. **I can leave and come back** without hunting

## Laws

### 1. Spatial continuity

Same `.app-canvas`, same `AppShell`, same brand identity. Loading, empty, and error states live **inside** the shell. Route changes are a focus shift, not a new product.

Use `PageLayout` → `PageHeader` → `.surface-panel` / `SURFACE_PANEL_CARD`. Do not invent a second visual language.

### 2. One context control

Shell header **owns** brand selection. Do not also render `BrandSelectorBar` on the same viewport. Changing brand changes the world; it must not look like a form field.

### 3. Computed next action

One **studio** CTA for the forward journey (`Button variant="studio"`). Everything else is quieter (`outline` / `ghost` / default). Never compete three glowing buttons.

Map state → action (examples):

| Honest state | The only loud button |
| --- | --- |
| No brand | Start a brand |
| Brand, DNA incomplete | Continue promise / talk |
| DNA ready, no post in flight | Write as me |
| Draft post | Approve (or Edit) |
| Approved | Schedule |

### 4. Progressive disclosure

Lock what is not ready (Draft tab pattern). Collapse optional, long, and destructive. Review issues and long captions expand. Danger zone stays `<details>` or equivalent — never a top-of-page delete.

### 5. Honest magic

Qualitative pipeline metaphors only. **No fake %.** Polling copy stays truthful (`still generating`). Labels stay human: “Write as me”, “Creating your post”, “Your words” — never implementation nouns.

Image prompt in edit is “direction for the image”, not a raw prompt console.

### 6. Trust is UI

- Success: toast and/or inline confirmation on content save/approve (not only brand).
- Failure: `ErrorState` + retry; `USER_SAFE_ERROR_MESSAGE` only.
- Delete: Dialog, never `window.confirm`.
- Dirty forms: leave/edit-cancel guard on promise + content edit.
- List status must match detail (do not pass empty samples into readiness on `/brands`).

### 7. Navigation is a story, not an org chart

IA is the loop, not the database:

```text
Home (what now?)
  → Brand (who I am)
  → Create (say the topic)
  → Studio (is this me?)
  → Library / Calendar (where is it?)
```

Do not add nav for unimplemented product (analytics, billing, AI settings). Accounts stay honest: disabled Connect is not a fake success.

### 8. Motion orients, it does not perform

Interactive panels: `transition-[box-shadow,transform,opacity] duration-150 ease-out`. Honor `prefers-reduced-motion`. No route-transition theater. Pipeline shimmer only while generating.

### 9. Accessibility is the same navigation

Skip to main. `PageHeader` description is a `<div>` when not plain text. Filters: real tabs or honest buttons. Generation and save use live regions. Focus rings stay. Keyboard must reach the primary CTA without a map.

### 10. Stack and components

Do not rebuild Next.js / Tailwind v4 / shadcn / TanStack Query. Do not add Tooltip, Command palette, Table, DatePicker, or Combobox until a named screen cannot be completed without them.

Dead components (`BrandForm`, interview/voice-study panels) are **not** current UX. Do not wire them unless the plan says so.

## Copy

- Primary journey verb: **Write as me** (not Generate, not Create with AI).
- Errors: complete sentences, no status codes.
- Empty states: one sentence + the same primary CTA the screen would have if data existed.

## Forms

Labels above controls (never placeholder-only). Helper `text-xs text-muted-foreground`. Inline `text-destructive` when field errors exist. Submit: studio only for journey; cancel is `outline`.

## Browser verification (required for UI)

Exercise the changed flow as a user: click, type, submit, navigate. Check other routes that share the state you touched. Empty, loading, error, and success. Desktop and mobile if layout changed. A screenshot is not verification.

## Stop and suggest backend

If the UI cannot tell the truth without an API field, do not fake it. Return:

```text
BACKEND CHANGE SUGGESTION
Why:
Current API:
Suggested API change:
Frontend benefit:
Breaking change: Yes / No
```

Known honest gaps (from the review): list `setup_status`, field-level errors, `allowed_actions` on posts, regenerate-image-only, OAuth/publish when flagged.

## Build order (do not skip)

1. **P0 baseline (locked)** — see `docs/UX_DESIGN_SYSTEM_REVIEW.md` §22 “P0 baseline (locked)”. Do not regress: one brand selector (header only), delete Dialog on active brand flow, valid PageHeader markup, honest list readiness, content save/approve toasts.
2. P1 in `docs/UX_DESIGN_SYSTEM_REVIEW.md` (unsaved guard, in-shell loading, field validation, library `?status=`, schedule validation, status actions)
3. P2 polish (skeletons, button loading, caption expand, review collapse)
4. P3 only with product/API approval

Decorative work before P0 is out of scope.

## Developer kickoff (paste into the developer specialist)

```text
Implement only the approved plan in ai-social-media-ui.

Read:
- .cursor/skills/next-gen-ux/SKILL.md
- .cursor/skills/next-gen-ux/screen-contracts.md
- docs/UX_DESIGN_SYSTEM_REVIEW.md (P0–P3 + current components)

Bar: invisible system depth, one obvious next step, spatial continuity.
Do not add a second design system, dual brand selectors, fake %, or model/pipeline jargon.
Keep AppShell mounted on load. Studio variant only on the forward journey CTA.
Verify the changed flow in the browser (behavior, not a screenshot). Check shared brand/post state on other routes.
Do not invent API fields. If blocked, return BACKEND CHANGE SUGGESTION and stop that slice.
Do not commit.
```

## Examples

**Good:** Dashboard command center shows a single studio button “Continue your words” because talk is incomplete; header already has the brand; no `BrandSelectorBar`.

**Bad:** Dashboard greeting + in-page brand bar + “Write as me” + “Open library” + “Open calendar” all as studio-gradient buttons.

**Good:** Content save shows a toast; leaving edit with dirty fields asks to stay.

**Bad:** Edit save exits silently; loading the library unmounts the sidebar.

