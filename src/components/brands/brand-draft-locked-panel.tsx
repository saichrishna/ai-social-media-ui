"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StudioSectionIntro } from "@/components/ux/studio-section-intro";

export function BrandDraftLockedPanel({ profileId }: { profileId: string }) {
  const base = `/brands/${encodeURIComponent(profileId)}`;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <StudioSectionIntro
          title="Draft unlocks when we know you"
          description="Generic AI starts from a blank prompt. We start from your promise and at least three pieces only you would say."
        />
        <div className="surface-panel flex flex-col gap-3 p-5 ring-0">
          <p className="text-sm font-medium">To unlock Draft</p>
          <ol className="list-decimal space-y-2 pl-4 text-sm text-muted-foreground">
            <li>Complete Promise — who you help and who you are not for</li>
            <li>Add three pastes or talk answers under Your words</li>
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="studio">
          <Link href={`${base}?tab=words&talk=1`}>Begin talk session</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`${base}?tab=promise`}>Finish promise</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`${base}?tab=words`}>Your words</Link>
        </Button>
      </div>
    </div>
  );
}
