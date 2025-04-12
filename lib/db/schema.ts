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
 * Stores answer options for multiple-choice questions.
 */
export const multipleChoiceDetails = pgTable("multiple_choice_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 1024 }).notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
});

/**
 * True/False Questions Details.
 * Stores the correct answer (true or false) and an optional explanation.
 */
export const trueFalseDetails = pgTable("true_false_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
  correctAnswer: boolean("correct_answer").notNull(),
  explanation: varchar("explanation", { length: 1024 }),
});

/**
 * Fill-in-the-Blank Questions Details.
 * Stores the correct answer and optionally accepted answers.
 */
export const fillInBlankDetails = pgTable("fill_in_blank_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
  correctAnswer: varchar("correct_answer", { length: 1024 }).notNull(),
  acceptedAnswers: varchar("accepted_answers", { length: 1024 }),
});

/**
 * Open-Ended Questions Details.
 * Stores guidelines or sample answers for open-ended questions.
 */
export const openEndedDetails = pgTable("open_ended_details", {
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .primaryKey(),
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
 * The answer column is flexible:
 * - For multiple choice, store the ID of the selected option (from multiple_choice_details).
 * - For true/false, store a boolean as a string.
 * - For fill-in-the-blank and open-ended, store text.
 */
export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .references(() => quizAttempts.id, { onDelete: "cascade" })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  answer: varchar("answer", { length: 1024 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
