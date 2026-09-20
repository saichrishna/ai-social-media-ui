"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  TalkSessionView,
  type TalkPhase,
} from "@/components/brands/talk-session/talk-session-view";
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
  onExit,
}: {
  profile: BrandProfile;
  onExit: () => void;
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

  const phase: TalkPhase = reviewSession
    ? "review"
    : isLive
      ? "live"
      : sessionReady
        ? "prep"
        : "lobby";

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
          "We resumed your earlier sitting — prep matches that earlier cold open.",
        );
      } else {
        toast.success("Session ready — connect when you want to talk");
      }
      setTalkStatus("When you're ready, start talking or type your answer.");
    },
    onError: () => {
      toast.error(
        "Could not prepare questions. Wait a minute and try again.",
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

  function handleExit() {
    disconnect();
    onExit();
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
    setTalkStatus(null);
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
        const ans = normalizeVoiceTranscript(
          reviewDrafts[q.question_key] ?? q.answer_text ?? "",
        );
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
      disconnect();
      await refreshSavedWords();
      toast.success("Saved to Your words");
      handleExit();
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
        setTalkStatus("Saved. Take your time on the next question.");
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
        "No active interview. Prepare the session again or start a fresh sitting.",
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
            setTalkStatus("All questions captured — review next.");
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
      setTalkStatus("Listening… edit the text anytime, then Save & next.");
    } catch {
      toast.error(
        "Could not connect to voice. Check that the voice server is running locally.",
      );
      setTalkStatus(null);
    }
  }

  return (
    <TalkSessionView
      brandName={profile.business_name}
      phase={phase}
      coldOpen={coldOpen}
      onColdOpenChange={setColdOpen}
      prepBrief={prepBrief}
      questionText={effectiveQuestionText}
      voiceDraft={voiceDraft}
      onVoiceDraftChange={setVoiceDraft}
      talkStatus={talkStatus}
      connectionState={connectionState}
      readAloud={readAloud}
      onReadAloudChange={setReadAloud}
      reviewSession={reviewSession}
      reviewDrafts={reviewDrafts}
      onReviewDraftChange={(key, value) =>
        setReviewDrafts((prev) => ({ ...prev, [key]: value }))
      }
      session={session}
      isPreparing={startMutation.isPending}
      isSavingStep={isSavingStep}
      isFinishing={isFinishing}
      canSaveStep={canSaveStep}
      sessionReady={sessionReady}
      onExit={handleExit}
      onPrepare={() => startMutation.mutate({ forceNew: false })}
      onStartNewSitting={() => {
        disconnect();
        setTalkStatus(null);
        startMutation.mutate({ forceNew: true });
      }}
      onConnectTalk={() => void onConnectTalk()}
      onSaveAndNext={() => void onSaveAndNextQuestion()}
      onStopMic={() => {
        disconnect();
        setTalkStatus("Mic off — you can still type and save.");
      }}
      onFinishReview={() => void finishReview()}
    />
  );
}
