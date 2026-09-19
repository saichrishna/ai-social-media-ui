import { ApiError, USER_SAFE_ERROR_MESSAGE, apiFetch } from "@/lib/api/client";
import { isApproveBlockedStatus } from "@/lib/content/studio-status-actions";
import type {
  GenerateSocialContentRequest,
  GenerateSocialContentResponse,
  SchedulePostRequest,
  ScheduleSocialPostResponse,
  SocialPostDetailResponse,
  SocialPostMutationResponse,
  SocialPostsResponse,
  UpdateSocialPostRequest,
} from "@/types/post";

export const DEFAULT_POST_TIMEZONE = "Asia/Kolkata";

export const GENERATE_SOCIAL_CONTENT_TIMEOUT_MS = 5 * 60 * 1000;

const UPDATE_SOCIAL_POST_KEYS = [
  "headline",
  "caption",
  "hashtags",
  "call_to_action",
  "image_prompt",
] as const;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function buildUpdateSocialPostBody(
  input: Record<string, unknown>,
): UpdateSocialPostRequest {
  const body: UpdateSocialPostRequest = {};

  for (const key of UPDATE_SOCIAL_POST_KEYS) {
    const value = input[key];
    if (key === "hashtags") {
      if (isStringArray(value)) {
        body.hashtags = value;
      }
      continue;
    }
    if (typeof value === "string") {
      body[key] = value;
    }
  }

  return body;
}

export async function getUserSocialPosts(
  userId: string,
  status?: string,
): Promise<SocialPostsResponse> {
  const params = status
    ? `?status=${encodeURIComponent(status)}`
    : "";
  return apiFetch<SocialPostsResponse>(
    `/api/social-posts/user/${encodeURIComponent(userId)}${params}`,
  );
}

export async function getSocialPost(
  postId: string,
): Promise<SocialPostDetailResponse> {
  return apiFetch<SocialPostDetailResponse>(
    `/api/social-posts/${encodeURIComponent(postId)}`,
  );
}

export async function generateSocialContent(
  body: GenerateSocialContentRequest,
): Promise<GenerateSocialContentResponse> {
  return apiFetch<GenerateSocialContentResponse>(
    "/api/generate-social-content",
    {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: GENERATE_SOCIAL_CONTENT_TIMEOUT_MS,
    },
  );
}

export async function updateSocialPost(
  postId: string,
  input: Record<string, unknown>,
): Promise<SocialPostMutationResponse> {
  const body = buildUpdateSocialPostBody(input);
  return apiFetch<SocialPostMutationResponse>(
    `/api/social-posts/${encodeURIComponent(postId)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export async function approveSocialPost(
  postId: string,
  status?: string | null,
): Promise<SocialPostMutationResponse> {
  if (isApproveBlockedStatus(status)) {
    throw new ApiError(400, USER_SAFE_ERROR_MESSAGE);
  }
  return apiFetch<SocialPostMutationResponse>(
    `/api/social-posts/${encodeURIComponent(postId)}/approve`,
    { method: "POST" },
  );
}

export async function regenerateSocialPost(
  postId: string,
): Promise<GenerateSocialContentResponse> {
  return apiFetch<GenerateSocialContentResponse>(
    `/api/social-posts/${encodeURIComponent(postId)}/regenerate`,
    {
      method: "POST",
      timeoutMs: GENERATE_SOCIAL_CONTENT_TIMEOUT_MS,
    },
  );
}

export function buildScheduleDateTimeIso(date: string, time: string): string {
  const datePart = date.trim();
  const timePart = time.trim();
  if (!datePart || !timePart) {
    return "";
  }
  const withSeconds = timePart.length === 5 ? `${timePart}:00` : timePart;
  return `${datePart}T${withSeconds}`;
}

export function buildSchedulePostBody(
  input: Record<string, unknown>,
): SchedulePostRequest {
  const scheduledAt =
    typeof input.scheduled_at === "string" ? input.scheduled_at : "";
  const timezone =
    typeof input.timezone === "string" && input.timezone.trim()
      ? input.timezone
      : DEFAULT_POST_TIMEZONE;

  return {
    scheduled_at: scheduledAt,
    timezone,
  };
}

export async function scheduleSocialPost(
  postId: string,
  input: Record<string, unknown>,
): Promise<ScheduleSocialPostResponse> {
  const body = buildSchedulePostBody(input);
  return apiFetch<ScheduleSocialPostResponse>(
    `/api/social-posts/${encodeURIComponent(postId)}/schedule`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}
