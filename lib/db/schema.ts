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
  jsonb,
} from "drizzle-orm/pg-core";

export const timerModeEnum = pgEnum("timer_modes", TIMER_MODES);
export const questionTypeEnum = pgEnum("question_type", QUESTION_TYPES);
export const quizStatusEnum = pgEnum("quiz_status", QUIZ_STATUSES);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 30 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id")
    .references(() => quizzes.id, { onDelete: "cascade" })
    .notNull(),
  text: varchar("text", { length: 1024 }).notNull(),
  type: questionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  timer: integer("timer"),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const choices = pgTable("choices", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => questions.id, {
      onDelete: "cascade",
    })
    .notNull(),
  text: varchar("text", { length: 1024 }).notNull(),
  isCorrect: boolean("is_correct").default(false).notNull(),
});

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

export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id")
    .references(() => quizAttempts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id, {
      onDelete: "cascade",
    })
    .notNull(),
  answer: uuid("answer").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
