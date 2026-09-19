"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { BrandSelector } from "@/components/brands/brand-selector";
import { StatusBadge } from "@/components/content/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (postsQuery.isLoading) {
    return <LoadingState label="Loading dashboard" />;
  }

  if (postsQuery.isError) {
    return (
      <ErrorState
        message={USER_SAFE_ERROR_MESSAGE}
        onRetry={() => {
          void postsQuery.refetch();
        }}
      />
    );
  }

  const allPosts = postsQuery.data?.data ?? [];
  const posts = filterPostsByBrandProfileId(allPosts, selectedBrandProfileId);
  const counts = countPostsByStatus(posts);
  const attention = postsNeedingAttention(posts);
  const upcoming = upcomingScheduledPosts(posts);
  const recent = posts.slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">
            {greetingForNow(new Date())}
            {user?.name ? ` ${user.name}` : ""}
          </h1>
          <BrandSelector />
        </div>
        <Button asChild>
          <Link href="/create">Create Content</Link>
        </Button>
      </div>

      {!brandsLoading && brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Add a brand to start creating content with the right voice and guidelines."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      ) : null}

      {posts.length === 0 ? (
        <EmptyState
          title="No content yet"
          description="Create your first AI-powered social post."
          action={{ href: "/create", label: "Create Content" }}
        />
      ) : (
        <>
          <section aria-label="Content stats" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DASHBOARD_STATUSES.map((status) => (
              <Card key={status} size="sm">
                <CardHeader>
                  <CardTitle className="capitalize">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{counts[status]}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          {attention.length > 0 ? (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-medium">Needs attention</h2>
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
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-medium">Upcoming scheduled</h2>
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

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Recent content</h2>
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
      )}
    </div>
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
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-muted"
    >
      <span className="font-medium">{headline || "Untitled"}</span>
      <span className="flex items-center gap-2 text-muted-foreground">
        {platform ? <span>{platform}</span> : null}
        {status ? <StatusBadge status={status} /> : null}
      </span>
    </Link>
  );
}
