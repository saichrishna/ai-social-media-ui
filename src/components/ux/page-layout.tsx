import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const WIDTH_CLASS = {
  narrow: "max-w-lg",
  editor: "max-w-2xl",
  studio: "max-w-6xl",
  full: "max-w-none w-full",
} as const;

export type PageLayoutWidth = keyof typeof WIDTH_CLASS;

export function PageLayout({
  width = "full",
  className,
  children,
}: {
  width?: PageLayoutWidth;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-8",
        WIDTH_CLASS[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
