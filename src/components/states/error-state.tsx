import { Button } from "@/components/ui/button";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function ErrorState({
  message = USER_SAFE_ERROR_MESSAGE,
  description,
  onRetry,
  className,
}: {
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-6",
        className,
      )}
    >
      <p className="text-sm">{message}</p>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
