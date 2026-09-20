import { describe, expect, it } from "vitest";

import { matchGeneratedPost } from "@/lib/content/match-generated-post";
import type { SocialPost } from "@/types/post";

const base: SocialPost = {
  id: "post-1",
  user_id: "user-1",
  brand_profile_id: "brand-1",
  topic: "Flax Seed Oil",
  platform: "instagram",
  created_at: "2026-09-20T13:23:26.000Z",
};

describe("matchGeneratedPost", () => {
  it("matches topic, brand, platform, and created_after", () => {
    const started = Date.parse("2026-09-20T13:23:20.000Z");
    const found = matchGeneratedPost([base], {
      brandProfileId: "brand-1",
      topic: "flax seed oil",
      platform: "instagram",
      createdAfterMs: started,
    });
    expect(found?.id).toBe("post-1");
  });

  it("falls back to newest post for brand when topic differs", () => {
    const started = Date.parse("2026-09-20T13:23:20.000Z");
    const found = matchGeneratedPost(
      [{ ...base, topic: "Different topic label" }],
      {
        brandProfileId: "brand-1",
        topic: "Flax Seed Oil",
        platform: "instagram",
        createdAfterMs: started,
      },
    );
    expect(found?.id).toBe("post-1");
  });

  it("ignores posts from before the generate started", () => {
    const started = Date.parse("2026-09-20T13:24:00.000Z");
    const found = matchGeneratedPost([base], {
      brandProfileId: "brand-1",
      topic: "Flax Seed Oil",
      platform: "instagram",
      createdAfterMs: started,
    });
    expect(found).toBeUndefined();
  });
});
