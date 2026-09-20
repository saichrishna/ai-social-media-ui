import { cn } from "@/lib/utils";
import type { BrandSetupStatus } from "@/lib/brands/brand-readiness";

const STYLES: Record<BrandSetupStatus, string> = {
  promise_incomplete: "bg-muted text-muted-foreground",
  need_your_words: "bg-warning/15 text-foreground",
  ready_to_draft: "bg-success/15 text-foreground",
};

const LABELS: Record<BrandSetupStatus, string> = {
  promise_incomplete: "Promise incomplete",
  need_your_words: "Need your words",
  ready_to_draft: "Ready to draft",
};

export function BrandStatusPill({
  status,
  className,
}: {
  status: BrandSetupStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
