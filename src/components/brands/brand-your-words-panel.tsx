"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MicIcon } from "lucide-react";
import { toast } from "sonner";

import { BrandInterviewTalkPanel } from "@/components/brands/brand-interview-talk-panel";
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
import {
  countYourWordsMaterial,
  deriveBrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { INTERVIEW_QUESTIONS } from "@/lib/brands/interview-questions";
import { useUserId } from "@/lib/auth";
import type {
  BrandProfile,
  InterviewAnswerItem,
  InterviewAnswerSource,
} from "@/types/brand";
import { StudioSectionIntro } from "@/components/ux/studio-section-intro";
import { SURFACE_PANEL_CARD } from "@/lib/ux/surface-panel-card";
import { cn } from "@/lib/utils";

export function BrandYourWordsPanel({
  profile,
}: {
  profile: BrandProfile;
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileId = profile.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inTalkSession, setInTalkSession] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

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
  const savedAnswers = useMemo(
    () => answersQuery.data?.interview_answers ?? [],
    [answersQuery.data?.interview_answers],
  );

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

  const materialCount = countYourWordsMaterial(samples, savedAnswers);
  const draftReady =
    deriveBrandSetupStatus(profile, samples, savedAnswers) ===
    "ready_to_draft";

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

  function onPasteSubmit(event: FormEvent) {
    event.preventDefault();
    pasteMutation.mutate();
  }

  const isLoading = samplesQuery.isLoading || answersQuery.isLoading;
  const talkRequested = searchParams.get("talk") === "1";
  const showTalkSession =
    inTalkSession || (talkRequested && !isLoading);

  function exitTalkSession() {
    setInTalkSession(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("talk");
    params.set("tab", "words");
    const query = params.toString();
    router.replace(`/brands/${profileId}?${query}`, { scroll: false });
  }

  useEffect(() => {
    if (!showTalkSession) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showTalkSession]);

  if (showTalkSession && !isLoading) {
    return (
      <BrandInterviewTalkPanel profile={profile} onExit={exitTalkSession} />
    );
  }

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

  const draftTabHref = `/brands/${encodeURIComponent(profileId)}?tab=draft`;

  return (
    <div className="flex flex-col gap-8">
      {draftReady ? (
        <div
          className="surface-panel flex flex-col gap-3 border-[color-mix(in_oklch,var(--studio-accent-start),transparent_55%)] p-5 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div>
            <p className="text-sm font-medium">Draft is unlocked</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {materialCount} pieces in your corpus — we can write as you now.
            </p>
          </div>
          <Button asChild variant="studio" size="lg" className="shrink-0">
            <Link href={draftTabHref}>Open draft studio</Link>
          </Button>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <StudioSectionIntro
          title="You stay the expert. We do the writing."
          titleClassName="brand-heading"
          description="The fastest path is a full-screen talk session — about eight minutes, one question at a time. Paste or type work too."
          className="lg:py-2"
        >
          {materialCount < 3 ? (
            <p className="text-sm text-muted-foreground" role="status">
              <span className="font-medium text-foreground">
                {materialCount}/3
              </span>{" "}
              toward unlocking Draft.
            </p>
          ) : null}
        </StudioSectionIntro>

        <Card
          className={cn(
            SURFACE_PANEL_CARD,
            "overflow-hidden border-2 border-[color-mix(in_oklch,var(--studio-accent-start),transparent_70%)]",
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="brand-heading flex items-center gap-3 text-xl font-medium">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--studio-accent-start),var(--studio-accent-end))] text-white shadow-[var(--shadow-studio-glow)]">
                <MicIcon className="size-5" />
              </span>
              Talk session
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Full-screen, one question at a time. You control when each answer
              is saved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="studio"
              size="lg"
              className="w-full"
              onClick={() => setInTalkSession(true)}
            >
              Begin talk session
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-fit text-muted-foreground"
        onClick={() => setShowAlternatives((open) => !open)}
      >
        {showAlternatives
          ? "Hide paste and type options"
          : "I already have captions or prefer typing"}
      </Button>

      {showAlternatives ? (
        <>
          <Card className={cn(SURFACE_PANEL_CARD)}>
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

          <Card className={cn(SURFACE_PANEL_CARD)}>
            <CardHeader>
              <CardTitle className="text-base">Type the five questions</CardTitle>
              <CardDescription>
                Same questions as the talk — answer in your own words.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TypedInterviewAnswersForm
                key={`${profileId}-${answersQuery.dataUpdatedAt}`}
                profileId={profileId}
                userId={userId}
                initialAnswers={initialAnswers}
                onSaved={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["brand-interview-answers", profileId],
                  });
                }}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function TypedInterviewAnswersForm({
  profileId,
  userId,
  initialAnswers,
  onSaved,
}: {
  profileId: string;
  userId: string | null;
  initialAnswers: Record<string, string>;
  onSaved: () => void;
}) {
  const [answersDraft, setAnswersDraft] =
    useState<Record<string, string>>(initialAnswers);

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
      onSaved();
      toast.success("Your answers are saved");
    },
    onError: () => {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    },
  });

  function onAnswersSubmit(event: FormEvent) {
    event.preventDefault();
    answersMutation.mutate();
  }

  return (
    <form onSubmit={onAnswersSubmit} className="flex flex-col gap-4">
      {INTERVIEW_QUESTIONS.map((question) => (
        <label key={question.key} className="flex flex-col gap-1 text-sm">
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
  );
}
