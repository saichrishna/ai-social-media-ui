"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DraftGeneratingStatus } from "@/components/content/draft-generating-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlatformRoom } from "@/components/ux/platform-room";
import { StudioSectionIntro } from "@/components/ux/studio-section-intro";
import {
  generateBrandDraft,
  getDraftTopics,
} from "@/lib/api/brand-dna";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useDraftGenerateFlow } from "@/lib/content/use-draft-generate-flow";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";
import { cn } from "@/lib/utils";

export function BrandDraftPanel({ profile }: { profile: BrandProfile }) {
  return <BrandDraftPanelInner key={profile.id} profile={profile} />;
}

function BrandDraftPanelInner({ profile }: { profile: BrandProfile }) {
  const userId = useUserId();
  const profileId = profile.id;
  const draftFlow = useDraftGenerateFlow({ userId, brandProfileId: profileId });

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");

  const topicsQuery = useQuery({
    queryKey: ["brand-draft-topics", profileId, userId],
    queryFn: () => getDraftTopics(profileId, userId!),
    enabled: Boolean(userId && profileId),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const trimmedTopic = topic.trim();
      draftFlow.markDraftingStarted({
        userId,
        brandProfileId: profileId,
        topic: trimmedTopic,
        platform,
        startedAtMs: Date.now(),
      });
      return generateBrandDraft(profileId, {
        user_id: userId,
        topic: trimmedTopic,
        platform,
        description: description.trim(),
      });
    },
    onSuccess: (payload) => {
      if (
        draftFlow.handleGenerateSuccess(payload, userId, {
          brandProfileId: profileId,
          topic: topic.trim(),
          platform,
        })
      ) {
        return;
      }
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
    onError: (error) => {
      const handled = draftFlow.handleGenerateError(error, userId, {
        brandProfileId: profileId,
        topic: topic.trim(),
        platform,
      });
      if (!handled) {
        toast.error(USER_SAFE_ERROR_MESSAGE);
      }
    },
  });

  const topics = topicsQuery.data?.topics ?? [];
  const ready = topicsQuery.data?.ready ?? false;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!topic.trim() || !ready) {
      return;
    }
    draftFlow.resetFlow();
    generateMutation.mutate();
  }

  if (draftFlow.phase === "drafting") {
    return <DraftGeneratingStatus phase="drafting" />;
  }
  if (draftFlow.phase === "still_generating") {
    return <DraftGeneratingStatus phase="still_generating" />;
  }
  if (draftFlow.phase === "poll_exhausted") {
    return (
      <div className="w-full">
        <DraftGeneratingStatus phase="poll_exhausted" />
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => draftFlow.resetFlow()}>
            Back to draft form
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <StudioSectionIntro
        title="Draft studio"
        titleClassName="brand-heading"
        description="One idea from your material. One room. We write as you—not generic filler."
      />

      {!ready ? (
        <p className="text-sm text-muted-foreground" role="status">
          Add at least three pastes or interview answers under Your words first.
        </p>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="grid gap-8 lg:grid-cols-2 lg:gap-10"
      >
        <div className="surface-panel flex flex-col gap-4 p-5">
          <h3 className="text-sm font-medium">From your material</h3>
          {topics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topics.map((chip) => (
                <Button
                  key={`${chip.source}-${chip.topic.slice(0, 40)}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto max-w-full whitespace-normal text-left"
                  onClick={() => setTopic(chip.topic)}
                >
                  {chip.topic}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add more under Your words to see topic chips here.
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm">
            Topic for this post
            <Input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="What you want to say"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Extra direction (optional)
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Angle or constraint for this draft"
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
            className={cn("w-full", !ready && "opacity-50")}
            disabled={
              !ready ||
              !topic.trim() ||
              generateMutation.isPending ||
              draftFlow.isBlocking ||
              !userId
            }
          >
            Write as me
          </Button>
        </div>
      </form>
    </div>
  );
}
