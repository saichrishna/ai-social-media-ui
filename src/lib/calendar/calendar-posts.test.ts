import { describe, expect, it } from "vitest";

import { groupCalendarPostsByDate } from "@/lib/calendar/calendar-posts";

describe("groupCalendarPostsByDate", () => {
  it("groups posts by scheduled_at date in the visible month", () => {
    const groups = groupCalendarPostsByDate(
      [
        {
          id: "post-1",
          headline: "Morning spice",
          platform: "instagram",
          status: "scheduled",
          scheduled_at: "2026-09-21T19:00:00",
          image_url: "storage/path.png",
        },
        {
          id: "post-2",
          headline: "Other month",
          platform: "instagram",
          status: "scheduled",
          scheduled_at: "2026-10-01T08:00:00",
        },
      ],
      2026,
      8,
    );

    const day = groups.get("2026-09-21");
    expect(day).toHaveLength(1);
    expect(day?.[0]).toEqual({
      id: "post-1",
      platform: "instagram",
      time: expect.any(String),
      preview: "Morning spice",
      status: "scheduled",
    });
    expect(day?.[0]).not.toHaveProperty("image_url");
    expect(day?.[0]).not.toHaveProperty("src");
    expect(JSON.stringify(day)).not.toContain("storage/path.png");
    expect(groups.get("2026-10-01")).toBeUndefined();
  });

  it("includes published_at only when that field exists on the payload", () => {
    const withPublished = groupCalendarPostsByDate(
      [
        {
          id: "pub-1",
          headline: "Went live",
          platform: "instagram",
          status: "published",
          published_at: "2026-09-10T09:30:00",
        },
      ],
      2026,
      8,
    );
    expect(withPublished.get("2026-09-10")?.[0]?.id).toBe("pub-1");

    const withoutField = groupCalendarPostsByDate(
      [
        {
          id: "no-pub",
          headline: "Draft",
          platform: "instagram",
          status: "draft",
        },
      ],
      2026,
      8,
    );
    expect([...withoutField.keys()]).toEqual([]);
  });
});
