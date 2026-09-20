"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  clearPendingDraftGenerate,
  readPendingDraftGenerate,
  savePendingDraftGenerate,
  type PendingDraftGenerate,
} from "@/lib/content/draft-generate-pending";
import { isRecoverableGenerateError } from "@/lib/content/is-recoverable-generate-error";
import { pollForGeneratedPost } from "@/lib/content/poll-for-generated-post";
import { mapGenerateSocialContentResult } from "@/lib/content/map-generate-result";

export type DraftGenerateFlowPhase =
  | "idle"
  | "drafting"
  | "still_generating"
  | "poll_exhausted";

export type DraftGeneratePollCriteria = {
  brandProfileId: string;
  topic: string;
  platform: string;
};

type UseDraftGenerateFlowOptions = {
  userId?: string | null;
  brandProfileId?: string | null;
};

export function useDraftGenerateFlow(options: UseDraftGenerateFlowOptions = {}) {
  const { userId, brandProfileId } = options;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<DraftGenerateFlowPhase>("idle");
  const startedAtRef = useRef(0);
  const pollAbortRef = useRef<AbortController | null>(null);

  const finishWithPostId = useCallback(
    (postId: string) => {
      clearPendingDraftGenerate();
      void queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      router.push(`/content/${postId}`);
      setPhase("idle");
    },
    [queryClient, router],
  );

  const startPollingForPost = useCallback(
    (
      pollUserId: string,
      criteria: DraftGeneratePollCriteria,
      startedAtMs: number,
    ) => {
      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;
      startedAtRef.current = startedAtMs;
      setPhase("still_generating");

      void pollForGeneratedPost(
        pollUserId,
        {
          ...criteria,
          createdAfterMs: startedAtMs,
        },
        { signal: controller.signal },
      ).then((postId) => {
        if (controller.signal.aborted) {
          return;
        }
        if (postId) {
          finishWithPostId(postId);
          return;
        }
        setPhase("poll_exhausted");
      });
    },
    [finishWithPostId],
  );

  const resumePendingIfAny = useCallback(() => {
    const pending = readPendingDraftGenerate();
    if (!pending) {
      return;
    }
    if (brandProfileId && pending.brandProfileId !== brandProfileId) {
      return;
    }
    if (userId && pending.userId !== userId) {
      return;
    }
    startPollingForPost(
      pending.userId,
      {
        brandProfileId: pending.brandProfileId,
        topic: pending.topic,
        platform: pending.platform,
      },
      pending.startedAtMs,
    );
  }, [brandProfileId, startPollingForPost, userId]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      resumePendingIfAny();
    });
  }, [resumePendingIfAny]);

  const resetFlow = useCallback(() => {
    pollAbortRef.current?.abort();
    pollAbortRef.current = null;
    clearPendingDraftGenerate();
    setPhase("idle");
  }, []);

  const markDraftingStarted = useCallback(
    (pending: PendingDraftGenerate) => {
      startedAtRef.current = pending.startedAtMs;
      savePendingDraftGenerate(pending);
      setPhase("drafting");
    },
    [],
  );

  const handleGenerateSuccess = useCallback(
    (
      payload: Parameters<typeof mapGenerateSocialContentResult>[0],
      pollUserId: string | null | undefined,
      criteria: DraftGeneratePollCriteria,
    ) => {
      const mapped = mapGenerateSocialContentResult(payload);
      if (mapped.ok) {
        finishWithPostId(mapped.postId);
        return true;
      }
      if (pollUserId && startedAtRef.current > 0) {
        startPollingForPost(pollUserId, criteria, startedAtRef.current);
        return true;
      }
      setPhase("idle");
      return false;
    },
    [finishWithPostId, startPollingForPost],
  );

  const handleGenerateError = useCallback(
    (
      error: unknown,
      pollUserId: string | null | undefined,
      criteria: DraftGeneratePollCriteria,
    ) => {
      if (pollUserId && isRecoverableGenerateError(error)) {
        startPollingForPost(pollUserId, criteria, startedAtRef.current);
        return true;
      }
      if (!isRecoverableGenerateError(error)) {
        clearPendingDraftGenerate();
      }
      setPhase("idle");
      return false;
    },
    [startPollingForPost],
  );

  const isBlocking =
    phase === "drafting" ||
    phase === "still_generating" ||
    phase === "poll_exhausted";

  return {
    phase,
    isBlocking,
    markDraftingStarted,
    resetFlow,
    handleGenerateSuccess,
    handleGenerateError,
    resumePendingIfAny,
  };
}
