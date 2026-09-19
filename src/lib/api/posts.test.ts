import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client";
import {
  GENERATE_SOCIAL_CONTENT_TIMEOUT_MS,
  approveSocialPost,
  buildSchedulePostBody,
  buildUpdateSocialPostBody,
  generateSocialContent,
  regenerateSocialPost,
  scheduleSocialPost,
  updateSocialPost,
} from "@/lib/api/posts";
import { isApproveBlockedStatus } from "@/lib/content/studio-status-actions";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  apiFetchMock.mockReset();
  apiFetchMock.mockResolvedValue({ success: true });
});

describe("buildUpdateSocialPostBody", () => {
  it("keeps only headline, caption, hashtags, call_to_action, and image_prompt", () => {
    expect(
      buildUpdateSocialPostBody({
        headline: "Headline",
        caption: "Caption",
        hashtags: ["#one", "#two"],
        call_to_action: "Visit us",
        image_prompt: "Warm lighting",
        status: "approved",
        image_url: "storage/path.png",
        user_id: "user-1",
        id: "post-1",
        platform: "instagram",
      }),
    ).toEqual({
      headline: "Headline",
      caption: "Caption",
      hashtags: ["#one", "#two"],
      call_to_action: "Visit us",
      image_prompt: "Warm lighting",
    });
  });
});

describe("updateSocialPost", () => {
  it("PUTs a body with only the update fields", async () => {
    await updateSocialPost("post-1", {
      headline: "Headline",
      caption: "Caption",
      hashtags: ["#one"],
      call_to_action: "Visit us",
      image_prompt: "Warm lighting",
      status: "draft",
      image_url: "do-not-send",
      user_id: "user-1",
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/api/social-posts/post-1", {
      method: "PUT",
      body: JSON.stringify({
        headline: "Headline",
        caption: "Caption",
        hashtags: ["#one"],
        call_to_action: "Visit us",
        image_prompt: "Warm lighting",
      }),
    });
    expect(apiFetchMock.mock.calls[0]?.[1]?.body).not.toContain("user_id");
    expect(apiFetchMock.mock.calls[0]?.[1]?.body).not.toContain("image_url");
    expect(apiFetchMock.mock.calls[0]?.[1]?.body).not.toContain("status");
  });
});

describe("approveSocialPost", () => {
  it("does not call the API for scheduled, publishing, or published", async () => {
    for (const status of ["scheduled", "publishing", "published"] as const) {
      apiFetchMock.mockClear();
      await expect(approveSocialPost("post-1", status)).rejects.toMatchObject({
        name: "ApiError",
        status: 400,
      });
      expect(apiFetchMock).not.toHaveBeenCalled();
    }
  });

  it("POSTs approve when the status is allowed", async () => {
    await approveSocialPost("post-1", "draft");
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/social-posts/post-1/approve",
      { method: "POST" },
    );
  });
});

describe("regenerateSocialPost", () => {
  it("uses the same timeout as generate", async () => {
    await generateSocialContent({
      user_id: "user-1",
      brand_profile_id: "brand-1",
      topic: "topic",
      description: "description",
      platform: "instagram",
    });
    const generateTimeout = apiFetchMock.mock.calls[0]?.[1]?.timeoutMs;

    apiFetchMock.mockClear();
    await regenerateSocialPost("post-1");

    expect(generateTimeout).toBe(GENERATE_SOCIAL_CONTENT_TIMEOUT_MS);
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/social-posts/post-1/regenerate",
      {
        method: "POST",
        timeoutMs: GENERATE_SOCIAL_CONTENT_TIMEOUT_MS,
      },
    );
    expect(apiFetchMock.mock.calls[0]?.[1]?.timeoutMs).toBe(generateTimeout);
  });
});

describe("isApproveBlockedStatus", () => {
  it("blocks scheduled, publishing, and published", () => {
    expect(isApproveBlockedStatus("scheduled")).toBe(true);
    expect(isApproveBlockedStatus("publishing")).toBe(true);
    expect(isApproveBlockedStatus("published")).toBe(true);
    expect(isApproveBlockedStatus("draft")).toBe(false);
    expect(isApproveBlockedStatus("approved")).toBe(false);
  });
});

describe("buildSchedulePostBody", () => {
  it("keeps only scheduled_at and timezone", () => {
    expect(
      buildSchedulePostBody({
        scheduled_at: "2026-09-21T19:00:00",
        timezone: "Asia/Kolkata",
        social_account_id: "account-1",
        platform: "instagram",
        status: "approved",
        user_id: "user-1",
        id: "post-1",
      }),
    ).toEqual({
      scheduled_at: "2026-09-21T19:00:00",
      timezone: "Asia/Kolkata",
    });
  });
});

describe("scheduleSocialPost", () => {
  it("PUTs only scheduled_at and timezone", async () => {
    await scheduleSocialPost("post-1", {
      scheduled_at: "2026-09-21T19:00:00",
      timezone: "Asia/Kolkata",
      social_account_id: "account-1",
      image_url: "do-not-send",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/api/social-posts/post-1/schedule",
      {
        method: "PUT",
        body: JSON.stringify({
          scheduled_at: "2026-09-21T19:00:00",
          timezone: "Asia/Kolkata",
        }),
      },
    );
    const body = apiFetchMock.mock.calls[0]?.[1]?.body;
    expect(body).not.toContain("social_account_id");
    expect(body).not.toContain("image_url");
  });
});
