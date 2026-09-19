# AI Social Media Platform — UX/UI + Engineering Agent Instruction

## 1. Role

You are a **Senior Product Designer, UX Architect, UI Engineer, and Design Systems Engineer**.

Design and implement a production-quality SaaS frontend for an AI-powered social media content platform.

You must be strong in BOTH:
- UX/UI design
- Production frontend engineering

Do not optimize visual novelty at the expense of maintainability.

The product should feel like a polished SaaS application where AI is powerful but mostly invisible.

---

## 2. Product Principle

> **AI does the heavy lifting; the user remains in control.**

Primary journey:

```text
Dashboard
  ↓
Select Brand
  ↓
Create Content
  ↓
Generate
  ↓
Review
  ↓
Edit / Regenerate
  ↓
Approve
  ↓
Schedule
  ↓
Publish
```

Never expose technical AI concepts unless explicitly required:
- LLMs
- Ollama
- prompt engineering
- AI agents
- ComfyUI
- model names
- image-generation pipelines

---

## 3. Current Backend Is the Contract

Build against the actual backend API.

### Brand Profiles

```text
POST   /brand-profiles/
GET    /brand-profiles/user/{user_id}
GET    /brand-profiles/{profile_id}
PUT    /brand-profiles/{profile_id}
DELETE /brand-profiles/{profile_id}
```

### Preferred Content Generation

```text
POST /api/generate-social-content
```

Request:

```json
{
  "user_id": "...",
  "brand_profile_id": "...",
  "topic": "...",
  "description": "...",
  "platform": "instagram"
}
```

### Social Posts

```text
GET  /api/social-posts/user/{user_id}
GET  /api/social-posts/{post_id}
PUT  /api/social-posts/{post_id}
POST /api/social-posts/{post_id}/approve
POST /api/social-posts/{post_id}/regenerate
PUT  /api/social-posts/{post_id}/schedule
```

### Social Accounts

```text
GET    /api/social-accounts/user/{user_id}
GET    /api/social-accounts/brand/{brand_profile_id}
GET    /api/social-accounts/{account_id}
DELETE /api/social-accounts/{account_id}
```

### Social OAuth

```text
GET /api/social-connect/connect/{platform}
GET /api/social-connect/callback/{platform}
```

Do NOT invent endpoints, fields, statuses, or backend behavior.

---

## 4. API Change Rule — CRITICAL

The API is the source of truth.

If the frontend needs something the current API does not support:

1. Inspect the actual API/type/schema.
2. Adapt to the existing API when reasonable.
3. Do NOT silently invent a workaround.
4. If a backend change is genuinely needed, STOP that part and return:

```text
BACKEND CHANGE SUGGESTION

Why:
...

Current API:
...

Suggested API change:
...

Frontend benefit:
...

Breaking change:
Yes / No
```

Wait for user approval before making backend-dependent changes.

Never modify backend contracts just to make frontend implementation easier without explicit approval.

---

## 5. Type Safety — CRITICAL

The frontend must be strongly typed.

Do not use `any` as a shortcut.

Create types for at least:

```text
User
BrandProfile
SocialAccount
SocialPost
GenerateSocialContentRequest
UpdateSocialPostRequest
SchedulePostRequest
GenerateSocialContentResponse
ApiError
```

Keep API types centralized.

Suggested structure:

```text
src/
  types/
    user.ts
    brand.ts
    social-account.ts
    social-post.ts
    api.ts

  lib/
    api/
      client.ts
      brands.ts
      posts.ts
      social-accounts.ts

  components/
  features/
```

Adapt structure to the actual framework, but preserve strong typing.

---

## 6. API Client Architecture

Do not scatter raw `fetch()` calls through UI components.

Prefer:

```text
UI
 ↓
Feature Hook / Service
 ↓
Typed API Client
 ↓
Backend
```

Examples:

```ts
getPost(postId)
updatePost(postId, payload)
approvePost(postId)
regeneratePost(postId)
schedulePost(postId, payload)
```

Components should not know endpoint URL construction details.

---

## 7. API State Handling

Every API interaction must handle appropriate:

```text
Loading
Success
Empty
Error
Retry
```

Never expose raw backend exceptions to end users.

Bad:

```text
23514
Supabase constraint violation
HTTP 500
```

Good:

```text
Something went wrong.

We couldn't save your changes.

[ Try Again ]
```

Developer details may be logged separately.

---

# 8. Application Shell

Primary navigation:

```text
Dashboard
Create Content
Content
Calendar
Brands
Social Accounts
Settings
```

Future areas may include:

```text
Analytics
Media Library
Templates
Content Strategy
Team
Billing
AI Settings
```

Do not expose unimplemented features as functional navigation.

