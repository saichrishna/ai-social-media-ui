"use client";

import {
  ArrowLeftIcon,
  MicIcon,
  MicOffIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceWaveform } from "@/components/brands/talk-session/voice-waveform";
import { cn } from "@/lib/utils";
import type { InterviewSession } from "@/types/brand-dna";

export type TalkPhase = "lobby" | "prep" | "live" | "review";

function questionProgress(session: InterviewSession | null): {
  answered: number;
  total: number;
  label: string;
} {
  const questions = session?.questions ?? [];
  const total = questions.length;
  const answered = questions.filter((q) => q.answered).length;
  if (total === 0) {
    return { answered: 0, total: 0, label: "Getting ready" };
  }
  return {
    answered,
    total,
    label: `${answered} of ${total} answered`,
  };
}

export function TalkSessionView({
  brandName,
  sessionVariant = "full",
  phase,
  coldOpen,
  onColdOpenChange,
  prepBrief,
  questionText,
  voiceDraft,
  onVoiceDraftChange,
  talkStatus,
  connectionState,
  readAloud,
  onReadAloudChange,
  reviewSession,
  reviewDrafts,
  onReviewDraftChange,
  session,
  isPreparing,
  isSavingStep,
  isFinishing,
  canSaveStep,
  sessionReady,
  onExit,
  onPrepare,
  onStartNewSitting,
  onConnectTalk,
  onSaveAndNext,
  onStopMic,
  onFinishReview,
}: {
  brandName: string;
  sessionVariant?: "full" | "mini";
  phase: TalkPhase;
  coldOpen: string;
  onColdOpenChange: (value: string) => void;
  prepBrief: string;
  questionText: string;
  voiceDraft: string;
  onVoiceDraftChange: (value: string) => void;
  talkStatus: string | null;
  connectionState: RTCPeerConnectionState;
  readAloud: boolean;
  onReadAloudChange: (value: boolean) => void;
  reviewSession: InterviewSession | null;
  reviewDrafts: Record<string, string>;
  onReviewDraftChange: (key: string, value: string) => void;
  session: InterviewSession | null;
  isPreparing: boolean;
  isSavingStep: boolean;
  isFinishing: boolean;
  canSaveStep: boolean;
  sessionReady: boolean;
  onExit: () => void;
  onPrepare: () => void;
  onStartNewSitting: () => void;
  onConnectTalk: () => void;
  onSaveAndNext: () => void;
  onStopMic: () => void;
  onFinishReview: () => void;
}) {
  const progress = questionProgress(reviewSession ?? session);
  const isLive = phase === "live";
  const progressPct =
    progress.total > 0 ? (progress.answered / progress.total) * 100 : 0;

  return (
    <div
      className="app-canvas fixed inset-0 z-50 flex flex-col"
      data-zone="studio"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="gap-1"
        >
          <ArrowLeftIcon className="size-4" />
          Your words
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-medium">{brandName}</p>
          <p className="text-xs text-muted-foreground">{progress.label}</p>
        </div>
        <div className="w-24">
          {progress.total > 0 ? (
            <div
              className="h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress.answered}
              aria-valuemin={0}
              aria-valuemax={progress.total}
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--studio-accent-start),var(--studio-accent-end))] transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          ) : null}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        {phase === "lobby" ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--studio-accent-start),var(--studio-accent-end))] text-white">
                <MicIcon className="size-7" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {sessionVariant === "mini" ? "Mini talk" : "Talk session"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {sessionVariant === "mini"
                  ? "One or two quick questions. Save each answer to your corpus."
                  : "About eight minutes. One question at a time. You save each answer when it feels complete."}
              </p>
            </div>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">Cold open</span>
              <span className="text-muted-foreground">
                One sentence we will not rewrite — how you&apos;d explain what
                you do to a friend.
              </span>
              <Textarea
                value={coldOpen}
                onChange={(event) => onColdOpenChange(event.target.value)}
                rows={3}
                disabled={isPreparing}
                placeholder="What you wish people understood about your work"
                className="min-h-[88px] text-base"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={readAloud}
                onChange={(event) => onReadAloudChange(event.target.checked)}
              />
              Read questions aloud when supported
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="studio"
                size="lg"
                className="flex-1"
                disabled={!coldOpen.trim() || isPreparing}
                onClick={onPrepare}
              >
                {isPreparing ? "Preparing your questions…" : "Prepare session"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={!coldOpen.trim() || isPreparing}
                onClick={onStartNewSitting}
              >
                Fresh sitting
              </Button>
            </div>
          </div>
        ) : null}

        {phase === "review" && reviewSession ? (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Review your words</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Fix names, numbers, and anything the mic misheard. We keep your
                wording — not a marketing rewrite.
              </p>
            </div>
            {(reviewSession.questions ?? [])
              .filter((q) => q.answered)
              .map((q, index) => (
                <div
                  key={q.question_key}
                  className="surface-panel flex flex-col gap-2 rounded-xl p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Question {index + 1}
                  </p>
                  <p className="text-sm font-medium">{q.question_text}</p>
                  <Textarea
                    value={reviewDrafts[q.question_key] ?? ""}
                    onChange={(event) =>
                      onReviewDraftChange(q.question_key, event.target.value)
                    }
                    rows={5}
                    className="min-h-[120px] text-base"
                  />
                </div>
              ))}
            <Button
              type="button"
              variant="studio"
              size="lg"
              disabled={isFinishing}
              onClick={onFinishReview}
            >
              {isFinishing ? "Saving…" : "Finish & save to Your words"}
            </Button>
          </div>
        ) : null}

        {(phase === "prep" || phase === "live") && !reviewSession ? (
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
            {prepBrief ? (
              <div className="surface-panel rounded-xl p-4">
                <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <SparklesIcon className="size-3.5" />
                  What we heard
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {prepBrief}
                </p>
              </div>
            ) : null}

            {questionText ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Your question
                </p>
                <p className="text-xl font-semibold leading-snug md:text-2xl">
                  {questionText}
                </p>
              </div>
            ) : null}

            <VoiceWaveform
              active={isLive && connectionState === "connected"}
              className={cn(
                "rounded-xl border border-dashed py-4",
                isLive ? "border-[color-mix(in_oklch,var(--studio-accent-start),transparent_60%)]" : "border-border",
              )}
            />

            <label className="flex min-h-0 flex-1 flex-col gap-2 text-sm">
              <span className="font-medium">Your answer</span>
              <span className="text-muted-foreground">
                Speak after connecting, or type here. Edit before you save.
              </span>
              <Textarea
                value={voiceDraft}
                onChange={(event) => onVoiceDraftChange(event.target.value)}
                rows={8}
                placeholder={
                  isLive
                    ? "Your words appear here as you talk…"
                    : "Connect the mic or type your answer"
                }
                className="min-h-[160px] flex-1 resize-y text-base leading-relaxed md:min-h-[200px]"
              />
            </label>

            {talkStatus ? (
              <p className="text-sm text-muted-foreground" role="status">
                {talkStatus}
              </p>
            ) : null}

            {!voiceDraft.trim() && sessionReady ? (
              <p className="text-xs text-muted-foreground">
                Save unlocks once this box has text.
              </p>
            ) : null}
          </div>
        ) : null}
      </main>

      {(phase === "prep" || phase === "live") && !reviewSession ? (
        <footer className="shrink-0 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {!isLive ? (
                <Button
                  type="button"
                  variant="studio"
                  size="lg"
                  disabled={!sessionReady}
                  onClick={onConnectTalk}
                  className="gap-2"
                >
                  <MicIcon className="size-4" />
                  Start talking
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onStopMic}
                  className="gap-2"
                >
                  <MicOffIcon className="size-4" />
                  Stop mic
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={!canSaveStep}
              onClick={onSaveAndNext}
            >
              {isSavingStep ? "Saving…" : "Save & next question"}
            </Button>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
