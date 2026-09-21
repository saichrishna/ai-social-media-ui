import { addVoiceSample } from "@/lib/api/brands";

const MIN_EDIT_LENGTH = 40;

function normalizeForCompare(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function captionEditIsMeaningful(
  before: string | null | undefined,
  after: string | null | undefined,
): boolean {
  const prior = normalizeForCompare(before ?? "");
  const next = normalizeForCompare(after ?? "");
  if (!next || next.length < MIN_EDIT_LENGTH) {
    return false;
  }
  if (prior === next) {
    return false;
  }
  if (prior && next.startsWith(prior)) {
    return next.length - prior.length >= 24;
  }
  return true;
}

export async function maybeAddEditToCorpus(input: {
  brandProfileId: string;
  userId: string;
  beforeCaption: string | null | undefined;
  afterCaption: string | null | undefined;
}): Promise<boolean> {
  if (
    !captionEditIsMeaningful(input.beforeCaption, input.afterCaption)
  ) {
    return false;
  }
  const text = normalizeForCompare(input.afterCaption ?? "");
  await addVoiceSample(input.brandProfileId, input.userId, {
    source: "studio_edit",
    content: `[How I actually say it]\n${text.slice(0, 2000)}`,
  });
  return true;
}
