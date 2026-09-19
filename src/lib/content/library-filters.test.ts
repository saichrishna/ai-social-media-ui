import { describe, expect, it } from "vitest";

import {
  libraryItemImageSrc,
  libraryPostsListPath,
  libraryStatusQueryParam,
} from "@/lib/content/library-filters";

describe("library filter query helper", () => {
  it("omits the status param for All", () => {
    expect(libraryStatusQueryParam("all")).toBeUndefined();
    expect(libraryPostsListPath("user-1", "all")).toBe(
      "/api/social-posts/user/user-1",
    );
    expect(libraryPostsListPath("user-1", "all")).not.toContain("status=");
  });

  it("uses status=draft for Drafts", () => {
    expect(libraryStatusQueryParam("draft")).toBe("draft");
    expect(libraryPostsListPath("user-1", "draft")).toBe(
      "/api/social-posts/user/user-1?status=draft",
    );
  });

  it("never treats image_url as a URL", () => {
    expect(
      libraryItemImageSrc({
        image_url: "https://cdn.example/signed.png",
      }),
    ).toBeUndefined();
    expect(
      libraryItemImageSrc({
        image_url: "users/user-1/posts/post.png",
      }),
    ).toBeUndefined();
  });
});
