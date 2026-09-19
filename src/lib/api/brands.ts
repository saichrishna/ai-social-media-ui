import { apiFetch } from "@/lib/api/client";
import type {
  BrandProfileRequest,
  BrandProfileResponse,
  BrandProfilesResponse,
  DeleteBrandProfileResponse,
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
