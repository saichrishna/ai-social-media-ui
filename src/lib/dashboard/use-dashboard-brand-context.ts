"use client";

import { useQuery } from "@tanstack/react-query";

import { journeyStepFromStrip } from "@/components/ux/journey-stepper";
import { getCorpusItems } from "@/lib/api/brands";
import {
  brandSetupStatusLabel,
  countCorpusMaterial,
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

  const corpusQuery = useQuery({
    queryKey: ["brand-corpus-items", profileId, userId],
    queryFn: () => getCorpusItems(profileId!, userId!),
    enabled: Boolean(userId && profileId),
  });

  const corpusItems = corpusQuery.data?.corpus_items ?? [];

  const setupStatus = selectedBrand
    ? deriveBrandSetupStatus(selectedBrand, corpusItems)
    : null;

  const materialCount = countCorpusMaterial(corpusItems);
  const typography = selectedBrand
    ? deriveBrandTypography(selectedBrand)
    : null;

  const journeyActive =
    setupStatus !== null
      ? journeyStepFromStrip(activeJourneyStrip(setupStatus))
      : "promise";

  const readinessLoading = Boolean(profileId) && corpusQuery.isLoading;

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
