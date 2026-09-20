import type { BrandProfile } from "@/types/brand";
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
  samples: VoiceSample[],
  answers: InterviewAnswer[],
): BrandSetupStatus {
  if (!promiseIsComplete(profile)) {
    return "promise_incomplete";
  }
  const materialCount = countYourWordsMaterial(samples, answers);
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

export function listBrandSetupHint(profile: BrandProfile): string {
  if ((profile.promise_warnings?.length ?? 0) > 0) {
    return "Promise incomplete";
  }
  if (!profile.target_audience?.trim() || !profile.not_for?.trim()) {
    return "Promise incomplete";
  }
  return "Need your words";
}
