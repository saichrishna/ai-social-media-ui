"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { BrandHome } from "@/components/brands/brand-home";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { getBrandProfile } from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = use(params);
  const query = useQuery({
    queryKey: ["brand-profile", profileId],
    queryFn: () => getBrandProfile(profileId),
    enabled: Boolean(profileId),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading brand" />;
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
    <BrandHome profile={profile} promiseWarnings={promiseWarnings} />
  );
}
