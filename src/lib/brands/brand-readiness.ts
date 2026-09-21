import type { BrandProfile } from "@/types/brand";
import type { CorpusItem } from "@/types/brand";
import type { InterviewAnswer } from "@/types/brand";
import type { VoiceSample } from "@/types/brand";

export type BrandSetupStatus =
  | "promise_incomplete"
  | "need_your_words"
  | "ready_to_draft";

export function promiseIsComplete(profile: BrandProfile): boolean {
  const warnings = profile.promise_warnings ?? [];
  if (warnings.length > 0) {
    return false;
  }
  return Boolean(
    profile.target_audience?.trim() && profile.not_for?.trim(),
  );
}

export function countCorpusMaterial(items: CorpusItem[]): number {
  return items.filter((item) => item.content?.trim()).length;
}

/** @deprecated Use corpus items — kept for tests migrating off dual-store counts. */
export function countYourWordsMaterial(
  samples: VoiceSample[],
  answers: InterviewAnswer[],
): number {
  const pasteSamples = samples.filter(
    (sample) => sample.source === "paste" && sample.content?.trim(),
  ).length;
  const filledAnswers = answers.filter((answer) =>
    answer.answer_text?.trim(),
  ).length;
  return pasteSamples + filledAnswers;
}

export function deriveBrandSetupStatus(
  profile: BrandProfile,
  corpusItems: CorpusItem[],
): BrandSetupStatus {
  if (!promiseIsComplete(profile)) {
    return "promise_incomplete";
  }
  const materialCount = countCorpusMaterial(corpusItems);
  if (materialCount < 3) {
    return "need_your_words";
  }
  return "ready_to_draft";
}

export function brandSetupStatusLabel(status: BrandSetupStatus): string {
  switch (status) {
    case "promise_incomplete":
      return "Promise incomplete";
    case "need_your_words":
      return "Need your words";
    case "ready_to_draft":
      return "Ready to draft";
  }
}

export type BrandHomeTab = "promise" | "words" | "draft";

/** Subtitle under brand title — matches the active tab, not only global setup status. */
export function brandTabStatusDescription(
  tab: BrandHomeTab,
  setupStatus: BrandSetupStatus,
  materialCount: number,
): string {
  if (tab === "promise") {
    if (setupStatus === "promise_incomplete") {
      return "Who you help and who you are not for — save when this feels honest.";
    }
    return "Promise is set. Your words and draft build on this.";
  }

  if (tab === "words") {
    if (setupStatus === "promise_incomplete") {
      return "Finish Promise first — then capture what only you would say.";
    }
    if (materialCount < 3) {
      const remaining = 3 - materialCount;
      return `Your words · ${materialCount} saved · ${remaining} more to unlock Draft`;
    }
    return "Your words · corpus ready — add more anytime or open Draft";
  }

  if (setupStatus !== "ready_to_draft") {
    return "Draft unlocks after Promise and at least three pastes or answers.";
  }
  return "Draft · write as you from your material and pick the room";
}

export function listBrandSetupHint(profile: BrandProfile): string {
  if ((profile.promise_warnings?.length ?? 0) > 0) {
    return "Promise incomplete";
  }
  if (!profile.target_audience?.trim() || !profile.not_for?.trim()) {
    return "Promise incomplete";
  }
  return "Need your words";
}

/** List cards only — never claim "ready to draft" without voice material counts. */
export function deriveListBrandSetupStatus(
  profile: BrandProfile,
): BrandSetupStatus {
  if (!promiseIsComplete(profile)) {
    return "promise_incomplete";
  }
  return "need_your_words";
}
