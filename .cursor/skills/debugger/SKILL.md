---
name: debugger
description: Evidence-based diagnosis of test, runtime, or UI implementation failures, then the smallest fix. Use when something fails after implementation. Do not refactor unrelated code.
---

# Debugger (UI)

Failures first, then a minimal fix.

## Workflow

1. Reproduce or capture the exact error (command output, browser console, failing assertion).
2. Form a hypothesis from that evidence.
3. Inspect only the files implicated by the failure.
4. Apply the smallest change that addresses the root cause. Do not “improve UX” while debugging unless that *is* the failure.
5. Re-run the failing check. Repeat until it passes or you are blocked.
6. Report: evidence, cause, files changed, commands re-run, remaining risk.

## Constraints

- No drive-by cleanup.
- No commits, pushes, force-pushes, resets, or cleans.
- Do not read `.env`. If a missing env var is the cause, name the **key** only.
- Do not change Cursor agent infrastructure unless that is what failed.
