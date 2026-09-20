"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { DraftGeneratingStatus } from "@/components/content/draft-generating-status";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreatePageShell } from "@/app/(app)/create/create-page-shell";
import { PlatformRoom } from "@/components/ux/platform-room";
import { cn } from "@/lib/utils";
import { generateBrandDraft } from "@/lib/api/brand-dna";
import { useUserId } from "@/lib/auth";
import { useBrandDraftReadiness } from "@/lib/brands/use-brand-draft-readiness";
import { useBrandSelection } from "@/lib/brands/brand-selection-provider";
import { mapGenerateSocialContentResult } from "@/lib/content/map-generate-result";
import { isRecoverableGenerateError } from "@/lib/content/is-recoverable-generate-error";
import { useDraftGenerateFlow } from "@/lib/content/use-draft-generate-flow";

const CREATE_FAILURE_TITLE = "We couldn't create your post.";
const CREATE_FAILURE_DESCRIPTION =
  "Your request is safe. Please try again.";

export default function CreatePage() {
  const userId = useUserId();
  const {
    selectedBrandProfileId,
    selectedBrand,
    brands,
    isLoading: brandsLoading,
    isError: brandsError,
    refetch: refetchBrands,
  } = useBrandSelection();

  const { draftReady, setupStatus, isLoading: readinessLoading } =
    useBrandDraftReadiness(selectedBrand);

  const draftFlow = useDraftGenerateFlow({
    userId,
    brandProfileId: selectedBrandProfileId,
  });

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !selectedBrandProfileId) {
        throw new Error("missing brand or user");
      }
      const trimmedTopic = topic.trim();
      draftFlow.markDraftingStarted({
        userId,
        brandProfileId: selectedBrandProfileId,
        topic: trimmedTopic,
        platform,
        startedAtMs: Date.now(),
      });
      return generateBrandDraft(selectedBrandProfileId, {
        user_id: userId,
        topic: trimmedTopic,
        description: description.trim(),
        platform,
      });
    },
    onSuccess: (payload) => {
      if (
        draftFlow.handleGenerateSuccess(payload, userId, {
          brandProfileId: selectedBrandProfileId!,
          topic: topic.trim(),
          platform,
        })
      ) {
        return;
      }
      if (payload.status) {
        console.error("Generate failed with status:", payload.status);
      }
    },
    onError: (error) => {
      draftFlow.handleGenerateError(error, userId, {
        brandProfileId: selectedBrandProfileId!,
        topic: topic.trim(),
        platform,
      });
    },
  });

  if (!userId) {
    return null;
  }

  if (brandsLoading || readinessLoading) {
    return (
      <CreatePageShell>
        <LoadingState label="Loading brands" variant="form" />
      </CreatePageShell>
    );
  }

  if (brandsError) {
    return (
      <CreatePageShell>
        <ErrorState
          onRetry={() => {
            refetchBrands();
          }}
        />
      </CreatePageShell>
    );
  }

  if (brands.length === 0 || !selectedBrandProfileId) {
    return (
      <CreatePageShell>
        <EmptyState
          title="No brands yet"
          description="Add a brand so generated posts use the right voice and guidelines."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      </CreatePageShell>
    );
  }

  if (!draftReady) {
    const brandHref = `/brands/${encodeURIComponent(selectedBrandProfileId)}`;
    const hint =
      setupStatus === "promise_incomplete"
        ? "Finish Promise (who you help and who you are not for)."
        : "Add at least three pastes or answers under Your words.";

    return (
      <CreatePageShell>
        <EmptyState
          title="We need your words before we draft"
          description={`${hint} Then Create will use your promise and transcripts — not generic copy.`}
          action={{ href: brandHref, label: "Open brand" }}
        />
      </CreatePageShell>
    );
  }

  const mapped = generateMutation.data
    ? mapGenerateSocialContentResult(generateMutation.data)
    : null;
  const generateFailed =
    (generateMutation.isError &&
      !isRecoverableGenerateError(generateMutation.error)) ||
    (mapped !== null && !mapped.ok);

  if (draftFlow.phase === "drafting" || generateMutation.isPending) {
    return (
      <CreatePageShell>
        <DraftGeneratingStatus phase="drafting" />
      </CreatePageShell>
    );
  }

  if (draftFlow.phase === "still_generating") {
    return (
      <CreatePageShell>
        <DraftGeneratingStatus phase="still_generating" />
      </CreatePageShell>
    );
  }

  if (draftFlow.phase === "poll_exhausted") {
    return (
      <CreatePageShell>
        <DraftGeneratingStatus phase="poll_exhausted" />
        <Button type="button" variant="outline" onClick={() => draftFlow.resetFlow()}>
          Back to form
        </Button>
      </CreatePageShell>
    );
  }

  return (
    <CreatePageShell
      description={
        <>
          Drafts use your promise and Your words.{" "}
          <Link
            href={`/brands/${encodeURIComponent(selectedBrandProfileId)}`}
            className="underline underline-offset-2"
          >
            Edit material on the brand page
          </Link>
          .
        </>
      }
    >
      {generateFailed ? (
        <ErrorState
          message={CREATE_FAILURE_TITLE}
          description={CREATE_FAILURE_DESCRIPTION}
          onRetry={() => {
            generateMutation.mutate();
          }}
        />
      ) : null}

      <form
        className="grid gap-8 lg:grid-cols-2 lg:gap-10"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (!topic.trim()) {
            return;
          }
          draftFlow.resetFlow();
          generateMutation.reset();
          generateMutation.mutate();
        }}
      >
        <div className="surface-panel flex flex-col gap-4 p-5">
          <h2 className="type-section text-base">What to say</h2>
          <label className="flex flex-col gap-1 text-sm">
            Topic for this post
            <Input
              required
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What you want to say"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Extra direction (optional)
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Angle or constraint for this draft"
              rows={3}
            />
          </label>
        </div>

        <div className="flex flex-col gap-6">
          <div className="surface-panel p-5">
            <PlatformRoom value={platform} onChange={setPlatform} />
          </div>
          <Button
            type="submit"
            variant="studio"
            size="lg"
            className={cn("w-full")}
            disabled={!topic.trim() || generateMutation.isPending}
          >
            Write as me
          </Button>
        </div>
      </form>
    </CreatePageShell>
  );
}
