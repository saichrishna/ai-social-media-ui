import "server-only";

import { getUser } from "@/lib/api/users";
import type { CurrentUser } from "@/lib/auth/types";

/**
 * The only module allowed to read AUTH_BOOTSTRAP_USER_ID.
 * Features must import getCurrentUser / useUser instead.
 */
export async function getBootstrapUser(): Promise<CurrentUser | null> {
  const userId = process.env.AUTH_BOOTSTRAP_USER_ID?.trim();
  if (!userId) {
    return null;
  }

  try {
    const response = await getUser(userId);
    if (!response.success || !response.user) {
      return null;
    }
    return response.user;
  } catch {
    return null;
  }
}
