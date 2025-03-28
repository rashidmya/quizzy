import { multipleChoiceDetails } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Choice = InferSelectModel<typeof multipleChoiceDetails>;