import { describe, expect, it } from "vitest";

import { captionEditIsMeaningful } from "@/lib/activity/record-corpus-from-edit";

describe("captionEditIsMeaningful", () => {
  it("detects substantial rewrites", () => {
    expect(
      captionEditIsMeaningful(
        "Short",
        "This is how I actually explain the offer to founders in plain language.",
      ),
    ).toBe(true);
  });

  it("ignores tiny tweaks", () => {
    expect(
      captionEditIsMeaningful(
        "Hello world this is a long enough caption for the test case here.",
        "Hello world this is a long enough caption for the test case here!",
      ),
    ).toBe(false);
  });
});
