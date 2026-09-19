function envBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return defaultValue;
}

export const flags = {
  social_publishing: envBoolean(
    process.env.NEXT_PUBLIC_SOCIAL_PUBLISHING,
    false,
  ),
} as const;
