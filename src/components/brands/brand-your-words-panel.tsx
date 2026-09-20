"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  addVoiceSample,
  getInterviewAnswers,
  getVoiceSamples,
  saveInterviewAnswers,
} from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { countYourWordsMaterial } from "@/lib/brands/brand-readiness";
import { INTERVIEW_QUESTIONS } from "@/lib/brands/interview-questions";
import { useUserId } from "@/lib/auth";
import { BrandInterviewTalkPanel } from "@/components/brands/brand-interview-talk-panel";
import type {
  BrandProfile,
  InterviewAnswerItem,
  InterviewAnswerSource,
} from "@/types/brand";

export function BrandYourWordsPanel({
  profile,
}: {
  profile: BrandProfile;
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileId = profile.id;

  const samplesQuery = useQuery({
    queryKey: ["brand-voice-samples", profileId, userId],
    queryFn: () => getVoiceSamples(profileId, userId!),
    enabled: Boolean(userId && profileId),
  });

  const answersQuery = useQuery({
    queryKey: ["brand-interview-answers", profileId, userId],
    queryFn: () => getInterviewAnswers(profileId, userId!),
    enabled: Boolean(userId && profileId),
  });

  const samples = samplesQuery.data?.voice_samples ?? [];
  const savedAnswers = answersQuery.data?.interview_answers ?? [];

  const initialAnswers = useMemo(() => {
    const byKey = new Map(
      savedAnswers.map((row) => [row.question_key, row.answer_text]),
    );
    return Object.fromEntries(
      INTERVIEW_QUESTIONS.map((question) => [
        question.key,
        byKey.get(question.key) ?? "",
      ]),
    ) as Record<string, string>;
  }, [savedAnswers]);

  const [pasteDraft, setPasteDraft] = useState("");
  const [answersDraft, setAnswersDraft] =
    useState<Record<string, string>>(initialAnswers);

  useEffect(() => {
    setAnswersDraft(initialAnswers);
  }, [initialAnswers]);

  const materialCount = countYourWordsMaterial(samples, savedAnswers);

  const pasteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const content = pasteDraft.trim();
      if (!content) {
        throw new Error("empty");
      }
      return addVoiceSample(profileId, userId, {
        source: "paste",
        content,
      });
    },
    onSuccess: async () => {
      setPasteDraft("");
      await queryClient.invalidateQueries({
        queryKey: ["brand-voice-samples", profileId],
      });
      toast.success("Caption saved");
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  const answersMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      const source: InterviewAnswerSource = "type";
      const answers: InterviewAnswerItem[] = INTERVIEW_QUESTIONS.map(
        (question) => ({
          question_key: question.key,
          question_text: question.label,
          answer_text: (answersDraft[question.key] ?? "").trim(),
          source,
        }),
      ).filter((item) => item.answer_text.length > 0);

      return saveInterviewAnswers(profileId, userId, { answers });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-interview-answers", profileId],
      });
      toast.success("Your answers are saved");
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  function onPasteSubmit(event: FormEvent) {
    event.preventDefault();
    pasteMutation.mutate();
  }

  function onAnswersSubmit(event: FormEvent) {
    event.preventDefault();
    answersMutation.mutate();
  }

  const isLoading = samplesQuery.isLoading || answersQuery.isLoading;

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading your words…</p>
    );
  }

  if (samplesQuery.isError || answersQuery.isError) {
    return (
      <p className="text-sm text-muted-foreground">
        We could not load your words. Try refreshing the page.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="text-lg font-medium">
          You stay the expert. We do the writing.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste real captions or answer a few sharp questions. We keep your
          wording as you wrote it.
        </p>
        {materialCount < 3 ? (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            Add at least three pastes or answers when you can. Draft unlocks
            later — for now this is about honesty, not volume.
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/80" role="status">
            You have enough here for us to know you. Open the Draft tab or
            Create to generate from this material.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste captions</CardTitle>
          <CardDescription>
            Three to ten real posts you have already written work best.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <form onSubmit={onPasteSubmit} className="flex flex-col gap-2">
            <Textarea
              value={pasteDraft}
              onChange={(event) => setPasteDraft(event.target.value)}
              placeholder="Paste one caption at a time"
              rows={4}
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={pasteMutation.isPending || !pasteDraft.trim()}
            >
              {pasteMutation.isPending ? "Saving…" : "Save this caption"}
            </Button>
          </form>
          {samples.length > 0 ? (
            <ul className="flex flex-col gap-2 border-t pt-3">
              {samples.map((sample) => (
                <li
                  key={sample.id}
                  className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap"
                >
                  <span className="mb-1 block text-xs text-muted-foreground">
                    {sample.source === "paste" ? "Paste" : "Transcript"}
                  </span>
                  {sample.content}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <BrandInterviewTalkPanel profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Answer in your own words</CardTitle>
          <CardDescription>
            After a voice sitting, your answers appear here — edit typos and
            anything the mic misheard, then Save answers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAnswersSubmit} className="flex flex-col gap-4">
            {INTERVIEW_QUESTIONS.map((question) => (
              <label
                key={question.key}
                className="flex flex-col gap-1 text-sm"
              >
                {question.label}
                <span className="text-xs font-normal text-muted-foreground">
                  {question.helper}
                </span>
                <Textarea
                  value={answersDraft[question.key] ?? ""}
                  onChange={(event) =>
                    setAnswersDraft((prev) => ({
                      ...prev,
                      [question.key]: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </label>
            ))}
            <Button type="submit" disabled={answersMutation.isPending || !userId}>
              {answersMutation.isPending ? "Saving…" : "Save answers"}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
