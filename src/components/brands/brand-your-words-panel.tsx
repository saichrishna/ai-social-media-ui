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
  getCorpusItems,
  saveInterviewAnswers,
} from "@/lib/api/brands";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import {
  countCorpusMaterial,
  deriveBrandSetupStatus,
} from "@/lib/brands/brand-readiness";
import { corpusSourceLabel } from "@/lib/brands/corpus-label";
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

  const corpusQuery = useQuery({
    queryKey: ["brand-corpus-items", profileId, userId],
    queryFn: () => getCorpusItems(profileId, userId!),
    enabled: Boolean(userId && profileId),
  });

  const corpusItems = corpusQuery.data?.corpus_items ?? [];

  const initialAnswers = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const item of corpusItems) {
      const theme = item.theme?.trim();
      if (!theme || byKey.has(theme)) {
        continue;
      }
      byKey.set(theme, item.content);
    }
    return Object.fromEntries(
      INTERVIEW_QUESTIONS.map((question) => [
        question.key,
        byKey.get(question.key) ?? "",
      ]),
    ) as Record<string, string>;
  }, [corpusItems]);

  const [pasteDraft, setPasteDraft] = useState("");

  const materialCount = countCorpusMaterial(corpusItems);
  const draftReady =
    deriveBrandSetupStatus(profile, corpusItems) === "ready_to_draft";

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
        queryKey: ["brand-corpus-items", profileId],
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

  const isLoading = corpusQuery.isLoading;
  const talkParam = searchParams.get("talk");
  const talkMode: "full" | "mini" =
    talkParam === "mini" ? "mini" : "full";
  const talkRequested = talkParam === "1" || talkParam === "mini";
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
      <BrandInterviewTalkPanel
        profile={profile}
        mode={talkMode}
        onExit={exitTalkSession}
      />
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading your words…</p>
    );
  }

  if (corpusQuery.isError) {
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

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <StudioSectionIntro
          title="You stay the expert. We do the writing."
          titleClassName="brand-heading"
          description={
            draftReady
              ? "Add more anytime. Mini talk is for random thoughts; full sitting goes deeper."
              : "Start with full talk (~8 minutes) or paste until Draft unlocks."
          }
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

        <div className="flex flex-col gap-3">
          <Card
            className={cn(
              SURFACE_PANEL_CARD,
              "overflow-hidden",
              draftReady &&
                "border-2 border-[color-mix(in_oklch,var(--studio-accent-start),transparent_70%)]",
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="brand-heading flex items-center gap-3 text-xl font-medium">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--studio-accent-start),var(--studio-accent-end))] text-white shadow-[var(--shadow-studio-glow)]">
                  <MicIcon className="size-5" />
                </span>
                {draftReady ? "Mini talk" : "Full talk"}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {draftReady
                  ? "One or two questions, under two minutes — saves to your corpus."
                  : "Full-screen, one question at a time. Best for your first corpus."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="studio"
                size="lg"
                className="w-full"
                onClick={() => {
                  if (draftReady) {
                    const params = new URLSearchParams(
                      searchParams.toString(),
                    );
                    params.set("tab", "words");
                    params.set("talk", "mini");
                    router.replace(
                      `/brands/${profileId}?${params.toString()}`,
                      { scroll: false },
                    );
                  } else {
                    setInTalkSession(true);
                  }
                }}
              >
                {draftReady ? "Tell us something" : "Begin full talk"}
              </Button>
            </CardContent>
          </Card>

          {draftReady ? (
            <Card className={cn(SURFACE_PANEL_CARD, "overflow-hidden")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Full sitting
                </CardTitle>
                <CardDescription className="text-sm">
                  ~8 minutes when you want a deeper capture session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setInTalkSession(true)}
                >
                  Begin full talk
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {corpusItems.length > 0 ? (
        <section aria-label="Saved captures" className="flex flex-col gap-3">
          <h3 className="type-section text-base">Your corpus</h3>
          <ul className="flex flex-col gap-2">
            {corpusItems.map((item) => (
              <li
                key={item.id}
                className="surface-panel p-4 text-sm ring-0 whitespace-pre-wrap"
              >
                <span className="mb-1 block text-xs text-muted-foreground">
                  {corpusSourceLabel(item.source)}
                  {item.theme ? ` · ${item.theme.replace(/_/g, " ")}` : ""}
                </span>
                {item.content}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
                key={`${profileId}-${corpusQuery.dataUpdatedAt}`}
                profileId={profileId}
                userId={userId}
                initialAnswers={initialAnswers}
                onSaved={() => {
                  void queryClient.invalidateQueries({
                    queryKey: ["brand-corpus-items", profileId],
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