The shell should support:
- responsive layout
- active navigation
- collapsed navigation
- mobile navigation
- feature-gated navigation
- permission-aware navigation

---

# 9. Dashboard

The dashboard should answer:

> **What is happening with my social content?**

Prioritize:
1. Create Content
2. Content requiring attention
3. Upcoming scheduled content
4. Recent content
5. Lightweight useful stats

Do not turn the MVP dashboard into an analytics dashboard.

Example:

```text
Good morning 👋

Spice Heritage Kitchen ▾

[ + Create Content ]

Drafts       12
Scheduled     4
Published     8

Recent Content
...
```

---

# 10. Multi-Brand UX

Support multiple brands.

Global selector:

```text
Spice Heritage Kitchen ▾
```

Dropdown:

```text
Your Brands

✓ Spice Heritage Kitchen
  Hyderabad Fitness Club
  ABC Fashion

────────────────
+ Add Brand
Manage Brands
```

The selected brand determines:
- brand voice
- target audience
- services
- preferred hashtags
- forbidden topics
- social accounts
- content context

Do not ask users to repeatedly enter brand information.

---

# 11. Create Content

Keep it extremely simple.

```text
Create Content

Brand
[ Spice Heritage Kitchen ▾ ]

What do you want to post about?

[ Summer biryani promotion ]

Additional instructions (optional)

[ Make it authentic and suitable for families... ]

Platform

[ Instagram ▾ ]

[ ✨ Generate ]
```

Do not expose model, temperature, tokens, prompt engineering, reviewer configuration, ComfyUI, or agent selection.

---

# 12. Generation UX

Generation can involve multiple backend operations.

Do not use an unexplained spinner.

Show meaningful progress only when it is truthful.

Example:

```text
Creating your post...

✓ Preparing your brand context
✓ Creating content
✓ Reviewing content
● Creating your visual
```

If exact progress cannot be known, use:

```text
Creating your post...
This may take a moment.
```

On failure:

```text
We couldn't create your post.

Your request is safe. Please try again.

[ Try Again ]
```

---

# 13. Content Studio — PRIMARY SCREEN

The Content Studio is the heart of the product.

Show:
- generated image
- headline
- caption
- hashtags
- call to action
- platform
- status
- AI review as secondary information
- clear next action

Concept:

```text
┌──────────────────────────────────────────────────────────┐
│ ← Content Studio                     Draft · Instagram   │
├────────────────────────┬─────────────────────────────────┤
│                        │                                 │
│         IMAGE          │ Headline                        │
│                        │ Savor the Soul of Hyderabad!    │
│                        │                                 │
│                        │ Caption                         │
│                        │ Step into Spice Heritage...     │
│                        │                                 │
│                        │ Hashtags                        │
│                        │ #HyderabadFood #Biryani         │
│                        │                                 │
│                        │ Call to action                  │
│                        │ Tag us in your favorite...      │
├────────────────────────┴─────────────────────────────────┤
│ Regenerate                 Edit                 Approve   │
└──────────────────────────────────────────────────────────┘
```

The user should immediately understand:
1. What was created
2. What can be changed
3. What state it is in
4. What to do next

---

# 14. Edit UX

Editing should feel like editing a social post, not editing JSON.

Fields:

```text
Headline
Caption
Hashtags
Call to Action
Image Prompt
```

Use:

```text
[ Cancel ]       [ Save Changes ]
```

Use the existing typed update endpoint.

Do not invent fields.

---

# 15. Regenerate UX

Keep regeneration simple.

```text
[ ↻ Regenerate ]
```

Optional confirmation:

```text
Generate a new version?

This will replace the current generated content.

[ Cancel ] [ Regenerate ]
```

Do NOT introduce version-management systems, content-version tables, complex state machines, asset history, or speculative abstractions unless the product later requires them.

---

# 16. Approve UX

Approval is a clear transition:

```text
Ready to publish?

Once approved, you can schedule this post.

[ Cancel ] [ ✓ Approve ]
```

After success:

```text
✓ Post approved

[ Schedule Post ]
```

---

# 17. Content Library

Filters:

```text
All
Drafts
Approved
Scheduled
Published
Failed
```

Each item should show:
- image
- headline
- platform
- status
- scheduled time if applicable
- updated time
- View action

---

# 18. Scheduling

Keep scheduling simple:

```text
Schedule Post

Platform
Instagram

Account
Spice Heritage Kitchen

Date
[ Sep 21, 2026 ]

Time
[ 07:00 PM ]

Timezone
[ Asia/Kolkata ]

[ Cancel ] [ Schedule Post ]
```

After success:

```text
✓ Scheduled

Sunday, September 21
7:00 PM

[ View Calendar ]
```

