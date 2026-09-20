# Production UX — Figma build spec (Brand DNA v1)

**Figma file name:** `AI Social — Brand DNA v1`  
**Repo tokens:** [UX_DESIGN_TOKENS.md](./UX_DESIGN_TOKENS.md)  
**Product copy source:** [BRAND_DNA_PRODUCT_SPEC.md](./BRAND_DNA_PRODUCT_SPEC.md)

## Cover (Figma page `00_Cover`)

- Version: 1.0
- Principle: **Hybrid** — Editor zone (Promise, Words) + Studio zone (Draft, Generate, Content)
- Prototype happy path: A1 → A3 → B0 → C1 → C3 → C4 → C5 → D1 → D2 → D3
- Engineering: do not expose Ollama, ComfyUI, model names, or “prompt engineering” in UI

---

## Page `02_Components` — build sheet

Create as Figma components with variants listed. Dev mapping in [`src/components/ux/`](../src/components/ux/).

### BrandStatusPill

| Variant | Label | Color token |
|---------|-------|-------------|
| `incomplete` | Promise incomplete | muted |
| `need_words` | Need your words | warning |
| `ready` | Ready to draft | success |

Props: `status: 'incomplete' | 'need_words' | 'ready'`

### JourneyStepper

Steps: Promise → Words → Draft.

| Step state | Visual |
|------------|--------|
| `done` | Filled dot + label |
| `current` | Ring + bold label |
| `locked` | Muted + lock icon on Draft only |

Props: `activeStep`, `draftLocked: boolean`

### EditorField

Label + helper (13px muted) + control. Spacing: 4px label–helper, 8px helper–input.

### TalkSessionCard

Variants: `idle` | `prep` | `live` | `review`

- **idle:** cold open textarea, “Prepare session”
- **prep:** prep brief card + first question
- **live:** waveform strip + transcript + “Save & next question”
- **review:** list of Q/A editable + “Finish & save to Your words”

### MaterialChip

Variants: `interview` | `paste` — outline button, max 2 lines, truncates with ellipsis.

### PlatformRoom

Variants: `instagram` | `linkedin` | `facebook` — segmented control with platform label + helper “Same truth. Different shape.”

### GeneratePipeline

Steps (vertical or horizontal):

1. Grounding in your words
2. Writing as you
3. Reviewing for clarity
4. Creating image (optional — subline “Finishes in background”)

States per step: `pending` | `active` | `done`

### DevicePreview

Variants: platform × `hasImage` | `noImage`. Phone frame 390×844 scaled to column width; image square inside.

### ReviewCopilot

Sections: Approved line, Reason, Issues (bullets), Suggestions (bullets). Not a score. Min height 160px.

### EmptyStatePro

Illustration slot 120×120 + title + description + primary CTA.

---

## Page `03_Flows_Desktop` — frames 1440×900

Artboard padding: 24px content within shell (sidebar 224px + header 56px — match [`app-shell.tsx`](../src/components/shell/app-shell.tsx)).

### A — Brands

#### A1 `Brands_list`

- **Route:** `/brands`
- **API:** `GET /brand-profiles/user/{user_id}`
- **Layout:** H1 “Brands” + primary “New brand”. Grid 2 cols cards.
- **Card:** business name (16px semibold), one line `target_audience` truncated, `BrandStatusPill`, chevron.
- **Primary action:** New brand → A3

#### A2 `Brands_empty`

- **Copy title:** No brands yet
- **Copy body:** Name a brand, tell us who it is for, then add words only you would say.
- **CTA:** New brand

#### A3 `New_brand`

- **Route:** `/brands/new`
- **Fields:** Business name (required)
- **Primary CTA:** Start with talk → creates brand + navigates to Words/Talk (B0 tab words)
- **Secondary:** Type instead → B0 Promise tab

### B — Brand shell

#### B0 `Brand_shell`

- **Route:** `/brands/[profileId]`
- **Header row:** H1 business name, status line (`brandSetupStatusLabel`), `JourneyStepper` right-aligned on desktop
- **Tabs:** Promise | Your words | Draft (disabled if locked)
- **Zone:** Tab content only — editor or studio wrapper
- **Annotations:** `queryKey` brand-profile, samples, interview-answers; selector syncs URL

#### B1 `Tab_Promise` — selected Promise  
#### B2 `Tab_Words` — selected Your words  
#### B3 `Tab_Draft` — selected Draft (studio zone when unlocked)

### C — Editor zone

#### C1 `Promise_form`

- **Headline:** Who is this for?
- **Sub:** Not “Brand profile.” One sitting, ~3 minutes.
- **Fields (order):**

| Field | Helper copy |
|-------|-------------|
| Business name | |
| Who you help | The person who would nod if they read the post |
| What you actually do | One per line — services you deliver |
| Who you are not for | Saying no is part of the brand |
| Topics you will not touch | One per line |
| What a good week of content would change | One sentence |

- **Warning (inline, if `not_for` empty):** Without this, we will sound like everyone in your industry.
- **Sticky footer:** Save promise
- **API:** `PUT /brand-profiles/{id}`

#### C2 `Words_hub`

