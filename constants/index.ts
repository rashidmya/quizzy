export const TIMER_MODES = ["none", "global", "question"] as const;

export const QUESTION_TYPES = [
  "multiple_choice",
  "true_false",
  "fill_in_blank",
  "short_answer"
] as const;

export const QUIZ_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "paused",
  "ended",
] as const;
