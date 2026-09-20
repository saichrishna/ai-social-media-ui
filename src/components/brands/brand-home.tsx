"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BrandDraftLockedPanel } from "@/components/brands/brand-draft-locked-panel";
import { BrandProgressStrip } from "@/components/brands/brand-progress-strip";
import { BrandPromisePanel } from "@/components/brands/brand-promise-panel";
import { BrandYourWordsPanel } from "@/components/brands/brand-your-words-panel";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  deleteBrandProfile,
  getInterviewAnswers,
  getVoiceSamples,
} from "@/lib/api/brands";
import {
  brandSetupStatusLabel,
  deriveBrandSetupStatus,
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
  const queryClient = useQueryClient();

  const samplesQuery = useQuery({
    queryKey: ["brand-voice-samples", profile.id, userId],
    queryFn: () => getVoiceSamples(profile.id, userId!),
    enabled: Boolean(userId),
  });

  const answersQuery = useQuery({
    queryKey: ["brand-interview-answers", profile.id, userId],
    queryFn: () => getInterviewAnswers(profile.id, userId!),
    enabled: Boolean(userId),
  });

  const setupStatus = deriveBrandSetupStatus(
    {
      ...profile,
      promise_warnings: promiseWarnings,
    },
    samplesQuery.data?.voice_samples ?? [],
    answersQuery.data?.interview_answers ?? [],
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

  function onDelete() {
    const confirmed = window.confirm(
      `Delete ${profile.business_name}? This cannot be undone.`,
    );
    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  const activeStripStep =
    setupStatus === "ready_to_draft" ? "Draft" : setupStatus === "need_your_words" ? "Words" : "Promise";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{profile.business_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {brandSetupStatusLabel(setupStatus)}
          </p>
        </div>
        <BrandProgressStrip activeStep={activeStripStep} />
      </div>

      <Tabs defaultValue="promise" className="gap-4">
        <TabsList>
          <TabsTrigger value="promise">Promise</TabsTrigger>
          <TabsTrigger value="words">Your words</TabsTrigger>
          <TabsTrigger value="draft" disabled>
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
          <BrandDraftLockedPanel />
        </TabsContent>
      </Tabs>

      <div className="mx-auto w-full max-w-2xl border-t pt-4">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteMutation.isPending}
          onClick={onDelete}
        >
          Delete brand
        </Button>
      </div>
    </div>
  );
}