- **Headline:** You stay the expert. We do the writing.
- **Hero card:** Talk — “About 8 minutes. One question at a time.”
- **Accordion collapsed:** I already have captions (paste 3–10)
- **Link:** Type the five questions instead

#### C3 `Talk_session_idle`

- Cold open label: “In your own words, what do you do?”
- Buttons: Prepare session | Start new sitting
- Status line area (muted)

#### C4 `Talk_session_live`

- Prep brief card (muted surface)
- Current question (18px)
- Transcript area + waveform placeholder
- Primary: Save & next question
- Secondary: Disconnect

#### C5 `Talk_review`

- Headline: Review each answer
- Editable text areas per answered question
- Primary: Finish & save to Your words
- **API:** answer steps + `POST .../complete`

#### C6 `Draft_locked`

- Illustration + title: Draft unlocks after we know you
- Body: Finish Promise and add at least three pastes or answers under Your words.
- CTA: Go to Your words

### D — Studio zone

#### D1 `Draft_studio`

- **Max width:** 1152px, two columns 1fr 1fr gap 32px
- **Left column title:** From your material
- **Chips:** `MaterialChip` from `GET .../draft-topics`
- **Topic input:** Topic for this post
- **Direction textarea:** Extra direction (optional)
- **Right column title:** Choose the room
- **PlatformRoom** control
- **Primary CTA:** Write as me (studio gradient button)
- **API:** `POST .../draft-generate`

#### D2 `Generating_pipeline`

- **Title (drafting):** Creating your draft…
- **Title (still on server):** Still generating on the server
- **Body:** Grounded in your promise and Your words. Ollama and image generation can take several minutes — stay on this page.
- **Component:** `GeneratePipeline` with step 2 active (example)
- **Link:** Content Studio (still_generating variant)

#### D3 `Content_studio`

- **Route:** `/content/[id]`
- **Layout:** 40% `DevicePreview` | 60% caption column | full-width `ReviewCopilot` below or right rail 320px
- **Actions row:** Regenerate | Edit | Approve | Schedule
- **API:** `GET /api/social-posts/{id}` (signed image URL)

#### D4 `Content_studio_edit`

- Same layout; fields editable; Save changes sticky

### E — States

#### E1 `Corpus_insufficient`

- Title: We need your words before we draft
- Body: Add at least three pastes or answers under Your words.
- CTA: Open brand → Words tab

#### E2 `API_error`

- Title: We couldn't finish that
- Body: Your work is safe. Try again in a moment.
- CTA: Retry

#### E3 `Poll_exhausted`

- Title: We didn't see the draft yet
- Body: Check Content Studio before trying again so you don't create duplicates.
- CTA: Open Content Studio

---

## Page `04_Flows_Mobile` — 390×844

Build frames: **C3m, C4m, D1m, D2m, D3m** — stack columns, full-width CTAs, Talk waveform full width.

| Desktop | Mobile notes |
|---------|----------------|
| D1 | Single column: material chips → topic → platform → Write as me |
| D3 | Device preview full width top; caption below; ReviewCopilot accordion |
| C4 | Sticky bottom Save & next |

---

## Page `05_States`

Duplicate E1–E3 as standalone artboards with component instances.

---

## Page `06_Annotations`

Per frame, dev overlay (red, 10px):

| Frame | Route | Query keys | API |
|-------|-------|------------|-----|
| C1 | `/brands/[id]` | brand-profile | PUT brand |
| C4/C5 | same | interview-sessions | POST answer, complete |
| D1 | same | brand-draft-topics | draft-generate |
| D3 | `/content/[id]` | social-post | GET post |

---

## Prototype wiring (Figma)

1. A1 card click → B0 (Words)
2. B0 tab Promise → C1
3. C2 “Talk” → C3 → C4 → C5 → B0 Draft tab
4. D1 “Write as me” → D2 → D3 (delay 3s on D2)
5. E1 from D1 when corpus insufficient (overlay)

---

## Implementation map (post sign-off)

| Frame | React target |
|-------|----------------|
| A1 | [`brands/page.tsx`](../src/app/(app)/brands/page.tsx) |
| A3 | [`brands/new`](../src/app/(app)/brands/new/page.tsx) + create form |
| B0 | [`brand-home.tsx`](../src/components/brands/brand-home.tsx) |
| C1 | [`brand-promise-panel.tsx`](../src/components/brands/brand-promise-panel.tsx) |
| C2–C5 | [`brand-your-words-panel.tsx`](../src/components/brands/brand-your-words-panel.tsx), talk panel |
| D1 | [`brand-draft-panel.tsx`](../src/components/brands/brand-draft-panel.tsx) |
| D2 | [`draft-generating-status.tsx`](../src/components/content/draft-generating-status.tsx), `GeneratePipeline` |
| D3 | [`content/[id]/page.tsx`](../src/app/(app)/content/[id]/page.tsx) |

---

## Stakeholder canvas

Open **`brand-dna-ux-frames.canvas.tsx`** in Cursor (Canvases) for a quick frame overview and prototype path before building Figma artboards.

## Changelog

| Date | Version |
|------|---------|
| 2026-09-20 | 1.0 Initial spec from Production UX plan |
| 2026-09-20 | 1.1 React implementation in `src/components/ux/` |
