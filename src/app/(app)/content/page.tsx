"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { StatusBadge } from "@/components/content/status-badge";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { FilterPillBar } from "@/components/ux/filter-pill-bar";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { Button } from "@/components/ui/button";
import { SURFACE_PANEL_CARD_INTERACTIVE } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";
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
  libraryFilterFromStatusParam,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedBrandProfileId } = useBrandSelection();
  const filter = libraryFilterFromStatusParam(searchParams.get("status"));
  const statusParam = libraryStatusQueryParam(filter);

  function setFilter(next: LibraryFilterId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    const query = params.toString();
    router.replace(query ? `/content?${query}` : "/content", { scroll: false });
  }

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
    <PageLayout width="full">
      <PageHeader
        title="Content"
        description="Drafts, reviews, and scheduled posts for your brand."
        actions={
          <Button asChild variant="studio">
            <Link href="/create">Write as me</Link>
          </Button>
        }
      />

      <FilterPillBar aria-label="Filter by status">
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
      </FilterPillBar>

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
              ? "Say a topic on Create — we draft from your promise and words."
              : "Try a different status filter or write a new post."
          }
          action={{ href: "/create", label: "Write as me" }}
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
    </PageLayout>
  );
}

function LibraryItemCard({ post }: { post: SocialPost }) {
  const scheduled = formatTimestamp(post.scheduled_at);
  const created = formatTimestamp(post.created_at);

  return (
    <Card className={cn(SURFACE_PANEL_CARD_INTERACTIVE, "h-full overflow-hidden p-0")}>
      <div className="overflow-hidden bg-muted">
        {post.image_signed_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_signed_url}
            alt={post.headline || "Generated post image"}
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div
            className="flex aspect-square items-center justify-center text-sm text-muted-foreground"
            aria-hidden
          >
            Preview not available
          </div>
        )}
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
