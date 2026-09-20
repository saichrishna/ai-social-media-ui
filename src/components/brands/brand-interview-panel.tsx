"use client";

import { useRef, useState } from "react";
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
  completeInterviewSession,
  getActiveInterviewSession,
  saveInterviewStepAnswer,
  startInterviewSession,
  transcribeInterviewAudio,
} from "@/lib/api/brand-dna";
import { USER_SAFE_ERROR_MESSAGE } from "@/lib/api/client";
import { useUserId } from "@/lib/auth";
import type { BrandProfile } from "@/types/brand";
import type { InterviewQuestionStep } from "@/types/brand-dna";

function nextQuestion(
  questions: InterviewQuestionStep[] | undefined,
): InterviewQuestionStep | null {
  if (!questions) {
    return null;
  }
  return questions.find((question) => !question.answered) ?? null;
}

export function BrandInterviewPanel({
  profile,
}: {
  profile: BrandProfile;
}) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const profileId = profile.id;

  const [coldOpen, setColdOpen] = useState("");

  const sessionQuery = useQuery({
    queryKey: ["brand-interview-session", profileId, userId],
    queryFn: () => getActiveInterviewSession(profileId, userId!),
    enabled: Boolean(userId && profileId),
  });

  const session = sessionQuery.data?.interview_session ?? null;
  const sttAvailable = sessionQuery.data?.stt_available ?? false;
  const current = nextQuestion(session?.questions);

  const startMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("missing user");
      }
      return startInterviewSession(
        profileId,
        userId,
        coldOpen.trim(),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-interview-session", profileId],
      });
      toast.success("Interview started");
    },
    onError: () => toast.error(USER_SAFE_ERROR_MESSAGE),
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !session) {
        throw new Error("missing session");
      }
      return completeInterviewSession(
        profileId,
        session.id,
        userId,
        session.transcript ?? "",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brand-interview-session", profileId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["brand-voice-samples", profileId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["brand-interview-answers", profileId],
      });
      toast.success("Interview saved to your words");
    },
    onError: () => toast.error(USER_SAFE_ERROR_MESSAGE),
  });

  if (sessionQuery.isLoading) {
    return null;
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talk (optional)</CardTitle>
          <CardDescription>
            In one breath, who do you help? We prepare specific questions from
            that — no generic script.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={coldOpen}
            onChange={(event) => setColdOpen(event.target.value)}
            placeholder="We help new parents who…"
            rows={3}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={startMutation.isPending || !coldOpen.trim()}
            onClick={() => startMutation.mutate()}
          >
            {startMutation.isPending ? "Preparing…" : "Start talk"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allAnswered = !current;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Talk session</CardTitle>
        {session.prep_brief ? (
          <CardDescription>{session.prep_brief}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {current && session && userId ? (
          <InterviewStepAnswer
            key={current.question_key}
            profileId={profileId}
            sessionId={session.id}
            userId={userId}
            questionKey={current.question_key}
            questionText={current.question_text}
            initialAnswer={current.answer_text ?? ""}
            sttAvailable={sttAvailable}
            onSaved={() => {
              void queryClient.invalidateQueries({
                queryKey: ["brand-interview-session", profileId],
              });
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            All prepared questions answered.
          </p>
        )}

        {allAnswered ? (
          <Button
            type="button"
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending ? "Saving…" : "That’s me — finish talk"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function InterviewStepAnswer({
  profileId,
  sessionId,
  userId,
  questionKey,
  questionText,
  initialAnswer,
  sttAvailable,
  onSaved,
}: {
  profileId: string;
  sessionId: string;
  userId: string;
  questionKey: string;
  questionText: string;
  initialAnswer: string;
  sttAvailable: boolean;
  onSaved: () => void;
}) {
  const [answerDraft, setAnswerDraft] = useState(initialAnswer);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const answerMutation = useMutation({
    mutationFn: async (source: "type" | "audio") => {
      return saveInterviewStepAnswer(
        profileId,
        sessionId,
        userId,
        questionKey,
        answerDraft.trim(),
        source,
      );
    },
    onSuccess: () => {
      setAnswerDraft("");
      onSaved();
    },
    onError: () => toast.error(USER_SAFE_ERROR_MESSAGE),
  });

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Recording is not supported in this browser.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      try {
        const result = await transcribeInterviewAudio(
          profileId,
          sessionId,
          userId,
          blob,
        );
        setAnswerDraft(result.transcript_text);
      } catch {
        toast.error(
          "Could not transcribe. Type your answer or install local STT on the server.",
        );
      }
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <>
      <p className="text-sm font-medium">{questionText}</p>
      <Textarea
        value={answerDraft}
        onChange={(event) => setAnswerDraft(event.target.value)}
        rows={4}
        placeholder="Answer in your own words"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={answerMutation.isPending || !answerDraft.trim()}
          onClick={() => answerMutation.mutate("type")}
        >
          Save answer
        </Button>
        {sttAvailable ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (recording) {
                stopRecording();
              } else {
                void startRecording();
              }
            }}
          >
            {recording ? "Stop recording" : "Record answer"}
          </Button>
        ) : (
          <span className="self-center text-xs text-muted-foreground">
            Local STT not configured — type or use browser dictation.
          </span>
        )}
      </div>
    </>
  );
}
