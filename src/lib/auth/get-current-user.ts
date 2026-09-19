import "server-only";

import { getBootstrapUser } from "@/lib/auth/bootstrap-provider";
import type { CurrentUser } from "@/lib/auth/types";

/**
 * Server identity entry. Swap this file later for session/cookie auth.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return getBootstrapUser();
}
