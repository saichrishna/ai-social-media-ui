"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { DashboardCommandCenter } from "@/components/dashboard/dashboard-command-center";
import { StatusBadge } from "@/components/content/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { SectionHeader } from "@/components/ux/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SURFACE_PANEL_CARD } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";
import { getUserSocialPosts } from "@/lib/api/posts";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUser, useUserId } from "@/lib/auth";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import { filterPostsByBrandProfileId } from "@/lib/posts/filter-by-brand";
import {
  countPostsByStatus,
  DASHBOARD_STATUSES,
  postsNeedingAttention,
  upcomingScheduledPosts,
} from "@/lib/posts/status-counts";

function greetingForNow(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const user = useUser();
  const userId = useUserId();
  const { selectedBrandProfileId, brands, isLoading: brandsLoading } =
    useBrandSelection();

  const postsQuery = useQuery({
    queryKey: ["social-posts", userId],
    queryFn: () => getUserSocialPosts(userId!),
    enabled: Boolean(userId),
  });

  if (!userId) {
    return null;
  }

  const allPosts = postsQuery.data?.data ?? [];
  const posts = filterPostsByBrandProfileId(allPosts, selectedBrandProfileId);
  const counts = countPostsByStatus(posts);
  const attention = postsNeedingAttention(posts);
  const upcoming = upcomingScheduledPosts(posts);
  const recent = posts.slice(0, 10);
  const hasBrands = brands.length > 0;

  return (
    <PageLayout width="full">
      <PageHeader
        title={`${greetingForNow(new Date())}${user?.name ? ` ${user.name}` : ""}`}
        description="Your expertise loop — capture what only you know, then draft for the right room."
        actions={
          <Button asChild variant="studio">
            <Link href="/create">Write as me</Link>
          </Button>
        }
      />

      {postsQuery.isLoading || brandsLoading ? (
        <LoadingState label="Loading dashboard" />
      ) : postsQuery.isError ? (
        <ErrorState
          message={USER_SAFE_ERROR_MESSAGE}
          onRetry={() => {
            void postsQuery.refetch();
          }}
        />
      ) : !hasBrands ? (
        <EmptyState
          title="No brands yet"
          description="Add a brand to start the promise → your words → draft journey."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      ) : (
        <DashboardCommandCenter
          postsNeedingAttention={attention.length}
          totalPosts={posts.length}
        />
      )}

      {hasBrands && posts.length === 0 ? (
        <section className="surface-panel flex flex-col gap-3 p-6 text-center md:text-left">
          <h3 className="type-section text-base">No posts for this brand yet</h3>
          <p className="text-sm text-muted-foreground">
            When your corpus is ready, draft from the studio — we generate from
            your material, not a blank prompt.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            <Button asChild variant="studio">
              <Link href="/create">Write as me</Link>
            </Button>
            {selectedBrandProfileId ? (
              <Button asChild variant="outline">
                <Link
                  href={`/brands/${encodeURIComponent(selectedBrandProfileId)}?tab=draft`}
                >
                  Brand draft tab
                </Link>
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <>
          <section
            aria-label="Content stats"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {DASHBOARD_STATUSES.map((status, index) => (
              <Card
                key={status}
                size="sm"
                className={cn(
                  SURFACE_PANEL_CARD,
                  index === 0 && "lg:col-span-2 lg:row-span-2",
                )}
              >
                <CardHeader>
                  <CardTitle className="capitalize">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "font-semibold",
                      index === 0 ? "text-4xl" : "text-2xl",
                    )}
                  >
                    {counts[status]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          {attention.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Needs attention"
                actions={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/content">Open library</Link>
                  </Button>
                }
              />
              <ul className="flex flex-col gap-2">
                {attention.slice(0, 5).map((post) => (
                  <li key={post.id}>
                    <PostRow
                      id={post.id}
                      headline={post.headline}
                      platform={post.platform}
                      status={post.status}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {upcoming.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Upcoming scheduled"
                actions={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/calendar">Calendar</Link>
                  </Button>
                }
              />
              <ul className="flex flex-col gap-2">
                {upcoming.slice(0, 5).map((post) => (
                  <li key={post.id}>
                    <PostRow
                      id={post.id}
                      headline={post.headline}
                      platform={post.platform}
                      status={post.status}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Recent content"
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href="/content">View all</Link>
                </Button>
              }
            />
            <ul className="flex flex-col gap-2">
              {recent.map((post) => (
                <li key={post.id}>
                  <PostRow
                    id={post.id}
                    headline={post.headline}
                    platform={post.platform}
                    status={post.status}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </PageLayout>
  );
}

function PostRow({
  id,
  headline,
  platform,
  status,
}: {
  id: string;
  headline?: string | null;
  platform?: string | null;
  status?: string | null;
}) {
  return (
    <Link
      href={`/content/${id}`}
      className="surface-panel flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm ring-0 transition-[box-shadow,transform] hover:shadow-[var(--shadow-panel-hover)]"
    >
      <span className="font-medium">{headline || "Untitled"}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {platform ? <span>{platform}</span> : null}
        {status ? <StatusBadge status={status} /> : null}
      </span>
    </Link>
  );
}
