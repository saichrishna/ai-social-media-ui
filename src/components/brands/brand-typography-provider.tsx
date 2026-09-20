"use client";

import type { CSSProperties, ReactNode } from "react";

import { deriveBrandTypography } from "@/lib/brands/derive-brand-typography";
import { brandFontVariableClasses } from "@/lib/brands/brand-fonts";
import type { BrandProfile } from "@/types/brand";
import { cn } from "@/lib/utils";

export function BrandTypographyProvider({
  profile,
  children,
  className,
}: {
  profile: BrandProfile;
  children: ReactNode;
  className?: string;
}) {
  const preset = deriveBrandTypography(profile);

  const style = {
    "--brand-font-heading": preset.headingVar,
    "--brand-font-body": preset.bodyVar,
  } as CSSProperties;

  return (
    <div
      data-brand-typography={preset.id}
      className={cn("brand-body flex flex-col gap-8", brandFontVariableClasses, className)}
      style={style}
    >
      {children}
    </div>
  );
}
