"use client";

import { BrandSelector } from "@/components/brands/brand-selector";
import { cn } from "@/lib/utils";

export function BrandSelectorBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("surface-panel w-fit px-3 py-2 ring-0", className)}
    >
      <BrandSelector />
    </div>
  );
}
