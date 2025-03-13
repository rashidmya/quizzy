import Link from "next/link";
// components
import { Button } from "@/components/ui/button";
// db
import { getQuizWithQuestions } from "@/lib/db/queries/quizzes";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
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

  return (
    <div className="min-h-screen p-8">
      <div>
        <div className="mb-4">
          <Button variant="link" asChild>
            <Link href={PATH_DASHBOARD.quiz.view(id)}>Back</Link>
          </Button>
        </div>

        <div className="mt-22">
          <QuizNewEdit isEdit quiz={quiz} />
        </div>
      </div>
    </div>
  );
}
