import { notFound } from "next/navigation";

import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";

export const dynamic = "force-static";

export default async function QuizReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // Fetch quiz data and attempts data
  const quiz = await getQuizWithQuestions(id);

  if (!quiz) {
    return notFound();
  }

  return <>nothing to see here</>;
}
