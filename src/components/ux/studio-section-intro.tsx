import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function StudioSectionIntro({
  title,
  description,
  children,
  titleClassName,
  className,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  titleClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2
        className={cn(
          "type-studio-title font-display text-2xl font-medium leading-snug md:text-3xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
