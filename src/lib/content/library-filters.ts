import type { SocialPost } from "@/types/post";

export const LIBRARY_FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "failed", label: "Failed" },
] as const;

export type LibraryFilterId = (typeof LIBRARY_FILTERS)[number]["id"];

/** Maps a library filter to the GET list `status` query. All omits the param. */
export function libraryStatusQueryParam(
  filter: LibraryFilterId,
): string | undefined {
  if (filter === "all") {
    return undefined;
  }
  return filter;
}

export function libraryPostsListPath(
  userId: string,
  filter: LibraryFilterId,
): string {
  const status = libraryStatusQueryParam(filter);
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  return `/api/social-posts/user/${encodeURIComponent(userId)}${params}`;
}

/**
 * List `image_url` is a storage path, not a public URL.
 * Never return it for use as img src.
 */
export function libraryItemImageSrc(
  post: Pick<SocialPost, "image_url">,
): undefined {
  const storagePath = post.image_url;
  if (typeof storagePath === "string" && storagePath.length > 0) {
    return undefined;
  }
  return undefined;
}
