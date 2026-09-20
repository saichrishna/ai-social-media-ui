import type { BrandSetupStatus } from "@/lib/brands/brand-readiness";

export type DashboardNextAction = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function getDashboardNextAction(input: {
  brandId: string;
  brandName: string;
  setupStatus: BrandSetupStatus;
  materialCount: number;
  postsNeedingAttention: number;
  totalPosts: number;
}): DashboardNextAction {
  const brandBase = `/brands/${encodeURIComponent(input.brandId)}`;

  if (input.setupStatus === "promise_incomplete") {
    return {
      eyebrow: "Brand DNA",
      title: "Lock in who you help — and who you are not for",
      description:
        "Generic AI skips this. We use your promise before anything sounds like you.",
      href: `${brandBase}?tab=promise`,
      ctaLabel: "Finish promise",
      secondaryHref: brandBase,
      secondaryLabel: "Open brand",
    };
  }

  if (input.setupStatus === "need_your_words") {
    const remaining = Math.max(0, 3 - input.materialCount);
    return {
      eyebrow: "Expertise capture",
      title:
        remaining > 0
          ? `Add ${remaining} more piece${remaining === 1 ? "" : "s"} only you would say`
          : "Almost there — save one more answer",
      description:
        "Start with a talk session (~8 minutes). We write from your corpus, not the public internet.",
      href: `${brandBase}?tab=words&talk=1`,
      ctaLabel: "Begin talk session",
      secondaryHref: `${brandBase}?tab=words`,
      secondaryLabel: "Paste or type instead",
    };
  }

  if (input.postsNeedingAttention > 0) {
    return {
      eyebrow: "Content studio",
      title: `${input.postsNeedingAttention} post${input.postsNeedingAttention === 1 ? "" : "s"} need your review`,
      description:
        "Approve, edit, or regenerate — keep the voice yours, sharpen hook and CTA.",
      href: "/content",
      ctaLabel: "Review in library",
      secondaryHref: "/create",
      secondaryLabel: "Write another",
    };
  }

  if (input.totalPosts === 0) {
    return {
      eyebrow: "Ready to draft",
      title: `Turn ${input.brandName} into a post that sounds like you`,
      description:
        "One idea from your material. Pick the room — Instagram, LinkedIn, or Facebook.",
      href: `${brandBase}?tab=draft`,
      ctaLabel: "Open draft studio",
      secondaryHref: "/create",
      secondaryLabel: "Create from header",
    };
  }

  return {
    eyebrow: "Write as me",
    title: "What do you want to say this week?",
    description:
      "Same truth, different shape per platform — drafted from your promise and words.",
    href: "/create",
    ctaLabel: "Write as me",
    secondaryHref: `${brandBase}?tab=draft`,
    secondaryLabel: "Brand draft tab",
  };
}
