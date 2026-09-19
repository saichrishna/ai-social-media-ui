import type { GenerateSocialContentResponse } from "@/types/post";

export type MappedGenerateResult =
  | { ok: true; postId: string }
  | { ok: false; status?: string };

function payloadStatus(
  payload: GenerateSocialContentResponse,
): string | undefined {
  return typeof payload.status === "string" && payload.status.length > 0
    ? payload.status
    : undefined;
}

export function mapGenerateSocialContentResult(
  payload: GenerateSocialContentResponse,
): MappedGenerateResult {
  const postId = payload.post?.id;
  const hasPostId = typeof postId === "string" && postId.length > 0;
  const status = payloadStatus(payload);
  const maxAttempts = status === "max_attempts_reached";

  if (payload.success === true && hasPostId && !maxAttempts) {
    return { ok: true, postId };
  }

  return status ? { ok: false, status } : { ok: false };
}
