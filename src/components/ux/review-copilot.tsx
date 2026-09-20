import type { ReviewDisplay } from "@/lib/content/review-display";
import { cn } from "@/lib/utils";

export function ReviewCopilot({
  review,
  className,
}: {
  review: ReviewDisplay;
  className?: string;
}) {
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
      {review.issues.length > 0 ? (
        <div>
          <p className="font-medium text-foreground">Issues</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {review.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {review.suggestions.length > 0 ? (
        <div>
          <p className="font-medium text-foreground">Suggestions</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
            {review.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
