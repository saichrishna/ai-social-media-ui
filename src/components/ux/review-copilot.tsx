"use client";

import type { ReviewDisplay } from "@/lib/content/review-display";
import { cn } from "@/lib/utils";

function ReviewListSection({
  title,
  items,
  defaultOpen,
}: {
  title: string;
  items: string[];
  defaultOpen: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  if (items.length <= 3) {
    return (
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <details className="group" open={defaultOpen}>
      <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="text-xs transition-transform group-open:rotate-90"
          >
            ▸
          </span>
          {title} ({items.length})
        </span>
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </details>
  );
}

export function ReviewCopilot({
  review,
  className,
}: {
  review: ReviewDisplay;
  className?: string;
}) {
  const longList =
    review.issues.length > 3 || review.suggestions.length > 3;

  return (
    <section
      className={cn(
        "surface-panel flex flex-col gap-3 p-5 text-sm",
        className,
      )}
      aria-label="Review feedback"
    >
      <h2 className="text-base font-semibold text-foreground">Review</h2>
      {review.approved !== undefined ? (
        <p className="text-muted-foreground">
          {review.approved
            ? "Approved — ready for your edits or schedule."
            : "Needs a pass — see notes below."}
        </p>
      ) : null}
      {review.reason ? (
        <p className="leading-relaxed text-foreground/90">{review.reason}</p>
      ) : null}
      <ReviewListSection
        title="Issues"
        items={review.issues}
        defaultOpen={!longList}
      />
      <ReviewListSection
        title="Suggestions"
        items={review.suggestions}
        defaultOpen={!longList && review.issues.length <= 3}
      />
    </section>
  );
}
