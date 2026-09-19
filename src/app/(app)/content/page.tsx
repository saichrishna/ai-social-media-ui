"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { StatusBadge } from "@/components/content/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserSocialPosts } from "@/lib/api/posts";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import {
  LIBRARY_FILTERS,
  libraryStatusQueryParam,
  type LibraryFilterId,
} from "@/lib/content/library-filters";
import { filterPostsByBrandProfileId } from "@/lib/posts/filter-by-brand";
import type { SocialPost } from "@/types/post";

function formatTimestamp(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

export default function ContentLibraryPage() {
  const userId = useUserId();
  const { selectedBrandProfileId } = useBrandSelection();
  const [filter, setFilter] = useState<LibraryFilterId>("all");
  const statusParam = libraryStatusQueryParam(filter);

  const postsQuery = useQuery({
    queryKey: ["social-posts", userId, statusParam ?? "all"],
    queryFn: () => getUserSocialPosts(userId!, statusParam),
    enabled: Boolean(userId),
  });

  if (!userId) {
    return null;
  }

  const allPosts = postsQuery.data?.data ?? [];
  const posts = filterPostsByBrandProfileId(allPosts, selectedBrandProfileId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Content</h1>
        <Button asChild>
          <Link href="/create">Create Content</Link>
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex flex-wrap gap-2"
      >
        {LIBRARY_FILTERS.map((item) => (
          <Button
            key={item.id}
            type="button"
            role="tab"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {postsQuery.isLoading ? (
        <LoadingState label="Loading content" />
      ) : postsQuery.isError ? (
        <ErrorState
          message={USER_SAFE_ERROR_MESSAGE}
          onRetry={() => {
            void postsQuery.refetch();
          }}
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No content yet" : "No matching content"}
          description={
            filter === "all"
              ? "Create your first AI-powered social post."
              : "Try a different status filter or create new content."
          }
          action={{ href: "/create", label: "Create Content" }}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <LibraryItemCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LibraryItemCard({ post }: { post: SocialPost }) {
  const scheduled = formatTimestamp(post.scheduled_at);
  const created = formatTimestamp(post.created_at);

  return (
    <Card className="h-full">
      <div className="overflow-hidden bg-muted">
        {/* List image_url is a storage path — never use as img src. */}
        <div
          className="flex aspect-square items-center justify-center text-sm text-muted-foreground"
          aria-hidden
        >
          No image
        </div>
      </div>
      <CardHeader>
        <CardTitle>{post.headline || "Untitled"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          {post.platform ? <span>{post.platform}</span> : null}
          {post.status ? <StatusBadge status={post.status} /> : null}
        </div>
        {scheduled ? <p>Scheduled {scheduled}</p> : null}
        {created ? <p>Created {created}</p> : null}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link href={`/content/${post.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
