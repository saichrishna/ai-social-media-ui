import { getUserSocialPosts } from "@/lib/api/posts";
import {
  matchGeneratedPost,
  type GeneratedPostMatchCriteria,
} from "@/lib/content/match-generated-post";

export const DRAFT_POST_POLL_INTERVAL_MS = 3_000;
export const DRAFT_POST_POLL_MS = 10 * 60 * 1000;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => resolve(), ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function pollForGeneratedPost(
  userId: string,
  criteria: GeneratedPostMatchCriteria,
  options?: { pollMs?: number; signal?: AbortSignal },
): Promise<string | null> {
  const deadline = Date.now() + (options?.pollMs ?? DRAFT_POST_POLL_MS);

  while (Date.now() < deadline) {
    if (options?.signal?.aborted) {
      return null;
    }

    const response = await getUserSocialPosts(userId);
    const posts = response.data ?? [];
    const match = matchGeneratedPost(posts, criteria);
    if (match?.id) {
      return match.id;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }
    await sleep(Math.min(DRAFT_POST_POLL_INTERVAL_MS, remaining), options?.signal);
  }

  return null;
}
