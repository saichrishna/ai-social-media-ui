import { apiFetch } from "@/lib/api/client";
import type { UserResponse } from "@/types/user";

export async function getUser(userId: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/users/${encodeURIComponent(userId)}`);
}
