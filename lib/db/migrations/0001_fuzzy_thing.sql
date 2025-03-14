CREATE TYPE "public"."timer_mode" AS ENUM('quiz', 'question');--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "timer_mode" timer_mode DEFAULT 'quiz' NOT NULL;