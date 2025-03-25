// queries
import {
  getQuizWithQuestions,
} from "@/lib/db/queries/quizzes";
// sections
import QuizView from "@/sections/dashboard/quiz/view";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function QuizViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quiz = await getQuizWithQuestions(id);

  if (!quiz)
    return (
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
        Quiz not found
      </h1>
    );

  return <QuizView quiz={quiz} />;
}
