import { LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = [
  { key: "Promise", id: "promise" as const },
  { key: "Words", id: "words" as const },
  { key: "Draft", id: "draft" as const },
] as const;

export type JourneyStepId = (typeof STEPS)[number]["id"];

export function JourneyStepper({
  activeStep,
  draftLocked = false,
  className,
}: {
  activeStep: JourneyStepId;
  draftLocked?: boolean;
  className?: string;
}) {
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);

  return (
    <nav
      aria-label="Brand setup progress"
      className={cn("flex flex-wrap items-center gap-3 text-sm", className)}
    >
      {STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isPast = activeIndex > index;
        const isDraft = step.id === "draft";
        const locked = isDraft && draftLocked;

        return (
          <span key={step.id} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-6",
                  isPast || isActive ? "bg-foreground/30" : "bg-border",
                )}
              />
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                isActive && "font-medium text-foreground",
                isPast && !isActive && "text-foreground/80",
                !isActive && !isPast && "text-muted-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-2 rounded-full border",
                  isActive && "border-foreground ring-2 ring-foreground/20",
                  isPast && "border-foreground bg-foreground",
                  !isActive && !isPast && "border-muted-foreground/50",
                )}
              />
              {step.key}
              {locked ? (
                <LockIcon className="size-3.5 opacity-60" aria-hidden />
              ) : null}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function journeyStepFromStrip(
  strip: "Promise" | "Words" | "Draft",
): JourneyStepId {
  switch (strip) {
    case "Promise":
      return "promise";
    case "Words":
      return "words";
    case "Draft":
      return "draft";
  }
}
