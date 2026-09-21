import { apiFetch } from "@/lib/api/client";
import type { GenerateSocialContentResponse } from "@/types/post";
import type {
  ActiveInterviewSessionResponse,
  DraftGenerateRequest,
  DraftTopicsResponse,
  InterviewSessionResponse,
  TranscribeInterviewResponse,
  VoiceStudyResponse,
} from "@/types/brand-dna";

export const DRAFT_GENERATE_TIMEOUT_MS = 5 * 60 * 1000;

/** Ollama prep for interview questions can exceed the default 20s client timeout. */
export const INTERVIEW_SESSION_TIMEOUT_MS = 3 * 60 * 1000;

export async function startInterviewSession(
  profileId: string,
  userId: string,
  coldOpenAnswer: string,
  options?: { forceNew?: boolean; mode?: "full" | "mini" },
): Promise<InterviewSessionResponse> {
  const forceNew = options?.forceNew ? "&force_new=true" : "";
  return apiFetch<InterviewSessionResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-sessions?user_id=${encodeURIComponent(userId)}${forceNew}`,
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        cold_open_answer: coldOpenAnswer,
        mode: options?.mode ?? "full",
      }),
      timeoutMs: INTERVIEW_SESSION_TIMEOUT_MS,
    },
  );
}

export async function getActiveInterviewSession(
  profileId: string,
  userId: string,
): Promise<ActiveInterviewSessionResponse> {
  return apiFetch<ActiveInterviewSessionResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-sessions/active?user_id=${encodeURIComponent(userId)}`,
  );
}

export async function saveInterviewStepAnswer(
  profileId: string,
  sessionId: string,
  userId: string,
  questionKey: string,
  answerText: string,
  source: "type" | "audio",
): Promise<InterviewSessionResponse & { next_question?: unknown }> {
  return apiFetch(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-sessions/${encodeURIComponent(sessionId)}/answer?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        question_key: questionKey,
        answer_text: answerText,
        source,
      }),
    },
  );
}

export async function transcribeInterviewAudio(
  profileId: string,
  sessionId: string,
  userId: string,
  audioBlob: Blob,
  filename = "recording.webm",
): Promise<TranscribeInterviewResponse> {
  const form = new FormData();
  form.append("file", audioBlob, filename);

  const path = `/brand-profiles/${encodeURIComponent(profileId)}/interview-sessions/${encodeURIComponent(sessionId)}/transcribe?user_id=${encodeURIComponent(userId)}`;

  const response = await fetch(path, {
    method: "POST",
    body: form,
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("transcribe failed");
  }

  return (await response.json()) as TranscribeInterviewResponse;
}

export async function completeInterviewSession(
  profileId: string,
  sessionId: string,
  userId: string,
  transcript: string,
): Promise<InterviewSessionResponse> {
  return apiFetch<InterviewSessionResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/interview-sessions/${encodeURIComponent(sessionId)}/complete?user_id=${encodeURIComponent(userId)}`,
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        transcript,
      }),
    },
  );
}

export async function runVoiceStudy(
  profileId: string,
  userId: string,
): Promise<VoiceStudyResponse> {
  return apiFetch<VoiceStudyResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/voice-study?user_id=${encodeURIComponent(userId)}`,
    { method: "POST" },
  );
}

export async function getLatestVoiceStudy(
  profileId: string,
  userId: string,
): Promise<VoiceStudyResponse> {
  return apiFetch<VoiceStudyResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/voice-study/latest?user_id=${encodeURIComponent(userId)}`,
  );
}

export async function getDraftTopics(
  profileId: string,
  userId: string,
): Promise<DraftTopicsResponse> {
  return apiFetch<DraftTopicsResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/draft-topics?user_id=${encodeURIComponent(userId)}`,
  );
}

export async function generateBrandDraft(
  profileId: string,
  body: DraftGenerateRequest,
): Promise<GenerateSocialContentResponse> {
  return apiFetch<GenerateSocialContentResponse>(
    `/brand-profiles/${encodeURIComponent(profileId)}/draft-generate`,
    {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: DRAFT_GENERATE_TIMEOUT_MS,
    },
  );
}
