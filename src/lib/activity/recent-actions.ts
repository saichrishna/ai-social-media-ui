export type RecentActionKind =
  | "content_studio"
  | "create"
  | "calendar"
  | "brand_words"
  | "brand_promise"
  | "talk";

export type RecentAction = {
  kind: RecentActionKind;
  href: string;
  label: string;
  at: number;
};

const STORAGE_KEY = "aa_recent_actions_v1";
const MAX_ITEMS = 8;

function readAll(): RecentAction[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentAction[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        item &&
        typeof item.href === "string" &&
        typeof item.label === "string" &&
        typeof item.at === "number",
    );
  } catch {
    return [];
  }
}

function writeAll(items: RecentAction[]) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_ITEMS)),
  );
}

export function recordRecentAction(
  action: Omit<RecentAction, "at"> & { at?: number },
) {
  const entry: RecentAction = {
    ...action,
    at: action.at ?? Date.now(),
  };
  const withoutDup = readAll().filter(
    (item) => item.href !== entry.href || item.kind !== entry.kind,
  );
  writeAll([entry, ...withoutDup]);
}

export function getRecentActions(limit = 3): RecentAction[] {
  return readAll()
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}

export function getLastContentStudioPostId(): string | null {
  const match = readAll().find((item) => item.kind === "content_studio");
  if (!match) {
    return null;
  }
  const parts = match.href.split("/");
  return parts[parts.length - 1] || null;
}
