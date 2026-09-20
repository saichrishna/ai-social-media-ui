import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "ground", label: "Grounding in your words" },
  { id: "write", label: "Writing as you" },
  { id: "review", label: "Reviewing for clarity" },
  { id: "image", label: "Creating image", sub: "Finishes in background" },
] as const;

export type PipelineStepId = (typeof STEPS)[number]["id"];

export function GeneratePipeline({
  activeStep = "write",
  className,
}: {
  activeStep?: PipelineStepId;
  className?: string;
}) {
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);

  return (
    <ol className={cn("flex flex-col gap-3", className)}>
      {STEPS.map((step, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <li key={step.id} className="flex items-start gap-3 text-sm">
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border",
                done && "border-foreground bg-foreground text-background",
                active &&
                  "border-transparent bg-[linear-gradient(135deg,var(--studio-accent-start),var(--studio-accent-end))] text-white studio-shimmer",
                !done && !active && "border-muted-foreground/40",
              )}
            >
              {done ? <CheckIcon className="size-3.5" /> : index + 1}
            </span>
            <div>
              <p
                className={cn(
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {"sub" in step && step.sub && active ? (
                <p className="text-xs text-muted-foreground">{step.sub}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
