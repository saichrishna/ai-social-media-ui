function hasBrandProfileIdField(post: object): boolean {
  return Object.prototype.hasOwnProperty.call(post, "brand_profile_id");
}

function getBrandProfileId(post: object): string | null | undefined {
  return (post as { brand_profile_id?: string | null }).brand_profile_id;
}

export function postsHaveBrandProfileId(posts: object[]): boolean {
  return posts.some(hasBrandProfileIdField);
}

export function filterPostsByBrandProfileId<T extends object>(
  posts: T[],
  brandProfileId: string | null,
): T[] {
  if (!brandProfileId || !postsHaveBrandProfileId(posts)) {
    return posts;
  }
  return posts.filter((post) => getBrandProfileId(post) === brandProfileId);
}
