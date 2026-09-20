import type { BrandProfile, BrandProfileRequest } from "@/types/brand";

export type BrandProfileDraft = Partial<
  Omit<BrandProfileRequest, "user_id">
>;

/** Backend PUT replaces the whole row — always send the full profile. */
export function buildBrandProfileRequest(
  userId: string,
  existing: BrandProfile | undefined,
  draft: BrandProfileDraft,
): BrandProfileRequest {
  return {
    user_id: userId,
    business_name:
      draft.business_name ?? existing?.business_name ?? "",
    industry: draft.industry ?? existing?.industry ?? "",
    location: draft.location ?? existing?.location ?? "",
    brand_voice: draft.brand_voice ?? existing?.brand_voice ?? "",
    target_audience:
      draft.target_audience ?? existing?.target_audience ?? "",
    services: draft.services ?? existing?.services ?? [],
    preferred_hashtags:
      draft.preferred_hashtags ?? existing?.preferred_hashtags ?? [],
    forbidden_topics:
      draft.forbidden_topics ?? existing?.forbidden_topics ?? [],
    additional_instructions:
      draft.additional_instructions ?? existing?.additional_instructions ?? "",
    not_for: draft.not_for ?? existing?.not_for ?? "",
    desired_outcome:
      draft.desired_outcome ?? existing?.desired_outcome ?? "",
  };
}
