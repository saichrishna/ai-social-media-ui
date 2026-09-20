<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent-led UI development

Cursor agents in this repo write the **frontend**. They are coordinated by the **orchestrator**.

| Role | Kind | Writes code? | Git writes? |
| --- | --- | --- | --- |
| Orchestrator | Parent coordinator | No (delegates) | No |
| Architect | `.cursor/agents/architect.md` | No (read-only) | No |
| Developer | `.cursor/agents/developer.md` | Yes, after an approved plan | No |
| Debugger | `.cursor/agents/debugger.md` | Minimal diagnostic fixes only | No |
| Code reviewer | `.cursor/agents/code-reviewer.md` | No (read-only) | No |
| Git/release | `.cursor/agents/git-release.md` | No application code | Status/diff/log always; **commit only with explicit user approval** |

UX source of truth for agents: `.cursor/skills/next-gen-ux/SKILL.md`. Verified inventory: `docs/UX_DESIGN_SYSTEM_REVIEW.md`.

Next-gen bar: the system (DNA, pipeline, statuses) should be **hard to notice** and the next click should be **impossible to miss**.

## Workflow

1. Requirement (user intent)
2. Repository inspection
3. Architecture / plan (architect) — includes primary CTA and UX laws
4. Implementation (developer)
5. Tests + browser flow verification (developer)
6. Debugging if required (debugger)
7. Code review including UX regressions (code reviewer)
8. Git diff review (git/release)
9. Commit **only** after the user explicitly approves

## Orchestrator rules

- Delegate to specialists. Do not implement, review, and commit in one pass.
- Inspect relevant files before any change.
- Preserve AppShell, tokens, and Query layering unless the plan documents a change.
- Never invent API fields; emit `BACKEND CHANGE SUGGESTION` instead.
- Never push, force-push, reset, or clean without explicit user approval.
- Never inspect `.env` contents.

The FastAPI sibling is `../ai-social-media`. Do not treat its `agents/content_*.py` as Cursor roles.
