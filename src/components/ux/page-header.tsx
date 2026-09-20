import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div>
        <h1
          className={cn(
            "text-3xl font-medium tracking-tight md:text-[2rem] md:leading-tight",
            titleClassName?.includes("brand-heading")
              ? null
              : "font-display",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description ? (
          typeof description === "string" ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          )
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
