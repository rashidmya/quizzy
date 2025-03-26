import { choices } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Choice = InferSelectModel<typeof choices>;