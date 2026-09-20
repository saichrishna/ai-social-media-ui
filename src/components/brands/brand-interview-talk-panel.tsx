"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  completeInterviewSession,
  getActiveInterviewSession,
  saveInterviewStepAnswer,
  startInterviewSession,
} from "@/lib/api/brand-dna";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { normalizeVoiceTranscript } from "@/lib/voice/normalize-transcript";
import {
  connectSmallWebRtc,
  type SmallWebRtcSession,
} from "@/lib/voice/small-webrtc";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";
import type { InterviewSession } from "@/types/brand-dna";

type VoiceMessage =
  | {
      type: "question";
      question_key?: string;
      question_text?: string;
      prep_brief?: string;
    }
  | { type: "question_transcript"; question_key?: string; text?: string }
  | { type: "all_questions_answered" }
  | { type: "session_closed"; message?: string }
  | { type: "error"; message?: string };

function backendOriginForSidecar(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_API_ORIGIN?.trim() ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

export function BrandInterviewTalkPanel({
  profile,
}: {
  profile: BrandProfile;
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileId = profile.id;

  const [coldOpen, setColdOpen] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [readAloud, setReadAloud] = useState(false);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [currentQuestionKey, setCurrentQuestionKey] = useState<string | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [prepBrief, setPrepBrief] = useState("");
  const [voiceDraft, setVoiceDraft] = useState("");
  const [talkStatus, setTalkStatus] = useState<string | null>(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [reviewSession, setReviewSession] = useState<InterviewSession | null>(
    null,
  );
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, string>>(
    {},
  );
  const [isFinishing, setIsFinishing] = useState(false);

  const rtcRef = useRef<SmallWebRtcSession | null>(null);
  const currentQuestionKeyRef = useRef<string | null>(null);

  useEffect(() => {
    currentQuestionKeyRef.current = currentQuestionKey;
  }, [currentQuestionKey]);

  const disconnect = useCallback(() => {
    rtcRef.current?.disconnect();
    rtcRef.current = null;
    setConnectionState("closed");
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sessionReady = Boolean(session?.id);
  const isLive =
    connectionState === "connected" || connectionState === "connecting";

  const activeQuestion = useMemo(() => {
    if (!session?.questions?.length) {
      return null;
    }
    return session.questions.find((q) => !q.answered) ?? null;
  }, [session]);

  const effectiveQuestionKey =
    currentQuestionKey ?? activeQuestion?.question_key ?? null;
  const effectiveQuestionText =
    currentQuestion || activeQuestion?.question_text || "";

  const canSaveStep =
    sessionReady &&
    Boolean(effectiveQuestionKey) &&
    !isSavingStep &&
    voiceDraft.trim().length > 0;

  const startMutation = useMutation({
    mutationFn: async (options?: { forceNew?: boolean }) => {
      if (!userId) {
        throw new Error("missing user");
      }
      const text = coldOpen.trim();
      if (!text) {
        throw new Error("empty cold open");
      }
      return startInterviewSession(profileId, userId, text, {
        forceNew: options?.forceNew,
      });
    },
    onSuccess: (data) => {
      setSession(data.interview_session);
      setPrepBrief(data.interview_session.prep_brief ?? "");
      const first = data.interview_session.questions?.find((q) => !q.answered);
      setCurrentQuestionKey(first?.question_key ?? null);
      setCurrentQuestion(first?.question_text ?? "");
      setVoiceDraft("");
      setReviewSession(null);
      setReviewDrafts({});
      const opened = (data.interview_session.transcript ?? "")
        .split("\n")[0]
        ?.trim();
      if (data.resumed && opened && opened !== coldOpen.trim()) {
        toast.message(
          "We resumed your earlier sitting — the prep below matches that cold open, not what you just typed.",
        );
      } else {
        toast.success("Session ready — you can start talking");
      }
    },
    onError: () => {
      toast.error(
        "Could not prepare questions. If Ollama is running, wait a minute and try again.",
      );
    },
  });

  async function refreshSavedWords() {
    await queryClient.invalidateQueries({
      queryKey: ["brand-voice-samples", profileId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["brand-interview-answers", profileId],
    });
  }

  function openReview(liveSession: InterviewSession) {
    const drafts: Record<string, string> = {};
    for (const q of liveSession.questions ?? []) {
      if (q.answered && q.question_key) {
        drafts[q.question_key] = q.answer_text ?? "";
      }
    }
    setReviewSession(liveSession);
    setReviewDrafts(drafts);
    setSession(liveSession);
    setCurrentQuestionKey(null);
    setCurrentQuestion("");
    setVoiceDraft("");
    disconnect();
    setTalkStatus("Review each answer — fix names and typos, then finish.");
  }

  async function finishReview() {
    if (!userId || !reviewSession) {
      return;
    }
    setIsFinishing(true);
    try {
      let latest = reviewSession;
      for (const q of reviewSession.questions ?? []) {
        const key = q.question_key;
        if (!key || !q.answered) {
          continue;
        }
        const text = normalizeVoiceTranscript(reviewDrafts[key] ?? "");
        if (!text) {
          continue;
        }
        const prior = (q.answer_text ?? "").trim();
        if (text === prior) {
          continue;
        }
        const result = await saveInterviewStepAnswer(
          profileId,
          reviewSession.id,
          userId,
          key,
          text,
          q.source === "audio" ? "audio" : "type",
        );
        if (result.interview_session) {
          latest = result.interview_session;
        }
      }

      const transcriptParts: string[] = [];
      const cold = (latest.transcript ?? coldOpen).trim().split("\n")[0]?.trim();
      if (cold) {
        transcriptParts.push(cold);
      }
      for (const q of latest.questions ?? []) {
        const ans = normalizeVoiceTranscript(reviewDrafts[q.question_key] ?? q.answer_text ?? "");
        if (!ans) {
          continue;
        }
        const label = q.question_text?.trim();
        transcriptParts.push(label ? `${label}\n${ans}` : ans);
      }

      await completeInterviewSession(
        profileId,
        latest.id,
        userId,
        transcriptParts.join("\n\n"),
      );
      setReviewSession(null);
      setReviewDrafts({});
      setSession(null);
      setTalkStatus("Saved.");
      await refreshSavedWords();
      toast.success("Saved to Your words — you can still edit below.");
    } catch {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    } finally {
      setIsFinishing(false);
    }
  }

  async function onSaveAndNextQuestion() {
    const questionKey = effectiveQuestionKey;
    if (!userId || !session || !questionKey) {
      return;
    }
    const text = normalizeVoiceTranscript(voiceDraft);
    if (!text) {
      toast.error("Say or type something for this question first.");
      return;
    }

    setIsSavingStep(true);
    try {
      const result = await saveInterviewStepAnswer(
        profileId,
        session.id,
        userId,
        questionKey,
        text,
        "audio",
      );
      const updated = result.interview_session;
      setSession(updated);
      setVoiceDraft("");

      const next = result.next_question as
        | { question_key?: string; question_text?: string }
        | undefined;

      if (next?.question_key) {
        setCurrentQuestionKey(next.question_key);
        setCurrentQuestion(next.question_text ?? "");
        setTalkStatus(
          "Saved. Answer the next question, then Save & next again.",
        );
        rtcRef.current?.sendAppMessage({
          type: "sync_question",
          question_key: next.question_key,
        });
      } else if (updated) {
        openReview(updated);
      }
    } catch {
      toast.error(USER_SAFE_ERROR_MESSAGE);
    } finally {
      setIsSavingStep(false);
    }
  }

  async function onConnectTalk() {
    if (!userId || !session) {
      return;
    }

    const active = await getActiveInterviewSession(profileId, userId);
    const live = active.interview_session;
    if (!live || live.status !== "in_progress") {
      toast.error(
        "No active interview. Use Prepare questions to start a new sitting.",
      );
      setSession(null);
      return;
    }
    setSession(live);
    const sessionId = live.id;
    const first = live.questions?.find((q) => !q.answered);
    setCurrentQuestionKey(first?.question_key ?? null);
    setCurrentQuestion(first?.question_text ?? "");
    setVoiceDraft("");

    disconnect();
    setTalkStatus("Connecting…");

    try {
      const rtc = await connectSmallWebRtc({
        requestData: {
          profile_id: profileId,
          session_id: sessionId,
          user_id: userId,
          backend_origin: backendOriginForSidecar(),
          read_questions_aloud: readAloud,
        },
        onConnectionState: setConnectionState,
        onMessage: (payload) => {
          const message = payload as VoiceMessage;
          if (message.type === "question") {
            setCurrentQuestionKey(message.question_key ?? null);
            setCurrentQuestion(message.question_text ?? "");
            if (message.prep_brief) {
              setPrepBrief(message.prep_brief);
            }
            setVoiceDraft("");
          }
          if (message.type === "question_transcript") {
            const key = message.question_key ?? null;
            if (key && key !== currentQuestionKeyRef.current) {
              return;
            }
            setVoiceDraft(message.text ?? "");
          }
          if (message.type === "all_questions_answered") {
            setTalkStatus("All questions saved in this sitting.");
          }
          if (message.type === "session_closed") {
            setTalkStatus(message.message ?? "Interview already finished.");
            setSession(null);
            disconnect();
          }
          if (message.type === "error") {
            toast.error(message.message ?? USER_SAFE_ERROR_MESSAGE);
          }
        },
      });
      rtcRef.current = rtc;
      setTalkStatus(
        "Speak your full answer to this question. Edit the text if needed, then Save & next.",
      );
    } catch {
      toast.error(
        "Could not connect. Is the voice server running on your machine?",
      );
      setTalkStatus(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Talk through it</CardTitle>
        <CardDescription>
          One question at a time. We capture what you say for that question
          only—you choose when to save and move on.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Cold open (one sentence we will not rewrite)
          <Textarea
            value={coldOpen}
            onChange={(event) => setColdOpen(event.target.value)}
            rows={2}
            disabled={startMutation.isPending || isLive}
            placeholder="What you wish people understood about your work"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={
              !userId || startMutation.isPending || !coldOpen.trim() || isLive
            }
            onClick={() => startMutation.mutate({ forceNew: false })}
          >
            {startMutation.isPending ? "Preparing…" : "Prepare questions"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={
              !userId || startMutation.isPending || !coldOpen.trim() || isLive
            }
            onClick={() => {
              disconnect();
              setTalkStatus(null);
              startMutation.mutate({ forceNew: true });
            }}
          >
            Start new sitting
          </Button>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={readAloud}
              onChange={(event) => setReadAloud(event.target.checked)}
              disabled={isLive}
            />
            Read questions aloud (when supported)
          </label>
        </div>

        {reviewSession ? (
          <div className="flex flex-col gap-4 rounded-md border bg-muted/20 p-4">
            <p className="text-sm font-medium">Review before we save</p>
            <p className="text-xs text-muted-foreground">
              Voice guesses words wrong sometimes. Fix anything that is not
              what you meant — we keep your wording, not a rewrite.
            </p>
            {(reviewSession.questions ?? [])
              .filter((q) => q.answered)
              .map((q) => (
                <label
                  key={q.question_key}
                  className="flex flex-col gap-1 text-sm"
                >
                  {q.question_text}
                  <Textarea
                    value={reviewDrafts[q.question_key] ?? ""}
                    onChange={(event) =>
                      setReviewDrafts((prev) => ({
                        ...prev,
                        [q.question_key]: event.target.value,
                      }))
                    }
                    rows={4}
                  />
                </label>
              ))}
            <Button
              type="button"
              disabled={isFinishing}
              onClick={() => void finishReview()}
            >
              {isFinishing ? "Saving…" : "Finish & save to Your words"}
            </Button>
          </div>
        ) : null}

        {prepBrief && !reviewSession ? (
          <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
            {prepBrief}
          </p>
        ) : null}

        {!reviewSession && effectiveQuestionText ? (
          <p className="text-sm font-medium">{effectiveQuestionText}</p>
        ) : null}

        {!reviewSession && sessionReady && effectiveQuestionKey ? (
          <label className="flex flex-col gap-1 text-sm">
            Transcript for this question (edit before saving)
            <Textarea
              value={voiceDraft}
              onChange={(event) => setVoiceDraft(event.target.value)}
              rows={4}
              placeholder="Talk while connected, or type here"
            />
          </label>
        ) : sessionReady ? (
          <p className="text-sm text-muted-foreground">
            No open questions in this sitting. Use Start new sitting.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!sessionReady || isLive || Boolean(reviewSession)}
            onClick={() => void onConnectTalk()}
          >
            Start talking
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!canSaveStep}
            onClick={() => void onSaveAndNextQuestion()}
          >
            {isSavingStep ? "Saving…" : "Save & next question"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!isLive}
            onClick={() => {
              disconnect();
              setTalkStatus("Disconnected.");
            }}
          >
            Stop mic
          </Button>
        </div>

        {talkStatus ? (
          <p className="text-xs text-muted-foreground" role="status">
            {talkStatus}
          </p>
        ) : null}

        {sessionReady && effectiveQuestionKey && !voiceDraft.trim() ? (
          <p className="text-xs text-muted-foreground">
            Save stays off until this box has text — speak with Start talking
            or type your answer.
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Voice only fills the box above. Nothing is split across questions
          until you click Save & next. Requires{" "}
          <code className="text-[0.7rem]">python voice_agent/bot.py -t webrtc --port 8765</code>.
        </p>
      </CardContent>
    </Card>
  );
}
