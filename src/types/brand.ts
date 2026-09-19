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
};

/** Row returned from brand-profile routes (select * plus request fields). */
export type BrandProfile = BrandProfileRequest & {
  id: string;
  created_at?: string;
};

export type BrandProfileResponse = {
  success: boolean;
  brand_profile: BrandProfile;
};

export type BrandProfilesResponse = {
  success: boolean;
  brand_profiles: BrandProfile[];
};

export type DeleteBrandProfileResponse = {
  success: boolean;
  message: string;
};
