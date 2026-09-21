import { beforeEach, describe, expect, it } from "vitest";

import {
  getRecentActions,
  recordRecentAction,
} from "@/lib/activity/recent-actions";

describe("recent actions", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns newest items first", () => {
    recordRecentAction({
      kind: "calendar",
      href: "/calendar",
      label: "Calendar",
      at: 100,
    });
    recordRecentAction({
      kind: "create",
      href: "/create",
      label: "Create",
      at: 200,
    });

    const recent = getRecentActions(2);
    expect(recent[0]?.kind).toBe("create");
    expect(recent[1]?.kind).toBe("calendar");
  });
});
