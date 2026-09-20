import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function UxZone({
  zone,
  className,
  children,
}: {
  zone: "editor" | "studio";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div data-zone={zone} className={cn(className)}>
      {children}
    </div>
  );
}
