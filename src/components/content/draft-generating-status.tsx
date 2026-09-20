import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  GeneratePipeline,
  type PipelineStepId,
} from "@/components/ux/generate-pipeline";

type DraftGeneratingStatusProps = {
  phase: "drafting" | "still_generating" | "poll_exhausted";
  pipelineStep?: PipelineStepId;
};

export function DraftGeneratingStatus({
  phase,
  pipelineStep = "write",
}: DraftGeneratingStatusProps) {
  if (phase === "drafting") {
    return (
      <div
        className="surface-panel mx-auto flex max-w-lg flex-col gap-4 p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Creating your draft…</p>
        <p className="text-sm text-muted-foreground">
          Grounded in your promise and Your words. This can take several
          minutes — stay on this page.
        </p>
        <GeneratePipeline activeStep={pipelineStep} />
      </div>
    );
  }

  if (phase === "still_generating") {
    return (
      <div
        className="surface-panel mx-auto flex max-w-lg flex-col gap-4 p-6"
        role="status"
        aria-live="polite"
      >
        <p className="text-base font-medium">Still generating on the server</p>
        <p className="text-sm text-muted-foreground">
          The browser gave up waiting, but your draft may still be finishing.
          We check every few seconds and open your post when it appears.
        </p>
        <GeneratePipeline activeStep="review" />
        <p className="text-sm text-muted-foreground">
          Or open{" "}
          <Link href="/content" className="underline underline-offset-2">
            Content Studio
          </Link>{" "}
          to review caption and feedback there.
        </p>
      </div>
    );
  }

  return (
    <div
      className="surface-panel mx-auto flex max-w-lg flex-col gap-3 p-6"
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
