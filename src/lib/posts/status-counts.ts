export const DASHBOARD_STATUSES = [
  "draft",
  "approved",
  "scheduled",
  "published",
  "failed",
] as const;

export type DashboardStatus = (typeof DASHBOARD_STATUSES)[number];

export type StatusCounts = Record<DashboardStatus, number>;

export function countPostsByStatus(
  posts: Array<{ status?: string | null }>,
): StatusCounts {
  const counts: StatusCounts = {
    draft: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
    failed: 0,
  };

  for (const post of posts) {
    const status = post.status;
    if (status === "draft") counts.draft += 1;
    else if (status === "approved") counts.approved += 1;
    else if (status === "scheduled") counts.scheduled += 1;
    else if (status === "published") counts.published += 1;
    else if (status === "failed") counts.failed += 1;
  }

  return counts;
}

export function postsNeedingAttention<
  T extends { status?: string | null },
>(posts: T[]): T[] {
  return posts.filter(
    (post) => post.status === "draft" || post.status === "failed",
  );
}

export function upcomingScheduledPosts<
  T extends { status?: string | null; scheduled_at?: string | null },
>(posts: T[]): T[] {
  const scheduled = posts.filter((post) => post.status === "scheduled");
  const hasScheduledAt = scheduled.some((post) =>
    Object.prototype.hasOwnProperty.call(post, "scheduled_at"),
  );
  if (!hasScheduledAt) {
    return [];
  }
  return [...scheduled]
    .filter((post) => Boolean(post.scheduled_at))
    .sort((a, b) => {
      const aTime = a.scheduled_at ?? "";
      const bTime = b.scheduled_at ?? "";
      return aTime.localeCompare(bTime);
    });
}
