import Link from "next/link";
// components
import { Button } from "@/components/ui/button";
// db
import { getQuizWithQuestions} from "@/lib/queries/quizzes";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
// sections
import QuizEdit from "@/sections/dashboard/quiz/quiz-edit";


// This will be replaced by 'use cache' soon
export const dynamic = "force-static";

export default async function Page({
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
      <main>
        <div className="mb-4 justify-between">
          <Button variant='link' asChild>
            <Link href={PATH_DASHBOARD.quiz.root}>Back</Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-4 text-center text-gray-100">
          Modify Quiz
        </h1>
        <div className="mt-22">
          <QuizEdit quiz={quiz} />
        </div>
      </main>
    </div>
  );
}
