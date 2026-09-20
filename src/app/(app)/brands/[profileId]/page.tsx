"use client";

import { use, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { BrandHome } from "@/components/brands/brand-home";
import { BrandTypographyProvider } from "@/components/brands/brand-typography-provider";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { getBrandProfile } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = use(params);
  const { setSelectedBrandProfileId, selectedBrandProfileId } =
    useBrandSelection();

  useEffect(() => {
    if (profileId && profileId !== selectedBrandProfileId) {
      setSelectedBrandProfileId(profileId);
    }
  }, [profileId, selectedBrandProfileId, setSelectedBrandProfileId]);

  const query = useQuery({
    queryKey: ["brand-profile", profileId],
    queryFn: () => getBrandProfile(profileId),
    enabled: Boolean(profileId),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading brand" variant="page-header" />;
  }

  if (query.isError || !query.data?.brand_profile) {
    return (
      <ErrorState
        message={USER_SAFE_ERROR_MESSAGE}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const profile = query.data.brand_profile;
  const promiseWarnings =
    query.data.promise_warnings ??
    profile.promise_warnings ??
    [];

  return (
    <BrandTypographyProvider profile={profile}>
      <BrandHome
        key={profile.id}
        profile={profile}
        promiseWarnings={promiseWarnings}
      />
    </BrandTypographyProvider>
  );
}
