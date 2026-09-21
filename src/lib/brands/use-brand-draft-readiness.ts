import { useQuery } from "@tanstack/react-query";

import { getCorpusItems } from "@/lib/api/brands";
import {
  deriveBrandSetupStatus,
  type BrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";

export function useBrandDraftReadiness(profile: BrandProfile | null | undefined) {
  const userId = useUserId();
  const profileId = profile?.id;

  const corpusQuery = useQuery({
    queryKey: ["brand-corpus-items", profileId, userId],
    queryFn: () => getCorpusItems(profileId!, userId!),
    enabled: Boolean(userId && profileId),
  });

  const isLoading = corpusQuery.isLoading;

  let setupStatus: BrandSetupStatus = "promise_incomplete";
  if (profile && !isLoading) {
    setupStatus = deriveBrandSetupStatus(
      profile,
      corpusQuery.data?.corpus_items ?? [],
    );
  }

  return {
    setupStatus,
    draftReady: setupStatus === "ready_to_draft",
    isLoading,
  };
}
