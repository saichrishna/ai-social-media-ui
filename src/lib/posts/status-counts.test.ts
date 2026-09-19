import { describe, expect, it } from "vitest";

import { countPostsByStatus } from "@/lib/posts/status-counts";

describe("countPostsByStatus", () => {
  it("counts real statuses and does not coerce approved into draft", () => {
    const fixture = [
      { status: "draft" },
      { status: "draft" },
      { status: "approved" },
      { status: "approved" },
      { status: "approved" },
      { status: "scheduled" },
      { status: "published" },
      { status: "failed" },
      { status: "publishing" },
    ];

    expect(countPostsByStatus(fixture)).toEqual({
      draft: 2,
      approved: 3,
      scheduled: 1,
      published: 1,
      failed: 1,
    });
  });
});
