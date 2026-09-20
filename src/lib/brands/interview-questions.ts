export type InterviewQuestionKey =
  | "customers_get_wrong"
  | "changed_my_mind"
  | "unpublished_advice"
  | "customer_sentence"
  | "industry_disagree";

export type InterviewQuestionDefinition = {
  key: InterviewQuestionKey;
  label: string;
  helper: string;
};

export const INTERVIEW_QUESTIONS: InterviewQuestionDefinition[] = [
  {
    key: "customers_get_wrong",
    label: "What do customers get wrong about you?",
    helper: "The misunderstanding you hear again and again.",
  },
  {
    key: "changed_my_mind",
    label: "What have you changed your mind about?",
    helper: "Something you used to believe and no longer do.",
  },
  {
    key: "unpublished_advice",
    label: "What advice do you give that you have never posted?",
    helper: "What you tell people in the room, not on the feed.",
  },
  {
    key: "customer_sentence",
    label: "Quote one sentence a real customer said about the problem",
    helper: "Their words, not a polished tagline.",
  },
  {
    key: "industry_disagree",
    label: "What does the industry say that you disagree with?",
    helper: "The take you would push back on in public.",
  },
];
