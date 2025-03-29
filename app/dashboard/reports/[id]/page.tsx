import { notFound } from "next/navigation";

import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
import { getQuizAttemptsByQuizId } from "@/lib/db/queries/quizzes";

import ReportView from "@/sections/@dashboard/report/view";

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
  const attempts = await getQuizAttemptsByQuizId(id);

  if (!quiz) {
    return notFound();
  }

  return <ReportView quiz={quiz} attempts={attempts} />;
}
