import { describe, expect, it } from "vitest";

import { filterPostsByBrandProfileId } from "@/lib/posts/filter-by-brand";

describe("filterPostsByBrandProfileId", () => {
  it("filters by selected brand when brand_profile_id exists", () => {
    const posts = [
      { id: "1", brand_profile_id: "brand-a" },
      { id: "2", brand_profile_id: "brand-b" },
      { id: "3", brand_profile_id: "brand-a" },
    ];

    expect(filterPostsByBrandProfileId(posts, "brand-a")).toEqual([
      { id: "1", brand_profile_id: "brand-a" },
      { id: "3", brand_profile_id: "brand-a" },
    ]);
  });

  it("skips filtering when brand_profile_id is missing from posts", () => {
    const posts = [{ id: "1" }, { id: "2" }];
    expect(filterPostsByBrandProfileId(posts, "brand-a")).toEqual(posts);
  });

  it("returns all posts when no brand is selected", () => {
    const posts = [{ id: "1", brand_profile_id: "brand-a" }];
    expect(filterPostsByBrandProfileId(posts, null)).toEqual(posts);
  });
});
