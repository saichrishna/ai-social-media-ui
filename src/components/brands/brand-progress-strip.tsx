import { cn } from "cn";

const STEPS = ["Promise", "Words", "Draft"] as const;

export function BrandProgressStrip({
  activeStep,
}: {
  activeStep: (typeof STEPS)[number];
}) {
  return (
    <nav
      aria-label="Brand setup progress"
      className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
    >
      {STEPS.map((step, index) => {
        const isActive = step === activeStep;
        const stepIndex = STEPS.indexOf(activeStep);
        const isPast = stepIndex > index;
        return (
          <span key={step} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-muted-foreground/60">
                ·
              </span>
            ) : null}
            <span
              className={cn(
                isActive && "font-medium text-foreground",
                isPast && "text-foreground/80",
              )}
            >
              {step}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
