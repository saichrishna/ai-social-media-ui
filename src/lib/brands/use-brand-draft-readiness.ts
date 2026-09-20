import { useQuery } from "@tanstack/react-query";

import { getInterviewAnswers, getVoiceSamples } from "@/lib/api/brands";
import {
  deriveBrandSetupStatus,
  type BrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";

export function useBrandDraftReadiness(profile: BrandProfile | null | undefined) {
  const userId = useUserId();
  const profileId = profile?.id;

  const samplesQuery = useQuery({
    queryKey: ["brand-voice-samples", profileId, userId],
    queryFn: () => getVoiceSamples(profileId!, userId!),
    enabled: Boolean(userId && profileId),
  });

  const answersQuery = useQuery({
    queryKey: ["brand-interview-answers", profileId, userId],
    queryFn: () => getInterviewAnswers(profileId!, userId!),
    enabled: Boolean(userId && profileId),
  });

  const isLoading = samplesQuery.isLoading || answersQuery.isLoading;

  let setupStatus: BrandSetupStatus = "promise_incomplete";
  if (profile && !isLoading) {
    setupStatus = deriveBrandSetupStatus(
      profile,
      samplesQuery.data?.voice_samples ?? [],
      answersQuery.data?.interview_answers ?? [],
    );
  }

  return {
    setupStatus,
    draftReady: setupStatus === "ready_to_draft",
    isLoading,
  };
}
