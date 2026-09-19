"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { BrandForm } from "@/components/brands/brand-form";
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{profile.business_name}</h1>
      <BrandForm key={profile.id} profile={profile} />
    </div>
  );
}
