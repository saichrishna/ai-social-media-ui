import { cn } from "@/lib/utils";

export function DevicePreview({
  platform,
  imageUrl,
  headline,
  className,
}: {
  platform?: string | null;
  imageUrl?: string | null;
  headline?: string | null;
  className?: string;
}) {
  const platformLabel =
    platform === "linkedin"
      ? "LinkedIn"
      : platform === "facebook"
        ? "Facebook"
        : "Instagram";

  return (
    <div
      className={cn(
        "shadow-panel-lg mx-auto w-full max-w-sm rounded-[2rem] border-2 border-foreground/10 bg-background p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span className="size-2 rounded-full bg-muted-foreground/40" />
        {platformLabel} preview
      </div>
      <div className="overflow-hidden rounded-2xl bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={headline || "Post preview"}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
            Image loading…
          </div>
        )}
      </div>
      {headline ? (
        <p className="brand-heading mt-2 line-clamp-2 px-1 text-sm font-medium">
          {headline}
        </p>
      ) : null}
    </div>
  );
}
