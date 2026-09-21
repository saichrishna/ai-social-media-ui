import { describe, expect, it } from "vitest";

import { getDashboardNextAction } from "@/lib/dashboard/dashboard-next-action";

describe("getDashboardNextAction", () => {
  it("prioritizes continue studio over write as me", () => {
    const action = getDashboardNextAction({
      brandId: "b1",
      brandName: "Clinic",
      setupStatus: "ready_to_draft",
      materialCount: 5,
      postsNeedingAttention: 0,
      totalPosts: 2,
      continueStudioHref: "/content/post-1",
    });

    expect(action.href).toBe("/content/post-1");
    expect(action.ctaLabel).toBe("Continue in studio");
  });

  it("suggests mini talk as secondary when ready", () => {
    const action = getDashboardNextAction({
      brandId: "b1",
      brandName: "Clinic",
      setupStatus: "ready_to_draft",
      materialCount: 5,
      postsNeedingAttention: 0,
      totalPosts: 2,
    });

    expect(action.secondaryLabel).toBe("Tell us something");
  });
});
