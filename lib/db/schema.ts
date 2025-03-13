import { QUESTION_TYPES } from "@/types/question";
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

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
  // Timer for the whole quiz in seconds (optional)
  timer: integer("timer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const questionTypeEnum = pgEnum("question_type", QUESTION_TYPES);

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),
  text: varchar("text", { length: 1024 }).notNull(),
  type: questionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  timer: integer("timer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const choices = pgTable("choices", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id").references(() => questions.id, {
    onDelete: "cascade",
  }),
  text: varchar("text", { length: 1024 }).notNull(),
  // Mark the correct choice (if needed)
  isCorrect: boolean("is_correct").default(false).notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  quizId: uuid("quiz_id").references(() => quizzes.id),
  // Score that the user achieved in the quiz attempt
  score: integer("score").notNull(),
  takenAt: timestamp("taken_at").defaultNow().notNull(),
});
