export type InterviewQuestionStep = {
  question_key: string;
  question_text: string;
  answer_text: string;
  source: string;
  answered: boolean;
};

export type InterviewSession = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  status: string;
  prep_brief: string;
  questions: InterviewQuestionStep[];
  transcript: string;
  follow_up_used: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
};

export type InterviewSessionResponse = {
  success: boolean;
  interview_session: InterviewSession;
  stt_available?: boolean;
  resumed?: boolean;
};

export type ActiveInterviewSessionResponse = {
  success: boolean;
  interview_session: InterviewSession | null;
  stt_available?: boolean;
};

export type TranscribeInterviewResponse = {
  success: boolean;
  transcript_text: string;
};

export type VoiceStudy = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  keep_items: string[];
  raise_items: string[];
  source_summary: string;
  created_at?: string;
};

export type VoiceStudyResponse = {
  success: boolean;
  voice_study: VoiceStudy | null;
  corpus_count?: number;
};

export type DraftTopic = {
  topic: string;
  source: string;
  question_key: string | null;
};

export type DraftTopicsResponse = {
  success: boolean;
  topics: DraftTopic[];
  ready: boolean;
};

export type DraftGenerateRequest = {
  user_id: string;
  topic: string;
  platform: string;
  description?: string;
};

export type ChannelPreference = {
  id: string;
  platform: string;
  tone_notes: string;
  length_notes: string;
  hashtag_notes: string;
};
