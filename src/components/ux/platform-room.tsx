import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" },
] as const;

export function PlatformRoom({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (platform: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium">Choose the room</span>
      <p className="text-[13px] text-muted-foreground">
        Same truth. Different shape.
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Platform"
      >
        {PLATFORMS.map((platform) => {
          const selected = value === platform.id;
          return (
            <button
              key={platform.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(platform.id)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {platform.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
