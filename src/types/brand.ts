export type BrandProfileRequest = {
  user_id: string;
  business_name: string;
  industry: string;
  location: string;
  brand_voice: string;
  target_audience: string;
  services: string[];
  preferred_hashtags: string[];
  forbidden_topics: string[];
  additional_instructions: string;
  not_for: string;
  desired_outcome: string;
};

/** Row returned from brand-profile routes (select * plus request fields). */
export type BrandProfile = BrandProfileRequest & {
  id: string;
  created_at?: string;
  /** Present on GET /user/{user_id} list items. */
  promise_warnings?: string[];
};

export type BrandProfileResponse = {
  success: boolean;
  brand_profile: BrandProfile;
  promise_warnings?: string[];
};

export type BrandProfilesResponse = {
  success: boolean;
  brand_profiles: BrandProfile[];
};

export type DeleteBrandProfileResponse = {
  success: boolean;
  message: string;
};

export type VoiceSampleSource = "paste" | "audio";

export type VoiceSample = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  source: VoiceSampleSource;
  content: string;
  created_at?: string;
};

export type VoiceSampleRequest = {
  user_id: string;
  source: VoiceSampleSource;
  content: string;
};

export type VoiceSampleResponse = {
  success: boolean;
  voice_sample: VoiceSample;
};

export type VoiceSamplesResponse = {
  success: boolean;
  voice_samples: VoiceSample[];
};

export type InterviewAnswerSource = "type" | "audio";

export type InterviewAnswer = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  question_key: string;
  question_text: string;
  answer_text: string;
  source: InterviewAnswerSource;
  created_at?: string;
  updated_at?: string;
};

export type InterviewAnswerItem = {
  question_key: string;
  question_text: string;
  answer_text: string;
  source: InterviewAnswerSource;
};

export type InterviewAnswersSaveRequest = {
  user_id: string;
  answers: InterviewAnswerItem[];
};

export type InterviewAnswersResponse = {
  success: boolean;
  interview_answers: InterviewAnswer[];
};
