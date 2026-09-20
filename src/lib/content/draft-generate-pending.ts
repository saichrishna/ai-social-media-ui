export type PendingDraftGenerate = {
  userId: string;
  brandProfileId: string;
  topic: string;
  platform: string;
  startedAtMs: number;
};

const STORAGE_KEY = "ai-social-pending-draft-generate";
const MAX_AGE_MS = 20 * 60 * 1000;

export function savePendingDraftGenerate(pending: PendingDraftGenerate): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // ignore quota / private mode
  }
}

export function clearPendingDraftGenerate(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function readPendingDraftGenerate(): PendingDraftGenerate | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PendingDraftGenerate;
    if (
      !parsed?.userId ||
      !parsed?.brandProfileId ||
      !parsed?.topic ||
      !parsed?.platform ||
      !parsed?.startedAtMs
    ) {
      return null;
    }
    if (Date.now() - parsed.startedAtMs > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
