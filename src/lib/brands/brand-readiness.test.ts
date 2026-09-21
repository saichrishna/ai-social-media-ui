import { describe, expect, it } from "vitest";

import {
  countCorpusMaterial,
  countYourWordsMaterial,
  deriveBrandSetupStatus,
  deriveListBrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import type {
  BrandProfile,
  CorpusItem,
  InterviewAnswer,
  VoiceSample,
} from "@/types/brand";

const completePromise: BrandProfile = {
  id: "b1",
  user_id: "u1",
  business_name: "Co",
  industry: "X",
  location: "",
  brand_voice: "",
  target_audience: "Founders",
  services: [],
  preferred_hashtags: [],
  forbidden_topics: [],
  additional_instructions: "",
  not_for: "Enterprises",
  desired_outcome: "Trust",
};

describe("brand readiness", () => {
  it("counts paste samples and filled answers toward material", () => {
    const samples: VoiceSample[] = [
      {
        id: "1",
        user_id: "u1",
        brand_profile_id: "b1",
        source: "paste",
        content: "One",
      },
      {
        id: "2",
        user_id: "u1",
        brand_profile_id: "b1",
        source: "audio",
        content: "Two",
      },
    ];
    const answers: InterviewAnswer[] = [
      {
        id: "a1",
        user_id: "u1",
        brand_profile_id: "b1",
        question_key: "customers_get_wrong",
        question_text: "",
        answer_text: "Answer",
        source: "type",
      },
    ];
    expect(countYourWordsMaterial(samples, answers)).toBe(2);
  });

  it("requires promise before ready_to_draft", () => {
    expect(
      deriveBrandSetupStatus(
        { ...completePromise, not_for: "", target_audience: "" },
        [],
      ),
    ).toBe("promise_incomplete");
  });

  it("needs three corpus items for ready_to_draft", () => {
    const items: CorpusItem[] = [
      {
        id: "1",
        user_id: "u1",
        brand_profile_id: "b1",
        source: "paste",
        content: "a",
      },
      {
        id: "2",
        user_id: "u1",
        brand_profile_id: "b1",
        source: "mini_talk",
        content: "b",
      },
      {
        id: "3",
        user_id: "u1",
        brand_profile_id: "b1",
        source: "full_talk",
        content: "c",
      },
    ];
    expect(countCorpusMaterial(items)).toBe(3);
    expect(deriveBrandSetupStatus(completePromise, items)).toBe(
      "ready_to_draft",
    );
  });

  it("list status never claims ready_to_draft without material counts", () => {
    expect(deriveListBrandSetupStatus(completePromise)).toBe("need_your_words");
    expect(
      deriveListBrandSetupStatus({
        ...completePromise,
        target_audience: "",
      }),
    ).toBe("promise_incomplete");
  });
});
