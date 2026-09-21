"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";

export function TellUsSomethingLink() {
  const { selectedBrandProfileId, brands } = useBrandSelection();

  if (!selectedBrandProfileId || brands.length === 0) {
    return null;
  }

  return (
    <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
      <Link
        href={`/brands/${encodeURIComponent(selectedBrandProfileId)}?tab=words&talk=mini`}
      >
        Tell us something
      </Link>
    </Button>
  );
}
