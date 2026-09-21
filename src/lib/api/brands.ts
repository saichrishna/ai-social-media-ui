import { apiFetch } from "@/lib/api/client";
import type {
  BrandProfileRequest,
  BrandProfileResponse,
  BrandProfilesResponse,
  DeleteBrandProfileResponse,
  InterviewAnswersResponse,
  InterviewAnswersSaveRequest,
  VoiceSampleRequest,
  VoiceSampleResponse,
  VoiceSamplesResponse,
  CorpusItemsResponse,
} from "@/types/brand";

export async function createBrandProfile(
  body: BrandProfileRequest,
): Promise<BrandProfileResponse> {
  return apiFetch<BrandProfileResponse>("/brand-profiles/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getUserBrandProfiles(
  userId: string,
): Promise<BrandProfilesResponse> {
  return apiFetch<BrandProfilesResponse>(
    `/brand-profiles/user/${encodeURIComponent(userId)}`,
  );
}

export async function getBrandProfile(
  profileId: string,
): Promise<BrandProfileResponse> {
  return apiFetch<BrandProfileResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}`,
  );
}

export async function updateBrandProfile(
  profileId: string,
  body: BrandProfileRequest,
): Promise<BrandProfileResponse> {
  return apiFetch<BrandProfileResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteBrandProfile(
  profileId: string,
): Promise<DeleteBrandProfileResponse> {
  return apiFetch<DeleteBrandProfileResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}`,
    { method: "DELETE" },
  );
}

export async function addVoiceSample(
  profileId: string,
  userId: string,
  body: Omit<VoiceSampleRequest, "user_id">,
): Promise<VoiceSampleResponse> {
  const payload: VoiceSampleRequest = {
    user_id: userId,
    ...body,
  };
  return apiFetch<VoiceSampleResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/samples?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getVoiceSamples(
  profileId: string,
  userId: string,
): Promise<VoiceSamplesResponse> {
  return apiFetch<VoiceSamplesResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/samples?user_id=${encodeURIComponent(userId)}`,
  );
}

export async function saveInterviewAnswers(
  profileId: string,
  userId: string,
  body: Omit<InterviewAnswersSaveRequest, "user_id">,
): Promise<InterviewAnswersResponse> {
  const payload: InterviewAnswersSaveRequest = {
    user_id: userId,
    ...body,
  };
  return apiFetch<InterviewAnswersResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-answers?user_id=${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export async function getInterviewAnswers(
  profileId: string,
  userId: string,
): Promise<InterviewAnswersResponse> {
  return apiFetch<InterviewAnswersResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-answers?user_id=${encodeURIComponent(userId)}`,
  );
}

export async function getCorpusItems(
  profileId: string,
  userId: string,
): Promise<CorpusItemsResponse> {
  return apiFetch<CorpusItemsResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/corpus-items?user_id=${encodeURIComponent(userId)}`,
  );
}
