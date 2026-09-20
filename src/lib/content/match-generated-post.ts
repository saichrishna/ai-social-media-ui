import type { SocialPost } from "@/types/post";

export type GeneratedPostMatchCriteria = {
  brandProfileId: string;
  topic: string;
  platform: string;
  /** Only posts created at or after this time (ms). Small clock skew allowed. */
  createdAfterMs: number;
};

export function matchGeneratedPost(
  posts: SocialPost[],
  criteria: GeneratedPostMatchCriteria,
): SocialPost | undefined {
  const strict = matchGeneratedPostStrict(posts, criteria);
  if (strict) {
    return strict;
  }
  return matchLatestPostForBrand(posts, criteria);
}

function matchGeneratedPostStrict(
  posts: SocialPost[],
  criteria: GeneratedPostMatchCriteria,
): SocialPost | undefined {
  const topicNorm = criteria.topic.trim().toLowerCase();
  const platformNorm = criteria.platform.trim().toLowerCase();
  const notBefore = criteria.createdAfterMs - 15_000;

  const candidates = posts.filter((post) => {
    if (post.brand_profile_id !== criteria.brandProfileId) {
      return false;
    }
    if ((post.topic ?? "").trim().toLowerCase() !== topicNorm) {
      return false;
    }
    if ((post.platform ?? "").trim().toLowerCase() !== platformNorm) {
      return false;
    }
    const created = post.created_at ? Date.parse(post.created_at) : Number.NaN;
    if (!Number.isFinite(created) || created < notBefore) {
      return false;
    }
    return true;
  });

  return sortByNewest(candidates)[0];
}

/** Fallback when topic text differs slightly but a new post exists for this brand. */
function matchLatestPostForBrand(
  posts: SocialPost[],
  criteria: GeneratedPostMatchCriteria,
): SocialPost | undefined {
  const platformNorm = criteria.platform.trim().toLowerCase();
  const notBefore = criteria.createdAfterMs - 15_000;

  const candidates = posts.filter((post) => {
    if (post.brand_profile_id !== criteria.brandProfileId) {
      return false;
    }
    if ((post.platform ?? "").trim().toLowerCase() !== platformNorm) {
      return false;
    }
    const created = post.created_at ? Date.parse(post.created_at) : Number.NaN;
    if (!Number.isFinite(created) || created < notBefore) {
      return false;
    }
    return true;
  });

  return sortByNewest(candidates)[0];
}

function sortByNewest(posts: SocialPost[]): SocialPost[] {
  return [...posts].sort((left, right) => {
    const leftAt = Date.parse(left.created_at ?? "") || 0;
    const rightAt = Date.parse(right.created_at ?? "") || 0;
    return rightAt - leftAt;
  });
}
