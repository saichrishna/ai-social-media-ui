import { describe, expect, it } from "vitest";

import { buildBrandProfileRequest } from "@/lib/brands/build-brand-request";
import type { BrandProfile } from "@/types/brand";

const existing: BrandProfile = {
  id: "brand-1",
  user_id: "user-1",
  business_name: "Acme",
  industry: "Consulting",
  location: "NYC",
  brand_voice: "Direct",
  target_audience: "Founders",
  services: ["Workshops"],
  preferred_hashtags: ["#acme"],
  forbidden_topics: ["Politics"],
  additional_instructions: "Keep it short",
  not_for: "Enterprise only",
  desired_outcome: "More trust",
};

describe("buildBrandProfileRequest", () => {
  it("merges draft fields and preserves untouched existing values", () => {
    expect(
      buildBrandProfileRequest("user-1", existing, {
        target_audience: "Small business owners",
      }),
    ).toEqual({
      user_id: "user-1",
      business_name: "Acme",
      industry: "Consulting",
      location: "NYC",
      brand_voice: "Direct",
      target_audience: "Small business owners",
      services: ["Workshops"],
      preferred_hashtags: ["#acme"],
      forbidden_topics: ["Politics"],
      additional_instructions: "Keep it short",
      not_for: "Enterprise only",
      desired_outcome: "More trust",
    });
  });

  it("defaults empty strings for create without existing profile", () => {
    expect(
      buildBrandProfileRequest("user-1", undefined, {
        business_name: "New Co",
        industry: "Health",
      }),
    ).toMatchObject({
      user_id: "user-1",
      business_name: "New Co",
      industry: "Health",
      not_for: "",
      desired_outcome: "",
      services: [],
    });
  });
});
