"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

import { BrandSelector } from "@/components/brands/brand-selector";
import { DraftGeneratingStatus } from "@/components/content/draft-generating-status";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
          brandProfileId: selectedBrandProfileId,
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
    return <LoadingState label="Loading brands" />;
  }

  if (brandsError) {
    return (
      <ErrorState
        onRetry={() => {
          refetchBrands();
        }}
      />
    );
  }

  if (brands.length === 0 || !selectedBrandProfileId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <EmptyState
          title="No brands yet"
          description="Add a brand so generated posts use the right voice and guidelines."
          action={{ href: "/brands/new", label: "Add Brand" }}
        />
      </div>
    );
  }

  if (!draftReady) {
    const brandHref = `/brands/${encodeURIComponent(selectedBrandProfileId)}`;
    const hint =
      setupStatus === "promise_incomplete"
        ? "Finish Promise (who you help and who you are not for)."
        : "Add at least three pastes or answers under Your words.";

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <BrandSelector />
        <EmptyState
          title="We need your words before we draft"
          description={`${hint} Then Create will use your promise and transcripts — not generic copy.`}
          action={{ href: brandHref, label: "Open brand" }}
        />
      </div>
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
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <DraftGeneratingStatus phase="drafting" />
      </div>
    );
  }

  if (draftFlow.phase === "still_generating") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <DraftGeneratingStatus phase="still_generating" />
      </div>
    );
  }

  if (draftFlow.phase === "poll_exhausted") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-2xl font-semibold">Create Content</h1>
        <DraftGeneratingStatus phase="poll_exhausted" />
        <Button type="button" variant="outline" onClick={() => draftFlow.resetFlow()}>
          Back to form
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Create Content</h1>
      <p className="text-sm text-muted-foreground">
        Drafts use your promise and Your words corpus.{" "}
        <Link
          href={`/brands/${encodeURIComponent(selectedBrandProfileId)}`}
          className="underline underline-offset-2"
        >
          Edit material on the brand page
        </Link>
        .
      </p>

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
        className="flex flex-col gap-4"
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
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Brand</span>
          <BrandSelector />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">What do you want to post about?</span>
          <Input
            required
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Summer biryani promotion"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Additional instructions (optional)
          </span>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Make it authentic and suitable for families..."
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Platform</span>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full" aria-label="Platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!topic.trim()}>
          Generate
        </Button>
      </form>
    </div>
  );
}
