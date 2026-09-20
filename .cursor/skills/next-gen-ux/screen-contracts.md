# Screen contracts (user intent, not database)

Implement against **what the human is trying to do**. Hide the system noun.

| Route | User thinks | Primary CTA | Must not feel like |
| --- | --- | --- | --- |
| `/` | What should I do in the next minute? | The computed next step (talk / finish DNA / Write as me / review drafts) | An analytics dashboard or a second brand picker |
| `/create` | I said a topic; write as me | Write as me | A prompt playground |
| `/content` | Find this post | Write as me (header) + open a card | An admin table you must learn |
| `/content/[id]` | Is this me? Approve or fix | Approve (draft) or Schedule (approved) or Edit | A CMS with 12 equal buttons |
| `/calendar` | When does this go out? | Open the post | A scheduling power-user suite (until P3) |
| `/brands` | Which voice is this? | New brand | A setup wizard dump |
| `/brands/new` | Start as me (talk first) | Start with talk | A long CRM form |
| `/brands/[id]` | Capture who I am (promise → words → draft) | Tab-local save / talk / draft | Settings |
| `/accounts` | Connect later if we can | Connect only if flag is on | A broken product |
| `/settings` | Theme + who is signed in | Theme toggle | A fake account admin |

## Shell

- Desktop: left nav + header brand identity. Collapse persists (`nav_collapsed`).
- Mobile: Sheet nav; header menu + brand.
- Content width: `max-w-7xl` in shell padding `p-4 md:p-6`.
- Loading: keep nav; skeleton the **page** region to resemble PageHeader + panels.

## Create → Studio continuity

After generate: land on `/content/[id]` with preview already the hero. Do not toast “generated successfully” as if the job is done — the job is **approve**.

## Content Studio columns (xl)

1. Device preview (the post as the world sees it)
2. Words (headline, caption, hashtags, CTA) — collapse long caption
3. Review (issues, not “AI”) — collapsible when long; hide while editing if it fights the form

## Filters

Content library status filter must sync to `?status=` so back/share works. Treat pills as the same control, not a second nav.

## Tokens (use existing names)

Canvas `.app-canvas`. Panels `--surface-panel`, `--shadow-panel`. Studio gradient only on journey CTAs. Display: Instrument Serif page titles. UI: Geist. Do not reintroduce Inter as app chrome. Do not split editor/studio into different page backgrounds.
