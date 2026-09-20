"use client";

import { useQuery } from "@tanstack/react-query";

import { journeyStepFromStrip } from "@/components/ux/journey-stepper";
import { getInterviewAnswers, getVoiceSamples } from "@/lib/api/brands";
import {
  brandSetupStatusLabel,
  countYourWordsMaterial,
  deriveBrandSetupStatus,
  type BrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import { deriveBrandTypography } from "@/lib/brands/derive-brand-typography";
import { useUserId } from "@/lib/auth";

function activeJourneyStrip(
  status: BrandSetupStatus,
): "Promise" | "Words" | "Draft" {
  if (status === "ready_to_draft") {
    return "Draft";
  }
  if (status === "need_your_words") {
    return "Words";
  }
  return "Promise";
}

export function useDashboardBrandContext() {
  const userId = useUserId();
  const { selectedBrand, selectedBrandProfileId, brands, isLoading: brandsLoading } =
    useBrandSelection();

  const profileId = selectedBrandProfileId;

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

  const samples = samplesQuery.data?.voice_samples ?? [];
  const answers = answersQuery.data?.interview_answers ?? [];

  const setupStatus = selectedBrand
    ? deriveBrandSetupStatus(selectedBrand, samples, answers)
    : null;

  const materialCount = countYourWordsMaterial(samples, answers);
  const typography = selectedBrand
    ? deriveBrandTypography(selectedBrand)
    : null;

  const journeyActive =
    setupStatus !== null
      ? journeyStepFromStrip(activeJourneyStrip(setupStatus))
      : "promise";

  const readinessLoading =
    Boolean(profileId) &&
    (samplesQuery.isLoading || answersQuery.isLoading);

  return {
    brands,
    brandsLoading,
    selectedBrand,
    profileId,
    setupStatus,
    setupLabel: setupStatus ? brandSetupStatusLabel(setupStatus) : null,
    materialCount,
    materialTarget: 3,
    draftReady: setupStatus === "ready_to_draft",
    journeyActive,
    typography,
    readinessLoading,
  };
}
