"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarIcon,
  FileTextIcon,
  LayersIcon,
  MicIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";

import { JourneyStepper } from "@/components/ux/journey-stepper";
import { Button } from "@/components/ui/button";
import { getActiveInterviewSession } from "@/lib/api/brand-dna";
import { getRecentActions } from "@/lib/activity/recent-actions";
import { getDashboardNextAction } from "@/lib/dashboard/dashboard-next-action";
import { useDashboardBrandContext } from "@/lib/dashboard/use-dashboard-brand-context";
import { useUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

function quickActionHref(key: string, brandId: string): string {
  switch (key) {
    case "talk":
      return `/brands/${brandId}?tab=words&talk=1`;
    case "mini_talk":
      return `/brands/${brandId}?tab=words&talk=mini`;
    case "promise":
      return `/brands/${brandId}?tab=promise`;
    case "draft":
      return `/brands/${brandId}?tab=draft`;
    case "content":
      return "/content";
    case "calendar":
      return "/calendar";
    case "brands":
      return "/brands";
    default:
      return "/";
  }
}

const QUICK_ACTIONS = [
  {
    key: "talk",
    label: "Talk session",
    description: "Full-screen capture, ~8 min",
    icon: MicIcon,
    accent: true,
  },
  {
    key: "promise",
    label: "Promise",
    description: "Who you help & refuse",
    icon: TargetIcon,
  },
  {
    key: "draft",
    label: "Draft studio",
    description: "Write as me",
    icon: SparklesIcon,
    requiresDraft: true,
  },
  {
    key: "content",
    label: "Content library",
    description: "Review & schedule",
    icon: FileTextIcon,
  },
  {
    key: "calendar",
    label: "Calendar",
    description: "Scheduled posts",
    icon: CalendarIcon,
  },
  {
    key: "brands",
    label: "All brands",
    description: "Switch or add",
    icon: LayersIcon,
  },
] as const;

function visibleQuickActions(draftReady: boolean) {
  if (draftReady) {
    const withoutTalk = QUICK_ACTIONS.filter((item) => item.key !== "talk");
    return [
      {
        key: "mini_talk" as const,
        label: "Mini talk",
        description: "Random thought, ~2 min",
        icon: MicIcon,
        accent: false,
      },
      ...withoutTalk,
      {
        key: "talk" as const,
        label: "Full sitting",
        description: "Deep capture, ~8 min",
        icon: MicIcon,
        accent: false,
      },
    ];
  }
  return [...QUICK_ACTIONS];
}

export function DashboardCommandCenter({
  postsNeedingAttention,
  totalPosts,
}: {
  postsNeedingAttention: number;
  totalPosts: number;
}) {
  const userId = useUserId();
  const ctx = useDashboardBrandContext();
  const recent = getRecentActions(3);

  const activeTalkQuery = useQuery({
    queryKey: ["active-interview", ctx.profileId, userId],
    queryFn: () => getActiveInterviewSession(ctx.profileId!, userId!),
    enabled: Boolean(userId && ctx.profileId),
  });

  if (!ctx.selectedBrand || !ctx.profileId || !ctx.setupStatus) {
    return null;
  }

  const brand = ctx.selectedBrand;
  const brandId = ctx.profileId;
  const continueStudioHref =
    recent.find((item) => item.kind === "content_studio")?.href ?? null;
  const hasActiveTalkSession = Boolean(
    activeTalkQuery.data?.interview_session,
  );

  const action = getDashboardNextAction({
    brandId,
    brandName: brand.business_name,
    setupStatus: ctx.setupStatus,
    materialCount: ctx.materialCount,
    postsNeedingAttention,
    totalPosts,
    continueStudioHref,
    hasActiveTalkSession,
  });

  const quickActions = visibleQuickActions(ctx.draftReady);

  const materialPct = Math.min(
    100,
    Math.round((ctx.materialCount / ctx.materialTarget) * 100),
  );
  const wordsComplete = ctx.materialCount >= ctx.materialTarget;

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label="Next best action"
        className="surface-panel overflow-hidden p-0 ring-0"
      >
        <div className="grid gap-0 lg:grid-cols-[1fr_minmax(240px,320px)]">
          <div className="flex flex-col gap-4 p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {action.eyebrow}
            </p>
            <h2 className="font-display text-2xl font-medium leading-snug md:text-3xl">
              {action.title}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              {action.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="studio" size="lg">
                <Link href={action.href}>{action.ctaLabel}</Link>
              </Button>
              {action.secondaryHref && action.secondaryLabel ? (
                <Button asChild variant="outline" size="lg">
                  <Link href={action.secondaryHref}>{action.secondaryLabel}</Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 border-t border-[color:var(--zone-studio-border)] bg-[color-mix(in_oklch,var(--app-canvas-base),white_8%)] p-6 lg:border-t-0 lg:border-l">
            <div>
              <p className="text-sm font-medium">{brand.business_name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ctx.readinessLoading ? "Updating…" : ctx.setupLabel}
              </p>
              {ctx.typography ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Voice surface:{" "}
                  <span className="text-foreground/80">
                    {ctx.typography.label}
                  </span>
                </p>
              ) : null}
            </div>
            <JourneyStepper
              activeStep={ctx.journeyActive}
              draftLocked={!ctx.draftReady}
              className="flex-col items-start gap-2 sm:flex-row sm:items-center"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-label="Your words corpus"
          className="surface-panel flex flex-col gap-4 p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="type-section text-base">Expertise corpus</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pastes + interview answers we draft from — not generic prompts.
              </p>
            </div>
            <span className="text-2xl font-semibold tabular-nums">
              {ctx.materialCount}
              <span className="text-sm font-normal text-muted-foreground">
                /{ctx.materialTarget}+
              </span>
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={ctx.materialCount}
            aria-valuemin={0}
            aria-valuemax={ctx.materialTarget}
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                wordsComplete
                  ? "bg-[linear-gradient(90deg,var(--studio-accent-start),var(--studio-accent-end))]"
                  : "bg-foreground/25",
              )}
              style={{ width: `${materialPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {wordsComplete
              ? "Corpus is strong enough to draft in your voice."
              : "Talk session is the fastest path — you control when each answer saves."}
          </p>
          <Button asChild variant="secondary" size="sm" className="w-fit">
            <Link href={`/brands/${brandId}?tab=words`}>
              {wordsComplete ? "Add more material" : "Go to your words"}
            </Link>
          </Button>
        </section>

        <section
          aria-label="Channel placement"
          className="surface-panel flex flex-col gap-3 p-5"
        >
          <h3 className="type-section text-base">Channel placement</h3>
          <p className="text-sm text-muted-foreground">
            Same insight, different room. We shape posts for Instagram, LinkedIn,
            or Facebook — not 27 copies of one bland caption.
          </p>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="surface-panel px-3 py-2 ring-0">
              <span className="font-medium">Instagram</span>
              <span className="text-muted-foreground">
                {" "}
                — visual hook, short truth
              </span>
            </li>
            <li className="surface-panel px-3 py-2 ring-0">
              <span className="font-medium">LinkedIn</span>
              <span className="text-muted-foreground">
                {" "}
                — POV and credibility
              </span>
            </li>
            <li className="surface-panel px-3 py-2 ring-0">
              <span className="font-medium">Facebook</span>
              <span className="text-muted-foreground">
                {" "}
                — community tone
              </span>
            </li>
          </ul>
          {ctx.draftReady ? (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/create">Pick a room & write</Link>
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              Finish promise and corpus to unlock draft.
            </p>
          )}
        </section>
      </div>

      {recent.length > 0 ? (
        <section aria-label="Recent" className="flex flex-col gap-3">
          <h3 className="type-section text-base">Recent</h3>
          <ul className="grid gap-2 sm:grid-cols-3">
            {recent.map((item) => (
              <li key={`${item.kind}-${item.href}`}>
                <Link
                  href={item.href}
                  className="surface-panel block p-4 text-sm ring-0 transition-[box-shadow,transform] hover:shadow-[var(--shadow-panel-hover)]"
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="More actions" className="flex flex-col gap-3">
        <h3 className="type-section text-base">More</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((item) => {
            const href = quickActionHref(item.key, brandId);
            const Icon = item.icon;
            const disabled =
              "requiresDraft" in item && item.requiresDraft && !ctx.draftReady;
            const isMini = item.key === "mini_talk";
            return (
              <li key={item.key}>
                {disabled ? (
                  <div className="surface-panel flex h-full flex-col gap-2 p-4 opacity-60">
                    <Icon className="size-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      Unlock after your words
                    </span>
                  </div>
                ) : (
                  <Link
                    href={href}
                    className={cn(
                      "surface-panel flex h-full flex-col gap-2 p-4 ring-0 transition-[box-shadow,transform] hover:shadow-[var(--shadow-panel-hover)]",
                      (item.key === "talk" || isMini) &&
                        !ctx.draftReady &&
                        "border-[color-mix(in_oklch,var(--studio-accent-start),transparent_55%)]",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        item.key === "talk" && !ctx.draftReady
                          ? "text-[color:var(--studio-accent-start)]"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
