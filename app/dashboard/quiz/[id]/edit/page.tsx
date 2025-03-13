// db
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// sections
import QuizNewEdit from "@/sections/dashboard/quiz/new-edit-form";

// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function QuizEditPage({
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

  return <QuizNewEdit isEdit quiz={quiz} />;
}
