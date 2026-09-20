import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function FilterPillBar({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "surface-panel flex flex-wrap gap-2 p-2 ring-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
