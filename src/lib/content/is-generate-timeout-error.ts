import { ApiError } from "@/lib/api/client";

/** Client aborted the fetch (timeout) before the backend finished. */
export function isGenerateTimeoutError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0;
}
