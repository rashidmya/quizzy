import { z } from "zod";
import { TIMER_MODES } from "@/constants";

// Schema for multiple choice questions
export const multipleChoiceSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  type: z.literal("multiple_choice"),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .max(10, { message: "Maximum 10 points allowed" })
    .default(1),
  choices: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1, { message: "Choice text is required" }),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, { message: "At least two choices are required" })
    .refine((choices) => choices.some((choice) => choice.isCorrect), {
      message: "At least one choice must be marked as correct",
    }),
});

// Schema for true/false questions
export const trueFalseSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  type: z.literal("true_false"),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .max(10, { message: "Maximum 10 points allowed" })
    .default(1),
  correctAnswer: z.boolean().default(true),
  explanation: z.string().optional(),
});

// Schema for fill in the blank questions
export const fillInBlankSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  type: z.literal("fill_in_blank"),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .max(10, { message: "Maximum 10 points allowed" })
    .default(1),
  correctAnswer: z.string().min(1, { message: "Correct answer is required" }),
  acceptedAnswers: z.string().optional(),
});

// Schema for open-ended questions
export const openEndedSchema = z.object({
  id: z.string().optional(),
  text: z
    .string()
    .min(5, { message: "Question text is required (min 5 characters)" }),
  type: z.literal("open_ended"),
  timer: z
    .number()
    .min(0, { message: "Timer must be non-negative" })
    .optional(),
  points: z
    .number()
    .min(1, { message: "At least 1 point is required" })
    .max(10, { message: "Maximum 10 points allowed" })
    .default(1),
  guidelines: z.string().optional(),
});

// Combined question schema using discriminated union
export const questionSchema = z.discriminatedUnion("type", [
  multipleChoiceSchema,
  trueFalseSchema,
  fillInBlankSchema,
  openEndedSchema,
]);

// Full quiz form schema
export const quizFormSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title is required (min 4 characters)" })
    .max(80, { message: "Title must be at most 80 characters" })
    .default("Untitled Quiz"),
  timerMode: z.enum(TIMER_MODES).default("none"),
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
  timer: z
    .number()
    .min(60, { message: "Timer must be at least 60 seconds" })
    .optional(),
  shuffleQuestions: z.boolean().default(false),
});
