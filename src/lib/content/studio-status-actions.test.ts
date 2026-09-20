import { describe, expect, it } from "vitest";

import {
  isApproveBlockedStatus,
  studioStatusActions,
  studioStatusGuidance,
} from "@/lib/content/studio-status-actions";

describe("studioStatusActions", () => {
  it("shows schedule and hides approve when status is approved", () => {
    expect(studioStatusActions("approved")).toEqual({
      approveVisible: false,
      approveAvailable: false,
      scheduleVisible: true,
    });
  });

  it("makes approve available for draft even when the button is not wired", () => {
    expect(studioStatusActions("draft")).toEqual({
      approveVisible: true,
      approveAvailable: true,
      scheduleVisible: false,
    });
  });

  it("still hides approve when status is approved after studio actions are wired", () => {
    expect(studioStatusActions("approved").approveVisible).toBe(false);
  });

  it("blocks approve for scheduled, publishing, and published", () => {
    expect(isApproveBlockedStatus("scheduled")).toBe(true);
    expect(isApproveBlockedStatus("publishing")).toBe(true);
    expect(isApproveBlockedStatus("published")).toBe(true);
    expect(isApproveBlockedStatus("draft")).toBe(false);
  });
});

describe("studioStatusGuidance", () => {
  it("returns guidance for non-action statuses", () => {
    expect(studioStatusGuidance("scheduled")).toContain("Calendar");
    expect(studioStatusGuidance("failed")).toContain("failed");
    expect(studioStatusGuidance("draft")).toBeNull();
  });
});
