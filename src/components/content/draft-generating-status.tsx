import Link from "next/link";

import { Button } from "@/components/ui/button";

type DraftGeneratingStatusProps = {
  phase: "drafting" | "still_generating" | "poll_exhausted";
};

export function DraftGeneratingStatus({ phase }: DraftGeneratingStatusProps) {
  if (phase === "drafting") {
    return (
      <div
        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Creating your draft…</p>
        <p className="text-sm text-muted-foreground">
          Grounded in your promise and Your words. Ollama and image generation
          can take several minutes — stay on this page.
        </p>
      </div>
    );
  }

  if (phase === "still_generating") {
    return (
      <div
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Still generating on the server</p>
        <p className="text-sm text-muted-foreground">
          The request timed out in the browser, but your draft may still be
          finishing in the background. We&apos;re checking for the new post every
          few seconds and will open it when it&apos;s ready.
        </p>
        <p className="text-sm text-muted-foreground">
          You can also open{" "}
          <Link href="/content" className="underline underline-offset-2">
            Content Studio
          </Link>{" "}
          — if a post appears there, open it to review caption and AI feedback.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-base font-medium">We didn&apos;t see the draft yet</p>
      <p className="text-sm text-muted-foreground">
        Generation may still be running, or it may have failed on the server.
        Check Content Studio before trying again so you don&apos;t create
        duplicates.
      </p>
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/content">Open Content Studio</Link>
      </Button>
    </div>
  );
}
