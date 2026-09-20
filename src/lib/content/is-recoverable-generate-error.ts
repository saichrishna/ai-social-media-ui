import { ApiError } from "@/lib/api/client";

/** Client or gateway gave up while the backend may still be generating. */
export function isRecoverableGenerateError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.status === 0) {
    return true;
  }
  return error.status === 500 || error.status === 502 || error.status === 503 || error.status === 504;
}
