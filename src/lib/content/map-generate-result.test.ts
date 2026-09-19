import { describe, expect, it } from "vitest";

import { mapGenerateSocialContentResult } from "@/lib/content/map-generate-result";
import type { SocialPost } from "@/types/post";

const approvedPost: SocialPost = {
  id: "post-123",
  user_id: "user-1",
  status: "approved",
  headline: "Savor the Soul of Hyderabad!",
};

describe("mapGenerateSocialContentResult", () => {
  it("maps success with an approved post to navigation by post id", () => {
    expect(
      mapGenerateSocialContentResult({
        success: true,
        status: "approved",
        post: approvedPost,
      }),
    ).toEqual({ ok: true, postId: "post-123" });
  });

  it("stays failed when success is false and there is no post", () => {
    expect(
      mapGenerateSocialContentResult({
        success: false,
        status: "max_attempts_reached",
      }),
    ).toEqual({ ok: false, status: "max_attempts_reached" });
  });

  it("stays failed on max_attempts_reached even if success is true without a post", () => {
    expect(
      mapGenerateSocialContentResult({
        success: true,
        status: "max_attempts_reached",
      }),
    ).toEqual({ ok: false, status: "max_attempts_reached" });
  });

  it("stays failed when success is true but post is missing", () => {
    expect(
      mapGenerateSocialContentResult({
        success: true,
        status: "approved",
      }),
    ).toEqual({ ok: false, status: "approved" });
  });
});