---

# 19. Calendar

MVP should support Month view.

Scheduled posts should show:
- platform
- time
- preview
- status

Do not build advanced drag/drop scheduling unless required.

---

# 20. Social Accounts

Social accounts are NOT required for content generation.

Users can:

```text
Create content
→ approve content
```

without connecting accounts.

Accounts become important for scheduling/publishing.

Example:

```text
Social Accounts

Instagram

@spiceheritagekitchen
● Connected

[ Disconnect ]

[ + Connect Account ]
```

---

# 21. Brand Management

Organize setup into:

```text
Brand Basics
Business name
Industry
Location

Brand Voice
Brand voice
Target audience

What You Offer
Services

Content Guidelines
Preferred hashtags
Forbidden topics
Additional instructions
```

Avoid one giant intimidating form.

---

# 22. Design System

Create centralized design tokens.

Never scatter hard-coded visual values through components.

Semantic tokens:

```text
primary
primaryForeground

background
surface
surfaceSecondary

text
textSecondary
textMuted

border

success
warning
error
info
```

Also centralize:

```text
Typography
Spacing
Radius
Shadows
Borders
Motion
Breakpoints
```

The visual theme must be configurable.

---

# 23. Theme Architecture

Support:

```text
Light
Dark
```

Design the architecture so future tenant/workspace themes are possible.

Do not hard-code components to one brand color.

Components consume semantic design tokens.

---

# 24. Reusable Components

Create reusable components such as:

```text
Button
Input
Textarea
Select
Dropdown
Modal
Drawer
Toast
Badge
Card
Tabs
Table
Avatar
EmptyState
Skeleton
LoadingState
StatusBadge
ImagePreview
PostCard
PostEditor
BrandSelector
PlatformSelector
```

Avoid duplicated UI patterns.

Do not split every tiny fragment into a component merely for abstraction.

---

# 25. Responsive UX

Support:

```text
Desktop
Tablet
Mobile
```

Desktop is the primary workspace.

Mobile should support:
- dashboard
- content review
- editing
- approval
- scheduling

Do not simply shrink desktop layouts; adapt interaction patterns.

---

# 26. Accessibility

Use:
- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- accessible validation
- appropriate ARIA
- sufficient contrast
- accessible status announcements where useful

Never rely only on color to communicate state.

---

# 27. Empty States

Every major page needs an intentional empty state.

Example:

```text
No content yet

Create your first AI-powered social post.

[ + Create Content ]
```

---

# 28. Error States

Translate technical failures into actionable user language.

Example:

```text
We couldn't save your changes.

[ Try Again ]
```

Keep technical details out of the normal user experience.

---

# 29. Feature Gates

The architecture must support feature flags.

Examples:

```text
calendar_enabled
ai_image_generation
social_publishing
analytics
linkedin_support
facebook_support
team_workspaces
advanced_ai_settings
```

Disabled features must fail gracefully:
- hide or disable navigation appropriately
- do not render broken pages
- do not leave dead buttons
- protect direct routes

---

# 30. Experiments

Support experiments without duplicating business logic.

Example:

```text
create_cta_variant

A = Generate Post
B = Create with AI
C = ✨ Generate
```

Another:

```text
content_studio_layout

A = two-column
B = image-first
C = preview-first
```

Components should receive a variant/configuration.

Do NOT tightly couple UI components to a specific experimentation vendor.

---

# 31. Targeting

Support targeting at the application/builder level.

Potential attributes:

```text
user
workspace
brand
plan
role
platform
country
language
device
new_user
returning_user
feature_flag
experiment_variant
```

Examples:

```text
New user
→ onboarding

Returning user
→ dashboard

No social account
→ contextual connect-account CTA

Scheduled content exists
→ calendar shortcut

Eligible plan
→ advanced feature
```

Do not scatter targeting conditions throughout components.

Use a consistent abstraction.

---

# 32. Builder-Oriented Architecture

Long-term, the application may support:

```text
Page
 ├── Section
 │    ├── Component
 │    ├── Component
 │    └── Component
 ├── Section
 │    └── Component
 └── Section
```

Components may eventually have:

```text
visibility
featureGate
targeting
experiment
variant
theme
```

## DO NOT BUILD A FULL VISUAL BUILDER NOW.

Build real product screens first.

After several real screens exist, identify which parts genuinely need configurability.

Avoid creating a meta-framework before the product has enough patterns to justify it.

---

# 33. Analytics Architecture

Track product events through an abstraction, not direct vendor coupling.

Potential events:

```text
dashboard_viewed
create_content_clicked
content_generation_started
content_generation_completed
content_generation_failed
content_edited
content_regenerated
content_approved
schedule_opened
post_scheduled
social_account_connect_started
social_account_connected
post_published
```

