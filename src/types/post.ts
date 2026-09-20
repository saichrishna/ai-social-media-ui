/**
 * Fields written in social_content_workflow.post_data plus columns
 * later updated on the same social_posts row (select *).
 */
export type SocialPost = {
  id: string;
  user_id: string;
  brand_profile_id?: string | null;
  social_account_id?: string | null;
  topic?: string | null;
  description?: string | null;
  headline?: string | null;
  caption?: string | null;
  hashtags?: string[];
  call_to_action?: string | null;
  image_prompt?: string | null;
  platform?: string | null;
  prompt_engineering?: unknown;
  review?: unknown;
  attempt_history?: unknown;
  status?: string | null;
  /** Storage path, not a public URL. Do not use as img src. */
  image_url?: string | null;
  scheduled_at?: string | null;
  timezone?: string | null;
  published_at?: string | null;
  error_message?: string | null;
  created_at?: string;
  /** Present on list responses when image_url exists (GET detail uses envelope field). */
  image_signed_url?: string | null;
};

export type SocialPostsResponse = {
  success: boolean;
  count: number;
  data: SocialPost[];
};

export type PostAllowedAction =
  | "edit"
  | "regenerate"
  | "approve"
  | "schedule";

/** GET /api/social-posts/{id} only — list responses do not include this. */
export type SocialPostDetailResponse = {
  success: boolean;
  post: SocialPost;
  image_signed_url?: string | null;
  review?: unknown;
  allowed_actions?: PostAllowedAction[];
};

export type GenerateSocialContentRequest = {
  user_id: string;
  brand_profile_id: string;
  topic: string;
  description: string;
  platform: string;
};

export type GenerateSocialContentResponse = {
  success: boolean;
  status?: string;
  post?: SocialPost | null;
  review?: unknown;
};

/** PUT /api/social-posts/{post_id} — only these fields exist on the backend. */
export type UpdateSocialPostRequest = {
  headline?: string;
  caption?: string;
  hashtags?: string[];
  call_to_action?: string;
  image_prompt?: string;
};

export type SocialPostMutationResponse = {
  success: boolean;
  message?: string;
  post?: SocialPost | null;
};

/** PUT /api/social-posts/{post_id}/schedule — only these fields exist on the backend. */
export type SchedulePostRequest = {
  scheduled_at: string;
  timezone: string;
};

export type ScheduleSocialPostResponse = {
  success: boolean;
  message?: string;
  data?: SocialPost | null;
};
