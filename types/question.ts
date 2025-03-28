import { questions } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Question = InferSelectModel<typeof questions>;

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_in_blank"
  | "short_answer";