"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BrandDangerZone } from "@/components/brands/brand-danger-zone";
import { BrandDraftLockedPanel } from "@/components/brands/brand-draft-locked-panel";
import { BrandDraftPanel } from "@/components/brands/brand-draft-panel";
import { PageHeader } from "@/components/ux/page-header";
import { PageLayout } from "@/components/ux/page-layout";
import { cn } from "@/lib/utils";
import { BrandPromisePanel } from "@/components/brands/brand-promise-panel";
import { BrandYourWordsPanel } from "@/components/brands/brand-your-words-panel";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { deleteBrandProfile, getCorpusItems } from "@/lib/api/brands";
import {
  brandTabStatusDescription,
  countCorpusMaterial,
  deriveBrandSetupStatus,
  type BrandHomeTab,
} from "@/lib/brands/brand-readiness";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";

export function BrandHome({
  profile,
  promiseWarnings,
}: {
  profile: BrandProfile;
  promiseWarnings: string[];
}) {
  const userId = useUserId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const corpusQuery = useQuery({
    queryKey: ["brand-corpus-items", profile.id, userId],
    queryFn: () => getCorpusItems(profile.id, userId!),
    enabled: Boolean(userId),
  });

  const setupStatus = deriveBrandSetupStatus(
    {
      ...profile,
      promise_warnings: promiseWarnings,
    },
    corpusQuery.data?.corpus_items ?? [],
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteBrandProfile(profile.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-profiles"] });
      toast.success("Brand deleted");
      router.push("/brands");
    },
    onError: () => {
      toast.error("We couldn't delete this brand.");
    },
  });

  function onConfirmDelete() {
    deleteMutation.mutate();
  }

  const draftReady = setupStatus === "ready_to_draft";
  const defaultTab = draftReady ? "draft" : "promise";
  const tabParam = searchParams.get("tab");
  const activeTab: BrandHomeTab =
    tabParam === "words" || tabParam === "promise" || tabParam === "draft"
      ? tabParam === "draft" && !draftReady
        ? defaultTab
        : tabParam
      : defaultTab;

  const materialCount = countCorpusMaterial(
    corpusQuery.data?.corpus_items ?? [],
  );

  function onTabChange(value: string) {
    const tab = value as BrandHomeTab;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    params.delete("talk");
    router.replace(`/brands/${profile.id}?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <PageLayout width="studio">
      <PageHeader
        title={profile.business_name}
        titleClassName="brand-heading"
        description={brandTabStatusDescription(
          activeTab,
          setupStatus,
          materialCount,
        )}
      />

      <Tabs value={activeTab} onValueChange={onTabChange} className="gap-4">
        <TabsList
          className={cn(
            "surface-panel h-auto w-full justify-start gap-1 bg-transparent p-1 ring-0",
          )}
        >
          <TabsTrigger value="promise">Promise</TabsTrigger>
          <TabsTrigger value="words">Your words</TabsTrigger>
          <TabsTrigger value="draft" disabled={!draftReady}>
            Draft
          </TabsTrigger>
        </TabsList>
        <TabsContent value="promise">
          <BrandPromisePanel
            profile={profile}
            promiseWarnings={promiseWarnings}
          />
        </TabsContent>
        <TabsContent value="words">
          <BrandYourWordsPanel profile={profile} />
        </TabsContent>
        <TabsContent value="draft">
          {draftReady ? (
            <BrandDraftPanel profile={profile} />
          ) : (
            <BrandDraftLockedPanel profileId={profile.id} />
          )}
        </TabsContent>
      </Tabs>

      <BrandDangerZone
        brandName={profile.business_name}
        onConfirmDelete={onConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </PageLayout>
  );
}
