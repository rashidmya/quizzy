import { QUESTION_TYPES, QUIZ_STATUSES, TIMER_MODES } from "@/constants";
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const timerModeEnum = pgEnum("timer_modes", TIMER_MODES);
export const questionTypeEnum = pgEnum("question_type", QUESTION_TYPES);
export const quizStatusEnum = pgEnum("quiz_status", QUIZ_STATUSES);

/**
 * Users table.
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 30 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Quizzes table.
 */
export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 80 }).notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  status: quizStatusEnum("status").notNull().default("draft"),
  scheduledAt: timestamp("scheduled_at"),
  endedAt: timestamp("ended_at"),
  timerMode: timerModeEnum("timer_mode").notNull().default("global"),
  timer: integer("timer"),
  shuffleQuestions: boolean("shuffle_questions").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Base Questions table.
 * Contains fields common to all question types.
 */
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 1024 }).notNull(),
  type: questionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  timer: integer("timer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Multiple-Choice Questions Details.
 * (Existing mechanism via the choices table.)
 */
export const multipleChoiceDetails = pgTable("choices", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 1024 }).notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
});

/**
 * True/False Questions Details.
 * Stores additional data for true/false questions.
 */
export const trueFalseDetails = pgTable("true_false_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
  // Optional explanation or hint.
  explanation: varchar("explanation", { length: 1024 }),
});

/**
 * Fill-in-the-Blank Questions Details.
 * Stores the correct answer and optionally accepted variations.
 */
export const fillInBlankDetails = pgTable("fill_in_blank_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
  // Correct answer is required.
  correctAnswer: varchar("correct_answer", { length: 1024 }).notNull(),
  // Optionally, store accepted answers as a comma-separated string or JSON if needed.
  acceptedAnswers: varchar("accepted_answers", { length: 1024 }),
});

/**
 * Open-Ended Questions Details.
 * Stores guidelines, expected keywords, or sample answers.
 */
export const openEndedDetails = pgTable("open_ended_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
  // Guidelines or sample answer for open-ended questions.
  guidelines: varchar("guidelines", { length: 1024 }),
});

/**
 * Quiz Attempts table.
 */
export const quizAttempts = pgTable(
  "quiz_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 30 }).notNull(),
    quizId: uuid("quiz_id")
      .references(() => quizzes.id, { onDelete: "cascade" })
      .notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    takenAt: timestamp("taken_at").defaultNow().notNull(),
    submitted: boolean("submitted").notNull().default(false),
  },
  (t) => [uniqueIndex("unique_attempt").on(t.quizId, t.email)]
);

/**
 * Unified Attempt Answers table.
 */
export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .references(() => quizAttempts.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  // The answer can be stored in a flexible format (e.g., UUID reference for multiple-choice, text for others)
  answer: varchar("answer", { length: 1024 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
