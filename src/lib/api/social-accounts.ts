import { apiFetch } from "@/lib/api/client";
import type {
  BrandSocialAccountsResponse,
  DisconnectSocialAccountResponse,
  SocialAccount,
  SocialAccountsResponse,
} from "@/types/social-account";

export function buildUserSocialAccountsPath(userId: string): string {
  return `/api/social-accounts/user/${encodeURIComponent(userId)}`;
}

export function buildBrandSocialAccountsPath(
  brandProfileId: string,
  userId: string,
): string {
  return `/api/social-accounts/brand/${encodeURIComponent(brandProfileId)}?user_id=${encodeURIComponent(userId)}`;
}

export function buildDisconnectSocialAccountPath(
  accountId: string,
  userId: string,
): string {
  return `/api/social-accounts/${encodeURIComponent(accountId)}?user_id=${encodeURIComponent(userId)}`;
}

export async function getUserSocialAccounts(
  userId: string,
): Promise<SocialAccountsResponse> {
  return apiFetch<SocialAccountsResponse>(buildUserSocialAccountsPath(userId));
}

export async function getBrandSocialAccounts(
  brandProfileId: string,
  userId: string,
): Promise<BrandSocialAccountsResponse> {
  return apiFetch<BrandSocialAccountsResponse>(
    buildBrandSocialAccountsPath(brandProfileId, userId),
  );
}

export async function disconnectSocialAccount(
  accountId: string,
  userId: string,
): Promise<DisconnectSocialAccountResponse> {
  return apiFetch<DisconnectSocialAccountResponse>(
    buildDisconnectSocialAccountPath(accountId, userId),
    { method: "DELETE" },
  );
}

/** Connect/OAuth is gated; do not call /api/social-connect from the UI yet. */
export function canInvokeSocialConnect(socialPublishingEnabled: boolean): boolean {
  return socialPublishingEnabled === true;
}

export function invokeSocialConnectIfEnabled(
  socialPublishingEnabled: boolean,
  connect: () => void,
): void {
  if (!canInvokeSocialConnect(socialPublishingEnabled)) {
    return;
  }
  connect();
}

export function isListedSocialAccount(account: SocialAccount): boolean {
  return account.is_active !== false;
}

export function socialAccountDisplayLabel(
  account: SocialAccount | null | undefined,
): string | null {
  if (!account) {
    return null;
  }
  const candidates = [account.username, account.account_name, account.name];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "Connected";
}

export function brandAccountLabelForPlatform(
  accounts: SocialAccount[],
  platform?: string | null,
): string {
  if (accounts.length === 0) {
    return "none connected";
  }
  const normalized = platform?.trim().toLowerCase();
  const match = normalized
    ? accounts.find(
        (account) => account.platform?.trim().toLowerCase() === normalized,
      )
    : undefined;
  return socialAccountDisplayLabel(match ?? accounts[0]) ?? "none connected";
}
