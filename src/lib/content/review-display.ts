export type ReviewDisplay = {
  approved?: boolean;
  reason?: string;
  issues: string[];
  suggestions: string[];
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function reviewDisplay(review: unknown): ReviewDisplay | null {
  if (!review || typeof review !== "object") {
    return null;
  }

  const record = review as Record<string, unknown>;
  const approved =
    typeof record.approved === "boolean" ? record.approved : undefined;
  const reason =
    typeof record.reason === "string" && record.reason.trim()
      ? record.reason
      : undefined;
  const issues = asStringList(record.issues);
  const suggestions = asStringList(record.suggestions);

  if (
    approved === undefined &&
    !reason &&
    issues.length === 0 &&
    suggestions.length === 0
  ) {
    return null;
  }

  return { approved, reason, issues, suggestions };
}
