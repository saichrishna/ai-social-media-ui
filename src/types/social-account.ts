/** Row from GET /api/social-accounts (select *). Display-only fields are optional. */
export type SocialAccount = {
  id: string;
  user_id?: string | null;
  brand_profile_id?: string | null;
  platform?: string | null;
  is_active?: boolean | null;
  username?: string | null;
  account_name?: string | null;
  name?: string | null;
};

export type SocialAccountsResponse = {
  success: boolean;
  accounts: SocialAccount[];
};

export type BrandSocialAccountsResponse = SocialAccountsResponse;

export type DisconnectSocialAccountResponse = {
  success: boolean;
  message?: string;
};
