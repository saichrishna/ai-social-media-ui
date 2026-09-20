"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_COLLAPSE_AT = 320;

export function ExpandableText({
  text,
  collapseAt = DEFAULT_COLLAPSE_AT,
  className,
}: {
  text: string;
  collapseAt?: number;
  className?: string;
}) {
  const trimmed = text.trim();
  const [expanded, setExpanded] = useState(false);

  const needsCollapse = useMemo(
    () => trimmed.length > collapseAt,
    [trimmed.length, collapseAt],
  );

  if (!trimmed) {
    return <p className={cn("text-muted-foreground", className)}>—</p>;
  }

  if (!needsCollapse) {
    return (
      <p className={cn("whitespace-pre-wrap", className)}>{trimmed}</p>
    );
  }

  const preview =
    trimmed.slice(0, collapseAt).trimEnd() +
    (trimmed.length > collapseAt ? "…" : "");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="whitespace-pre-wrap">
        {expanded ? trimmed : preview}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto w-fit px-0 text-muted-foreground hover:text-foreground"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Show more"}
      </Button>
    </div>
  );
}