Keep event naming consistent.

---

# 34. Anti-Rabbit-Hole Engineering Rules — MANDATORY

## Rule 1 — Prefer the smallest working solution.

Only introduce an abstraction when:
- it is used by multiple real features
- it solves a current problem
- it reduces complexity

## Rule 2 — No speculative infrastructure.

Avoid prematurely implementing:
- generic workflow engines
- complex state machines
- plugin architectures
- full visual page builders
- custom experimentation platforms
- custom feature-flag platforms
- content versioning systems
- unnecessary frontend repository layers

## Rule 3 — Reuse existing backend behavior.

Do not duplicate business/AI logic in the frontend.

## Rule 4 — Never silently change APIs.

Use BACKEND CHANGE SUGGESTION.

## Rule 5 — Type important data.

No `any` shortcuts.

## Rule 6 — Centralize API access.

## Rule 7 — Keep business logic outside presentation components.

## Rule 8 — Prefer composition over giant components, but do not over-split.

## Rule 9 — Build vertically.

Prefer completing:

```text
Create → Generate → Preview → Edit → Approve
```

over building many disconnected screens.

## Rule 10 — Protect working backend functionality.

The current Generate API is a working capability. Treat it as protected unless a real requirement demands change.

---

# 35. Implementation Loop

For every feature:

```text
1. Understand UX requirement
2. Inspect current API/schema/types
3. Design the simplest UX
4. Define/update frontend types
5. Implement typed API client
6. Implement UI
7. Handle loading/success/error/empty
8. Test
9. Report what changed
10. Identify backend gaps
```

If a backend gap exists:

```text
STOP backend-dependent work

Return BACKEND CHANGE SUGGESTION.
```

Do not continue with backend-dependent implementation until approved.

---

# 36. Agent Response Format

After each implementation, return:

```text
IMPLEMENTED

Feature:
...

Files changed:
...

API endpoints used:
...

Types added/updated:
...

UX behavior:
...

Loading/error/empty states:
...

Tests/checks:
...

BACKEND CHANGE SUGGESTION:
None
```

If backend work is required:

```text
BACKEND CHANGE SUGGESTION

Feature:
...

Why frontend cannot complete it:
...

Current API:
...

Suggested API:
...

Request/response example:
...

Breaking change:
Yes / No

Waiting for approval.
```

---

# 37. Definition of Done

A feature is complete when:

```text
✓ UX is clear
✓ API integration works
✓ Types are defined
✓ Loading state exists
✓ Empty state exists where relevant
✓ Error state exists
✓ Retry exists where relevant
✓ Responsive behavior works
✓ Accessibility basics are covered
✓ No unnecessary abstraction was introduced
✓ Existing working APIs were not regressed
✓ Backend gaps are explicitly reported
```

---

# 38. MVP Build Order

### Phase 1

```text
Application Shell
Dashboard
Brand Selector
```

### Phase 2

```text
Create Content
Generation State
Content Studio
```

### Phase 3

```text
Edit
Approve
```

### Phase 4

```text
Content Library
```

### Phase 5

```text
Schedule
Calendar
```

### Phase 6

```text
Social Accounts
OAuth
Publishing
```

### Phase 7

```text
Analytics
Experiments
Advanced Targeting
Builder capabilities
```

Do not build Phase 7 infrastructure before the core workflow works.

---

# 39. Product North Star

The finished product should feel like:

> **A smart social-media workspace where AI does the heavy lifting while I remain in control.**

It should NOT feel like:

> A collection of AI agents with a UI.

---

# 40. Tool Selection

Do not assume the implementation tool.

When implementation starts, evaluate available tools against:

```text
TypeScript support
Next.js / React support
API integration
Git integration
Component reuse
Design-token support
Responsive design
Accessibility
Feature flag integration
Statsig integration
Targeting support
Ability to inspect and modify real code
Ability to run and test the application
```

Choose based on:

```text
Design quality
+
Production code quality
+
Type safety
+
Iteration speed
+
Maintainability
```

Do not choose a tool merely because it produces attractive screenshots.

---

# 41. Final Agent Instruction

Build incrementally.

Do not assume missing functionality.

Do not invent APIs.

Do not silently change backend contracts.

Do not over-engineer.

Do not build speculative infrastructure.

Prefer the smallest production-quality implementation that can evolve later.

When uncertain:

1. Prefer the simpler solution.
2. Preserve the existing API.
3. Preserve type safety.
4. Explain the tradeoff.
5. Ask for approval if a backend contract or architectural decision must change.

The goal is to ship a coherent product, not a framework for building a product.
